
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_flow():
    # 1. Get complaints
    print("Fetching complaints...")
    try:
        resp = requests.get(f"{BASE_URL}/complaints")
        resp.raise_for_status()
        complaints = resp.json()
        print(f"Got {len(complaints)} complaints.")
    except Exception as e:
        print(f"Failed to fetch complaints: {e}")
        return

    if not complaints:
        print("No complaints found to test.")
        return

    # 2. Pick one
    complaint = complaints[0]
    # Ensure time_of_complaint is present (might be mapped)
    # The Pydantic model expects 'time_of_complaint'
    # The GET response might contain 'time_of_complaint' (mapped in main.py)
    print(f"Testing with complaint: {complaint.get('complaint_id')}")

    # 3. Predict matches
    print("Requesting ATM hotspots...")
    try:
        # Prepare payload: The endpoint expects a Complaint object.
        # GET /api/complaints returns objects with 'time_of_complaint'.
        # POST /api/complaints/atm-hotspots expects 'time_of_complaint'.
        # So passing the object directly should work.
        
        # NOTE: If GET returns 'complaint_timestamp' instead of 'time_of_complaint', we need to check.
        # main.py read_complaints maps c.complaint_timestamp -> c_dict['time_of_complaint'].
        # So we should be good.
        
        pred_resp = requests.post(f"{BASE_URL}/complaints/atm-hotspots", json=complaint)
        # Check status first
        if pred_resp.status_code != 200:
             print(f"Prediction Failed with status {pred_resp.status_code}")
             print("Response:", pred_resp.text)
             return

        data = pred_resp.json()
        
        # Check structure
        c_id = complaint['complaint_id']
        if c_id in data:
            hotspots = data[c_id]
            print(f"SUCCESS: Received {len(hotspots)} hotspots.")
            if hotspots:
                print("Sample hotspot:", hotspots[0])
            else:
                print("WARNING: Hotspot list is empty!")
        else:
            print(f"ERROR: Key {c_id} not found in response keys: {list(data.keys())}")

    except Exception as e:
        print(f"Prediction request failed: {e}")

if __name__ == "__main__":
    test_flow()
