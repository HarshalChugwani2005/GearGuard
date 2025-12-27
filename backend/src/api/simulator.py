"""Simple background simulator that feeds 2-3 maintenance rows every interval to mimic realtime.

Configuration via env vars:
- SIM_ENABLE=1 to turn on
- SIM_DATA_PATH=/path/to/data.csv (optional; if absent, uses synthetic rows)
- SIM_INTERVAL_SECONDS=20 (default 20)
"""

import asyncio
import csv
import os
import random
from pathlib import Path
from typing import List, Dict, Any

from src.models.repository import MaintenanceRepository


def _load_csv_rows(csv_path: Path) -> List[Dict[str, Any]]:
    if not csv_path.exists():
        return []
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def _pick_batch(rows: List[Dict[str, Any]], batch_size: int) -> List[Dict[str, Any]]:
    if not rows:
        return []
    return random.sample(rows, min(batch_size, len(rows)))


def _row_to_request(row: Dict[str, Any]) -> Dict[str, Any]:
    # Handle general maintenance-like rows with subject/priority
    subject = row.get("subject") or row.get("issue") or row.get("title")
    priority = row.get("priority") or row.get("severity") or None
    status = row.get("status") or "New"

    # Map sensor-style rows like equipment_anomaly_data.csv
    if not subject:
        equipment = row.get("equipment") or row.get("machine") or "Equipment"
        location = row.get("location") or row.get("site") or ""
        faulty = row.get("faulty")
        try:
            faulty_val = int(faulty) if faulty not in (None, "") else 0
        except ValueError:
            faulty_val = 0
        severity = "Critical" if faulty_val == 1 else "Low"
        subject = f"{equipment} anomaly" + (f" at {location}" if location else "")
        priority = priority or severity
        status = "New"

        # Build a brief description from sensor metrics if present
        metrics = []
        for key in ("temperature", "pressure", "vibration", "humidity"):
            if key in row:
                metrics.append(f"{key}={row[key]}")
        description = row.get("description") or ", ".join(metrics) or "Simulated ingestion"
    else:
        description = row.get("description") or row.get("details") or "Simulated ingestion"

    equipment_id = row.get("equipment_id")
    try:
        equipment_id = int(equipment_id) if equipment_id not in (None, "") else None
    except ValueError:
        equipment_id = None

    return {
        "subject": subject,
        "status": status,
        "priority": priority,
        "equipment_id": equipment_id,
        "description": description,
    }


def _synthetic_rows() -> List[Dict[str, Any]]:
    templates = [
        {"subject": "High vibration detected", "priority": "High", "status": "New"},
        {"subject": "Overheat warning", "priority": "Critical", "status": "New"},
        {"subject": "Oil level low", "priority": "Medium", "status": "New"},
        {"subject": "Bearing anomaly", "priority": "High", "status": "New"},
    ]
    return templates


async def run_simulator(stop_event: asyncio.Event):
    if os.getenv("SIM_ENABLE") not in ("1", "true", "True"):  # opt-in
        return

    interval = int(os.getenv("SIM_INTERVAL_SECONDS", "20"))
    csv_path_env = os.getenv("SIM_DATA_PATH")
    rows = _synthetic_rows()
    if csv_path_env:
        csv_rows = _load_csv_rows(Path(csv_path_env))
        if csv_rows:
            rows = csv_rows

    while not stop_event.is_set():
        batch_size = random.randint(2, 3)
        batch = _pick_batch(rows, batch_size)
        if not batch:
            batch = _synthetic_rows()
        for row in batch:
            payload = _row_to_request(row)
            try:
                MaintenanceRepository.insert_request(
                    subject=payload["subject"],
                    status=payload["status"],
                    priority=payload.get("priority"),
                    equipment_id=payload.get("equipment_id"),
                    description=payload.get("description"),
                )
            except Exception as e:
                # Log and continue; avoid crashing the simulator
                print(f"Simulator insert failed: {e}")
        await asyncio.sleep(interval)
