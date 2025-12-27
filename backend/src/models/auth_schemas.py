from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: str = "viewer"
    department: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TaskAssignment(BaseModel):
    maintenance_request_id: int
    assigned_to_user_id: int
    department: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None


class EquipmentFailureReport(BaseModel):
    equipment_id: int
    equipment_name: str
    failure_count: int
    total_downtime_hours: float
    last_failure_date: Optional[str] = None
