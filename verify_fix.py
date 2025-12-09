
from fastapi.testclient import TestClient
from backend.main import app
import json

client = TestClient(app)

payload = {
    "complaint_id": "CMP-TEST-MISSING-TIME-DEBUG",
    "victim_state": "Maharashtra",
    "victim_district": "Mumbai",
    "victim_taluka": "Mumbai",
    "victim_village": "Mumbai",
    "victim_pincode": 400001,
    "victim_rural_urban": "Urban",
    "victim_lat": 19.0760,
    "victim_lon": 72.8777,
    "channel": "UPI",
    "fraud_type": "Phishing",
    "bank_name": "SBI",
    "reported_loss_amount": 10000.0,
    "num_transactions": 1,
    "device_type": "Android",
    "is_otp_shared": 1,
    "clicked_malicious_link": 1,
    "urgency_score": 0.8,
    "account_age_months": 12,
    "prior_complaints_same_upi": 0,
    "linked_fraud_ring": "None"
    # time_of_complaint MISSING
}

print("Invoking API via TestClient...")
try:
    response = client.post("/api/complaints/atm-hotspots", json=payload)
    print("Status Code:", response.status_code)
    if response.status_code != 200:
        print("Response Text:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
