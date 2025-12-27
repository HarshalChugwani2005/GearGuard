from datetime import datetime, timezone
from typing import Dict, List
from .db import pool


class MaintenanceRepository:
    @staticmethod
    def get_kanban_board() -> Dict[str, List[dict]]:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, subject, status, priority, equipment_id FROM maintenance_requests"
                )
                rows = cur.fetchall()
                board = {"New": [], "In Progress": [], "Repaired": [], "Scrap": []}
                for r in rows:
                    board[r[2]].append({"id": r[0], "subject": r[1], "priority": r[3]})
                return board

    @staticmethod
    def update_status(request_id: int, new_status: str) -> None:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE maintenance_requests SET status = %s WHERE id = %s",
                    (new_status, request_id),
                )
                conn.commit()

    @staticmethod
    def live_snapshot() -> dict:
        board = MaintenanceRepository.get_kanban_board()
        return {"server_time": datetime.now(timezone.utc), "board": board}


class EquipmentRepository:
    @staticmethod
    def get_health_scores() -> List[dict]:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT name, health_score, is_functional FROM equipment_health_report"
                )
                rows = cur.fetchall()
                return [
                    {"name": r[0], "score": float(r[1]), "status": r[2]}
                    for r in rows
                ]
