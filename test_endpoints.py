"""Quick test script to verify backend endpoints"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("Testing /api/health...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_maintenance_requests():
    print("Testing /api/maintenance-requests...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/maintenance-requests",
            headers={"X-User-Role": "viewer"}
        )
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Number of requests: {len(data) if isinstance(data, list) else 'N/A'}")
        if isinstance(data, list) and len(data) > 0:
            print(f"Sample request: {json.dumps(data[0], indent=2)}")
        print()
    except Exception as e:
        print(f"Error: {e}\n")

def test_kanban():
    print("Testing /api/kanban...")
    try:
        response = requests.get(f"{BASE_URL}/api/kanban")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response keys: {data.keys() if isinstance(data, dict) else 'N/A'}")
        print()
    except Exception as e:
        print(f"Error: {e}\n")

if __name__ == "__main__":
    print("=" * 50)
    print("GearGuard Backend Endpoint Tests")
    print("=" * 50 + "\n")
    
    test_health()
    test_maintenance_requests()
    test_kanban()
    
    print("=" * 50)
    print("Tests complete!")
    print("=" * 50)
