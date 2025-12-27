import os
from pathlib import Path
from psycopg_pool import ConnectionPool
from dotenv import load_dotenv, find_dotenv

# Load environment variables from nearest .env or backend/.env
found = find_dotenv()
if found:
    load_dotenv(found, override=False)
backend_env = Path(__file__).resolve().parents[2] / ".env"
if backend_env.exists():
    load_dotenv(backend_env, override=False)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set; configure backend/.env")

# Neon requires sslmode=require (included in the URL)
pool = ConnectionPool(conninfo=DATABASE_URL, min_size=1, max_size=10)


def get_conn():
    """Acquire a pooled connection."""
    return pool.connection()


def get_db_conn():
    """Dependency-style context manager for FastAPI."""
    with pool.connection() as conn:
        yield conn
