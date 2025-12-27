from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class StatusUpdate(BaseModel):
    status: str = Field(..., description="New status for a maintenance request")


class MaintenanceCard(BaseModel):
    id: int
    subject: str
    priority: Optional[str] = None


class MaintenanceBoard(BaseModel):
    board: Dict[str, List[MaintenanceCard]]


class MaintenanceSnapshot(BaseModel):
    server_time: datetime
    board: Dict[str, List[MaintenanceCard]]


class EquipmentHealth(BaseModel):
    name: str
    score: float
    status: str
