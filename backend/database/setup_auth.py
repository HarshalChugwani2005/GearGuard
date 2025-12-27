"""
Execute this script to set up authentication tables in Neon DB
Run from project root: python backend/database/setup_auth.py
"""
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from src.models.db import pool

load_dotenv()


def execute_schema():
    """Execute auth_schema.sql on the database"""
    schema_file = Path(__file__).parent / "auth_schema.sql"
    with open(schema_file, "r") as f:
        sql = f.read()

    with pool.connection() as conn:
        with conn.cursor() as cur:
            # Execute the entire schema
            cur.execute(sql)
            conn.commit()
            print("✅ Authentication schema created successfully!")

            # Verify tables were created
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'user_sessions', 'task_assignments', 'equipment_failures')
                ORDER BY table_name;
            """)
            tables = cur.fetchall()
            print("\n📋 Created tables:")
            for table in tables:
                print(f"   - {table[0]}")


if __name__ == "__main__":
    try:
        execute_schema()
    except Exception as e:
        print(f"❌ Error setting up schema: {e}")
        sys.exit(1)
