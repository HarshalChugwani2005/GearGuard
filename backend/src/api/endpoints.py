from fastapi import APIRouter, HTTPException
from src.models.repository import MaintenanceRepository, EquipmentRepository
from src.models.schemas import (
    StatusUpdate,
    MaintenanceBoard,
    MaintenanceSnapshot,
    EquipmentHealth,
)

router = APIRouter()


@router.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}


@router.get("/kanban", response_model=MaintenanceBoard, tags=["maintenance"])
def get_kanban():
    board = MaintenanceRepository.get_kanban_board()
    return {"board": board}


@router.get(
    "/maintenance/live",
    response_model=MaintenanceSnapshot,
    tags=["maintenance"],
    summary="Near-realtime maintenance snapshot",
)
def maintenance_live():
    snapshot = MaintenanceRepository.live_snapshot()
    return snapshot


@router.put("/maintenance/{request_id}/status", tags=["maintenance"])
def update_status(request_id: int, payload: StatusUpdate):
    try:
        MaintenanceRepository.update_status(request_id, payload.status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"success": True}


@router.get(
    "/equipment/health",
    response_model=list[EquipmentHealth],
    tags=["equipment"],
)
def equipment_health():
    rows = EquipmentRepository.get_health_scores()
    return [EquipmentHealth(**row) for row in rows]
