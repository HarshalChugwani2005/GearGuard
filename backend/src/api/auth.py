from fastapi import APIRouter, HTTPException, Header, Depends, Query
from typing import Optional, List
from src.models.auth_repository import UserRepository, TaskRepository, ReportRepository
from src.models.auth_schemas import UserCreate, UserLogin, TokenResponse, UserOut, TaskAssignment, EquipmentFailureReport

auth_router = APIRouter()


@auth_router.post("/register", response_model=TokenResponse, tags=["auth"])
def register(user_data: UserCreate):
    """Register a new user"""
    user = UserRepository.create_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        role=user_data.role,
        department=user_data.department,
    )
    if not user:
        raise HTTPException(status_code=400, detail="User already exists or registration failed")

    token = UserRepository.create_session(user["id"])
    return TokenResponse(access_token=token, user=UserOut(**user))


@auth_router.post("/login", response_model=TokenResponse, tags=["auth"])
def login(credentials: UserLogin):
    """Login user"""
    user = UserRepository.authenticate_user(credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = UserRepository.create_session(user["id"])
    return TokenResponse(access_token=token, user=UserOut(**user))


@auth_router.get("/me", response_model=UserOut, tags=["auth"])
def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current logged-in user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    user = UserRepository.get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return UserOut(**user)


@auth_router.post("/admin/assign-task", tags=["admin"])
def assign_task(task: TaskAssignment, authorization: Optional[str] = Header(None)):
    """Admin assigns a maintenance task to a user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    current_user = UserRepository.get_user_by_token(token)
    if not current_user or current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    TaskRepository.assign_task(
        maintenance_request_id=task.maintenance_request_id,
        assigned_to_user_id=task.assigned_to_user_id,
        assigned_by_user_id=current_user["id"],
        department=task.department,
        due_date=task.due_date,
        notes=task.notes,
    )
    return {"success": True, "message": "Task assigned successfully"}


@auth_router.get("/my-tasks", tags=["tasks"])
def get_my_tasks(authorization: Optional[str] = Header(None)):
    """Get tasks assigned to current user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    current_user = UserRepository.get_user_by_token(token)
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid token")

    tasks = TaskRepository.get_user_tasks(current_user["id"])
    return tasks


@auth_router.get("/reports/failures", response_model=List[EquipmentFailureReport], tags=["reports"])
def equipment_failure_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
):
    """Generate equipment failure report (filtered by date range)"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    current_user = UserRepository.get_user_by_token(token)
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid token")

    report = ReportRepository.get_equipment_failure_report(start_date, end_date)
    return report
