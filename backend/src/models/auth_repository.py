import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from .db import pool


class UserRepository:
    @staticmethod
    def hash_password(password: str) -> str:
        """Simple password hashing (use bcrypt in production)"""
        return hashlib.sha256(password.encode()).hexdigest()

    @staticmethod
    def create_user(email: str, password: str, full_name: str, role: str = "viewer", department: Optional[str] = None) -> Optional[dict]:
        """Register a new user"""
        password_hash = UserRepository.hash_password(password)
        with pool.connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        """
                        INSERT INTO users (email, password_hash, full_name, role, department)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id, email, full_name, role, department, is_active
                        """,
                        (email, password_hash, full_name, role, department),
                    )
                    row = cur.fetchone()
                    conn.commit()
                    if row:
                        return {
                            "id": row[0],
                            "email": row[1],
                            "full_name": row[2],
                            "role": row[3],
                            "department": row[4],
                            "is_active": row[5],
                        }
                except Exception as e:
                    conn.rollback()
                    print(f"User creation error: {e}")
                    return None

    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[dict]:
        """Authenticate user and return user data"""
        password_hash = UserRepository.hash_password(password)
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, email, full_name, role, department, is_active
                    FROM users
                    WHERE email = %s AND password_hash = %s AND is_active = true
                    """,
                    (email, password_hash),
                )
                row = cur.fetchone()
                if row:
                    # Update last login
                    cur.execute("UPDATE users SET last_login = %s WHERE id = %s", (datetime.now(timezone.utc), row[0]))
                    conn.commit()
                    return {
                        "id": row[0],
                        "email": row[1],
                        "full_name": row[2],
                        "role": row[3],
                        "department": row[4],
                        "is_active": row[5],
                    }
                return None

    @staticmethod
    def create_session(user_id: int) -> str:
        """Create a session token for user"""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_sessions (user_id, session_token, expires_at)
                    VALUES (%s, %s, %s)
                    """,
                    (user_id, token, expires_at),
                )
                conn.commit()
        return token

    @staticmethod
    def get_user_by_token(token: str) -> Optional[dict]:
        """Get user by session token"""
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT u.id, u.email, u.full_name, u.role, u.department, u.is_active
                    FROM users u
                    JOIN user_sessions s ON u.id = s.user_id
                    WHERE s.session_token = %s AND s.expires_at > %s AND u.is_active = true
                    """,
                    (token, datetime.now(timezone.utc)),
                )
                row = cur.fetchone()
                if row:
                    return {
                        "id": row[0],
                        "email": row[1],
                        "full_name": row[2],
                        "role": row[3],
                        "department": row[4],
                        "is_active": row[5],
                    }
                return None


class TaskRepository:
    @staticmethod
    def assign_task(maintenance_request_id: int, assigned_to_user_id: int, assigned_by_user_id: int, department: Optional[str], due_date: Optional[str], notes: Optional[str]) -> bool:
        """Admin assigns a task to a user"""
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO task_assignments (maintenance_request_id, assigned_to_user_id, assigned_by_user_id, department, due_date, notes)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (maintenance_request_id, assigned_to_user_id, assigned_by_user_id, department, due_date, notes),
                )
                conn.commit()
        return True

    @staticmethod
    def get_user_tasks(user_id: int) -> List[dict]:
        """Get tasks assigned to a user"""
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT ta.id, ta.maintenance_request_id, mr.subject, mr.status, ta.due_date, ta.notes
                    FROM task_assignments ta
                    JOIN maintenance_requests mr ON ta.maintenance_request_id = mr.id
                    WHERE ta.assigned_to_user_id = %s
                    ORDER BY ta.due_date ASC NULLS LAST
                    """,
                    (user_id,),
                )
                rows = cur.fetchall()
                return [
                    {"id": r[0], "request_id": r[1], "subject": r[2], "status": r[3], "due_date": r[4], "notes": r[5]}
                    for r in rows
                ]


class ReportRepository:
    @staticmethod
    def get_equipment_failure_report(start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[dict]:
        """Generate equipment failure report"""
        with pool.connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT 
                        e.id,
                        e.name,
                        COUNT(ef.id) as failure_count,
                        COALESCE(SUM(ef.downtime_hours), 0) as total_downtime,
                        MAX(ef.failure_date) as last_failure
                    FROM equipment e
                    LEFT JOIN equipment_failures ef ON e.id = ef.equipment_id
                    WHERE 1=1
                """
                params = []
                if start_date:
                    query += " AND ef.failure_date >= %s"
                    params.append(start_date)
                if end_date:
                    query += " AND ef.failure_date <= %s"
                    params.append(end_date)

                query += " GROUP BY e.id, e.name ORDER BY failure_count DESC"

                cur.execute(query, params)
                rows = cur.fetchall()
                return [
                    {
                        "equipment_id": r[0],
                        "equipment_name": r[1],
                        "failure_count": r[2],
                        "total_downtime_hours": float(r[3]),
                        "last_failure_date": r[4].isoformat() if r[4] else None,
                    }
                    for r in rows
                ]
