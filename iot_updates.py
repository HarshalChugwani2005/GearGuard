import psycopg2
import time
import pandas as pd
from datetime import datetime

# Replace with your actual Neon Connection String
CONN_STRING = "postgresql://[user]:[password]@[host]/neondb?sslmode=require"

# Path to your Kaggle CSV file (update with your actual path)
KAGGLE_CSV_PATH = "path/to/your/kaggle_iot_data.csv"

def load_kaggle_data(csv_path):
    """Load IoT sensor data from Kaggle CSV file"""
    try:
        df = pd.read_csv(csv_path)
        print(f"✓ Loaded {len(df)} records from Kaggle file: {csv_path}")
        return df
    except FileNotFoundError:
        print(f"Error: Kaggle CSV file not found at {csv_path}")
        return None
    except Exception as e:
        print(f"Error loading Kaggle file: {e}")
        return None

def map_equipment_id(equipment_name, cur):
    """Map equipment name to database ID"""
    try:
        cur.execute("SELECT id FROM equipment WHERE name = %s AND is_functional = TRUE", (equipment_name,))
        result = cur.fetchone()
        return result[0] if result else None
    except Exception as e:
        print(f"Error mapping equipment: {e}")
        return None

def simulate_iot_heartbeat():
    try:
        # 1. Connect to NeonDB
        conn = psycopg2.connect(CONN_STRING)
        cur = conn.cursor()
        print("Successfully connected to GearGuard Database.")

        # 2. Load data from Kaggle CSV file
        df = load_kaggle_data(KAGGLE_CSV_PATH)
        if df is None:
            return

        # 3. Iterate through each row in the Kaggle dataset to simulate real-time uploads
        for idx, row in df.iterrows():
            try:
                # Extract sensor data from Kaggle CSV
                equipment_name = row.get('equipment_name', row.get('name', 'Unknown'))
                temp = float(row.get('temperature', row.get('temp', 0)))
                vibration = float(row.get('vibration', row.get('vib', 0)))
                
                # Get equipment ID from database
                eq_id = map_equipment_id(equipment_name, cur)
                if eq_id is None:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚠️ Equipment '{equipment_name}' not found in database, skipping...")
                    continue
                
                print(f"[{datetime.now().strftime('%H:%M:%S')}] {equipment_name}: Temp={temp:.2f}C, Vib={vibration:.2f}")

                # 4. BUSINESS LOGIC: Automatic Corrective Request
                # If temperature exceeds 95C, auto-create a 'New' request
                if temp > 95.0:
                    print(f"⚠️ ALERT: {equipment_name} is overheating! Creating request...")
                    cur.execute("""
                        INSERT INTO maintenance_requests (subject, request_type, status, equipment_id, description)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        f"Overheating Alert: {equipment_name}",
                        'Corrective',
                        'New',
                        eq_id,
                        f"Automated alert: Sensor detected critical temperature of {temp:.2f}C"
                    ))
                    conn.commit()

            except ValueError as e:
                print(f"Error processing row {idx}: Invalid data format - {e}")
                continue

            # 5. Wait between uploads to mimic "Real-Time" intervals
            time.sleep(2)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()
        print(f"✓ Completed simulating real-time IoT data uploads from Kaggle file")

if __name__ == "__main__":
    simulate_iot_heartbeat()