"""
Standalone Data Loading Script for GearGuard Database
=====================================================
This script loads all missing data into the database tables.
It's a separate file to avoid conflicts with existing codebase.

Tables to load:
- equipment (add more equipment - currently 22)
- pm_data_testing (from CSV - currently 0)
- maintenance_teams (seed data - currently 0)
- maintenance_requests (seed data - currently 0)
- task_assignments (seed data - currently 0)
- equipment_failures (seed data - currently 0)

Already loaded (skipped):
- equipment_anomaly_data (30688 records)
- pm_data_training (2117 records)
- users (2 records)
- user_sessions (5 records)

Usage:
    cd backend
    python3 load_all_data.py
"""

import os
import csv
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random
import hashlib

# Load environment before importing db module
from dotenv import load_dotenv, find_dotenv

found = find_dotenv()
if found:
    load_dotenv(found, override=False)
backend_env = Path(__file__).resolve().parent / ".env"
if backend_env.exists():
    load_dotenv(backend_env, override=False)

from src.models.db import pool

# Paths to CSV files
CSV_DIR = Path(__file__).parent / "CSV"
PM_TESTING_CSV = CSV_DIR / "PM Data Testing.csv"

# ============================================================
# SEED DATA - Indian and American names/locations
# ============================================================

# Indian Names
INDIAN_NAMES = [
    "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sunita Verma", "Vikram Singh",
    "Anita Reddy", "Suresh Iyer", "Kavita Nair", "Rahul Gupta", "Meera Joshi",
    "Arjun Mehta", "Deepika Rao", "Sanjay Mishra", "Pooja Agarwal", "Nikhil Bose"
]

# American Names
AMERICAN_NAMES = [
    "John Smith", "Sarah Johnson", "Michael Davis", "Emily Brown", "James Wilson",
    "Jennifer Martinez", "Robert Anderson", "Lisa Thompson", "William Garcia", "Ashley Miller",
    "David Taylor", "Jessica Moore", "Christopher Lee", "Amanda White", "Daniel Harris"
]

# Indian Locations
INDIAN_LOCATIONS = [
    "Mumbai Plant", "Delhi Factory", "Bangalore Hub", "Chennai Unit", "Hyderabad Works",
    "Pune Facility", "Ahmedabad Center", "Kolkata Station", "Jaipur Workshop", "Coimbatore Plant"
]

# American Locations  
AMERICAN_LOCATIONS = [
    "New York Plant", "Chicago Factory", "Houston Hub", "Phoenix Unit", "Los Angeles Works",
    "San Francisco Facility", "Dallas Center", "Atlanta Station", "Seattle Workshop", "Denver Plant"
]

# Equipment Categories
EQUIPMENT_CATEGORIES = [
    "Turbine", "Compressor", "Pump", "Extruder", "Coil Oven", 
    "Pressure Cutter", "Gauge Machine", "Motor", "Generator", "Conveyor"
]

# Departments
DEPARTMENTS = [
    "Production", "Manufacturing", "Assembly", "Quality Control", "Logistics",
    "Maintenance", "R&D", "Operations"
]


def clear_all_dependent_tables():
    """Clear all tables in correct order to avoid FK violations."""
    print_header("Clearing existing data (respecting FK constraints)")
    
    # Order matters - delete from child tables first
    tables_to_clear = [
        'task_assignments',
        'equipment_failures', 
        'maintenance_requests',
        'user_sessions',
        'equipment',
        'maintenance_teams',
        # 'users',  # Keep existing users
        # Don't clear: equipment_anomaly_data, pm_data_training (already loaded)
    ]
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            for table in tables_to_clear:
                try:
                    cur.execute(f"DELETE FROM {table}")
                    print(f"  ✓ Cleared {table}")
                except Exception as e:
                    print(f"  ✗ Failed to clear {table}: {e}")
            conn.commit()


def print_header(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def load_maintenance_teams():
    """Load maintenance_teams with Indian and American technicians."""
    print_header("Loading MAINTENANCE_TEAMS table")
    
    # Combine Indian and American team data
    teams_data = [
        # Indian Teams
        ("Alpha India", "Rajesh Kumar"),
        ("Beta India", "Priya Sharma"),
        ("Gamma India", "Amit Patel"),
        ("Delta India", "Vikram Singh"),
        ("Epsilon India", "Suresh Iyer"),
        # American Teams
        ("Alpha US", "John Smith"),
        ("Beta US", "Sarah Johnson"),
        ("Gamma US", "Michael Davis"),
        ("Delta US", "James Wilson"),
        ("Epsilon US", "Emily Brown"),
    ]
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            inserted = 0
            for name, technician_name in teams_data:
                cur.execute("""
                    INSERT INTO maintenance_teams (name, technician_name)
                    VALUES (%s, %s)
                """, (name, technician_name))
                inserted += 1
            
            conn.commit()
            print(f"  ✓ Inserted {inserted} maintenance_teams records")


def load_equipment():
    """Load equipment with Indian and American locations."""
    print_header("Loading EQUIPMENT table")
    
    all_locations = INDIAN_LOCATIONS + AMERICAN_LOCATIONS
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            # Get team IDs
            cur.execute("SELECT id FROM maintenance_teams")
            team_ids = [row[0] for row in cur.fetchall()] or [None]
            
            inserted = 0
            
            for category in EQUIPMENT_CATEGORIES:
                # Create 3-5 units per category
                num_units = random.randint(3, 5)
                for unit in range(1, num_units + 1):
                    name = f"{category} Unit {unit}"
                    serial_number = f"SN-{category[:3].upper()}-{random.randint(10000, 99999)}"
                    department = random.choice(DEPARTMENTS)
                    location = random.choice(all_locations)
                    is_functional = random.choices([True, False], weights=[85, 15])[0]
                    purchase_date = datetime.now() - timedelta(days=random.randint(365, 2000))
                    warranty_expiry = purchase_date + timedelta(days=random.randint(365, 1095))
                    team_id = random.choice(team_ids)
                    
                    cur.execute("""
                        INSERT INTO equipment 
                        (name, serial_number, category, department, purchase_date, warranty_expiry, location, team_id, is_functional)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (name, serial_number, category, department, purchase_date.date(), 
                          warranty_expiry.date(), location, team_id, is_functional))
                    inserted += 1
            
            conn.commit()
            print(f"  ✓ Inserted {inserted} equipment records")


def load_pm_data_testing():
    """Load PM Data Testing.csv into pm_data_testing table."""
    print_header("Loading PM_DATA_TESTING table")
    
    if not PM_TESTING_CSV.exists():
        print(f"  ✗ File not found: {PM_TESTING_CSV}")
        return
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM pm_data_testing")
            existing = cur.fetchone()[0]
            
            if existing > 0:
                print(f"  Already has {existing} records. Skipping...")
                return
            
            inserted = 0
            with open(PM_TESTING_CSV, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    try:
                        uid = int(row.get('UID', 0))
                        product_type = row.get('ProductType', '').strip()
                        humidity = float(row.get('Humidity', 0))
                        temperature = float(row.get('Temperature', 0))
                        # Handle 'Age ' with trailing space
                        age = int(row.get('Age ', row.get('Age', 0)))
                        quantity = int(row.get('Quantity', 0))
                        
                        cur.execute("""
                            INSERT INTO pm_data_testing (uid, product_type, humidity, temperature, age, quantity)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (uid, product_type, humidity, temperature, age, quantity))
                        inserted += 1
                    except (ValueError, KeyError) as e:
                        continue
            
            conn.commit()
            print(f"  ✓ Inserted {inserted} pm_data_testing records")


def load_maintenance_requests():
    """Load maintenance_requests with varied data."""
    print_header("Loading MAINTENANCE_REQUESTS table")
    
    # Only 'Preventive' and 'Corrective' are allowed by DB constraint
    request_types = ['Preventive', 'Corrective']
    statuses = ['New', 'In Progress', 'Repaired', 'Scrap']
    
    # Sample maintenance subjects for Preventive
    subjects_preventive = [
        "Routine inspection required",
        "Scheduled lubrication",
        "Annual calibration check",
        "Filter replacement due",
        "Belt tension adjustment",
        "Bearing greasing schedule",
        "Quarterly safety inspection"
    ]
    
    # Sample maintenance subjects for Corrective
    subjects_corrective = [
        "Unusual vibration detected",
        "Temperature warning alert",
        "Pressure anomaly reported",
        "Bearing noise issue",
        "Electrical fault detected",
        "Oil leak observed",
        "Motor overheating",
        "Critical failure - immediate attention",
        "Equipment shutdown required",
        "Safety hazard identified"
    ]
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            # Get equipment and team IDs
            cur.execute("SELECT id, name FROM equipment")
            equipment_list = cur.fetchall()
            
            cur.execute("SELECT id FROM maintenance_teams")
            team_ids = [row[0] for row in cur.fetchall()] or [None]
            
            if not equipment_list:
                print("  ✗ No equipment found. Run equipment loading first.")
                return
            
            inserted = 0
            
            # Create requests for each equipment
            for eq_id, eq_name in equipment_list:
                num_requests = random.randint(2, 5)
                
                for _ in range(num_requests):
                    request_type = random.choice(request_types)
                    
                    if request_type == 'Preventive':
                        subject = random.choice(subjects_preventive)
                        priority = random.choice([1, 2])  # Low, Medium
                        status = random.choice(['New', 'In Progress', 'Repaired'])
                    else:  # Corrective
                        subject = random.choice(subjects_corrective)
                        priority = random.choice([2, 3, 4])  # Medium, High, Critical
                        status = random.choice(statuses)
                    
                    subject = f"{subject} - {eq_name}"
                    description = f"Maintenance request for {eq_name}. Type: {request_type}."
                    team_id = random.choice(team_ids)
                    scheduled_date = datetime.now() + timedelta(days=random.randint(-30, 60))
                    duration_hours = round(random.uniform(0.5, 8), 2)
                    
                    cur.execute("""
                        INSERT INTO maintenance_requests 
                        (subject, description, request_type, status, priority, equipment_id, team_id, scheduled_date, duration_hours)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (subject, description, request_type, status, priority, 
                          eq_id, team_id, scheduled_date, duration_hours))
                    inserted += 1
            
            conn.commit()
            print(f"  ✓ Inserted {inserted} maintenance_requests records")


def load_users():
    """Load users with Indian and American data."""
    print_header("Loading USERS table")
    
    roles = ['Admin', 'Technician', 'Manager', 'Operator', 'Supervisor']
    
    # Create user data mixing Indian and American
    users_data = []
    
    # Indian users
    for i, name in enumerate(INDIAN_NAMES[:8]):
        email = name.lower().replace(' ', '.') + "@gearguard.in"
        role = roles[i % len(roles)]
        dept = random.choice(DEPARTMENTS)
        users_data.append((email, name, role, dept))
    
    # American users
    for i, name in enumerate(AMERICAN_NAMES[:8]):
        email = name.lower().replace(' ', '.') + "@gearguard.com"
        role = roles[i % len(roles)]
        dept = random.choice(DEPARTMENTS)
        users_data.append((email, name, role, dept))
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM users")
            existing = cur.fetchone()[0]
            
            if existing > 0:
                print(f"  Already has {existing} records. Adding more...")
            
            inserted = 0
            for email, full_name, role, department in users_data:
                # Check if user already exists
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    continue
                
                # Simple password hash (in production use proper hashing)
                password_hash = hashlib.sha256(f"password123_{email}".encode()).hexdigest()
                
                cur.execute("""
                    INSERT INTO users (email, password_hash, full_name, role, department, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (email, password_hash, full_name, role, department, True))
                inserted += 1
            
            conn.commit()
            print(f"  ✓ Inserted {inserted} new users records")


def load_task_assignments():
    """Load task_assignments linking users to maintenance requests."""
    print_header("Loading TASK_ASSIGNMENTS table")
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            # Get users (technicians and operators)
            cur.execute("SELECT id, department FROM users WHERE role IN ('Technician', 'Operator', 'Supervisor')")
            users = cur.fetchall()
            
            # Get all users for assigned_by
            cur.execute("SELECT id FROM users WHERE role IN ('Manager', 'Admin', 'Supervisor')")
            managers = [row[0] for row in cur.fetchall()] or [1]
            
            # Get maintenance requests
            cur.execute("SELECT id FROM maintenance_requests WHERE status IN ('New', 'In Progress')")
            request_ids = [row[0] for row in cur.fetchall()]
            
            if not users or not request_ids:
                print("  ✗ No users or requests found. Run those first.")
                return
            
            inserted = 0
            
            # Assign tasks to requests
            for request_id in request_ids:
                if random.random() < 0.7:  # 70% of requests get assigned
                    user = random.choice(users)
                    assigned_to = user[0]
                    department = user[1]
                    assigned_by = random.choice(managers)
                    due_date = datetime.now() + timedelta(days=random.randint(1, 14))
                    notes = random.choice([
                        "Please complete ASAP",
                        "Check with supervisor before starting",
                        "Safety gear required",
                        "Coordinate with production team",
                        None
                    ])
                    
                    cur.execute("""
                        INSERT INTO task_assignments 
                        (maintenance_request_id, assigned_to_user_id, assigned_by_user_id, department, due_date, notes)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (request_id, assigned_to, assigned_by, department, due_date, notes))
                    inserted += 1
            
            conn.commit()
            print(f"  ✓ Inserted {inserted} task_assignments records")


def load_equipment_failures():
    """Load equipment_failures with historical data."""
    print_header("Loading EQUIPMENT_FAILURES table")
    
    failure_types = [
        "Mechanical Failure", "Electrical Failure", "Overheating",
        "Wear and Tear", "Calibration Drift", "Component Breakdown",
        "Corrosion", "Vibration Damage", "Pressure Fault", "Lubrication Failure"
    ]
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            # Get equipment IDs
            cur.execute("SELECT id, name FROM equipment")
            equipment_list = cur.fetchall()
            
            # Get technician user IDs
            cur.execute("SELECT id FROM users WHERE role = 'Technician'")
            technicians = [row[0] for row in cur.fetchall()] or [None]
            
            if not equipment_list:
                print("  ✗ No equipment found.")
                return
            
            inserted = 0
            
            # Create historical failures
            for eq_id, eq_name in equipment_list:
                # 0-3 failures per equipment
                num_failures = random.choices([0, 1, 2, 3], weights=[30, 40, 20, 10])[0]
                
                for _ in range(num_failures):
                    failure_date = datetime.now() - timedelta(days=random.randint(1, 365))
                    failure_type = random.choice(failure_types)
                    downtime_hours = round(random.uniform(1, 48), 2)
                    resolved_by = random.choice(technicians)
                    notes = f"Failure on {eq_name}: {failure_type}. Resolved after {downtime_hours} hours."
                    
                    cur.execute("""
                        INSERT INTO equipment_failures 
                        (equipment_id, failure_date, failure_type, downtime_hours, resolved_by_user_id, notes)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (eq_id, failure_date, failure_type, downtime_hours, resolved_by, notes))
                    inserted += 1
            
            conn.commit()
            print(f"  ✓ Inserted {inserted} equipment_failures records")


def verify_all_tables():
    """Verify all tables have data."""
    print_header("VERIFICATION: Final Row Counts")
    
    tables = [
        'equipment',
        'equipment_anomaly_data',
        'maintenance_requests',
        'maintenance_teams',
        'pm_data_testing',
        'pm_data_training',
        'users',
        'user_sessions',
        'task_assignments',
        'equipment_failures',
        'equipment_health_report'
    ]
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            for table in tables:
                try:
                    cur.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cur.fetchone()[0]
                    status = "✓" if count > 0 else "✗"
                    suffix = " (view)" if table == 'equipment_health_report' else ""
                    print(f"  {status} {table}{suffix}: {count} records")
                except Exception as e:
                    print(f"  ✗ {table}: Error - {e}")


def main():
    print("\n" + "=" * 60)
    print("  GearGuard Database Data Loader")
    print("  Loading Indian & American Data")
    print("=" * 60)
    
    try:
        # Clear existing data first (respects FK constraints)
        clear_all_dependent_tables()
        
        # Load in correct order (dependencies matter)
        load_maintenance_teams()
        load_equipment()
        load_pm_data_testing()
        load_users()
        load_maintenance_requests()
        load_task_assignments()
        load_equipment_failures()
        
        # Verify
        verify_all_tables()
        
        print("\n" + "=" * 60)
        print("  ✓ Data loading complete!")
        print("=" * 60 + "\n")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
