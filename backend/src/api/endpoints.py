from fastapi import APIRouter, HTTPException, Header, Depends
from src.models.repository import MaintenanceRepository, EquipmentRepository
from src.models.schemas import (
    StatusUpdate,
    MaintenanceBoard,
    MaintenanceSnapshot,
    EquipmentHealth,
)

router = APIRouter()


def require_role(allowed: list[str]):
    async def checker(x_user_role: str | None = Header(None)):
        role = (x_user_role or "viewer").lower()
        if role not in {r.lower() for r in allowed}:
            raise HTTPException(status_code=403, detail="Forbidden")
        return role

    return checker


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


@router.get("/maintenance-requests", tags=["maintenance"])
def list_requests(role: str = Depends(require_role(["viewer", "technician", "admin"]))):
    return MaintenanceRepository.list_requests()


@router.put("/maintenance/{request_id}/status", tags=["maintenance"])
def update_status(request_id: int, payload: StatusUpdate, role: str = Depends(require_role(["technician", "admin"]))):
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
