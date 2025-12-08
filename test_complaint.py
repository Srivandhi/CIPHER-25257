
import requests
import json
import pandas as pd

BASE_URL = "http://127.0.0.1:8000/api"
COMPLAINT_ID = "CMP-MH-2001"

def test_specific():
    # 1. Fetch all complaints to find the object
    print(f"Fetching complaints to find {COMPLAINT_ID}...")
    try:
        resp = requests.get(f"{BASE_URL}/complaints")
        complaints = resp.json()
        target = next((c for c in complaints if c["complaint_id"] == COMPLAINT_ID), None)
        
        if not target:
            print(f"Complaint {COMPLAINT_ID} not found in DB!")
            return

        print("Found complaint object.")
        
        # 2. Predict
        print("Requesting ATM hotspots...")
        pred_resp = requests.post(f"{BASE_URL}/complaints/atm-hotspots", json=target)
        if pred_resp.status_code != 200:
             print(f"Prediction Failed with status {pred_resp.status_code}")
             print(pred_resp.text)
             return

        data = pred_resp.json()
        hotspots = data.get(COMPLAINT_ID, [])
        print(f"Received {len(hotspots)} hotspots.")
        
        if hotspots:
            # Analyze risk classes
            df = pd.DataFrame(hotspots)
            print("\nRisk Class Distribution:")
            print(df["risk_class"].value_counts())
            
            print("\nTop 5 Hotspots:")
            print(df[["atm_id", "risk_score", "risk_class"]].head(5))
        else:
            print("No hotspots returned.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_specific()
