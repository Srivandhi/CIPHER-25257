
import requests
import json

url = "http://127.0.0.1:8000/api/complaints/atm-hotspots"

# Payload that mimics what we THINK the frontend sends
# based on CipherDashboard.jsx and typical JS types (numbers vs strings)
payload = {
    "complaint_id": "CMP-TEST-422",
    "victim_state": "Maharashtra",
    "victim_district": "Mumbai",
    "victim_taluka": "Mumbai",
    "victim_village": "Mumbai",
    "victim_pincode": "400001",  # STRING instead of INT?
    "victim_rural_urban": "Urban",
    "victim_lat": "19.0760", # STRING instead of FLOAT?
    "victim_lon": 72.8777,
    "channel": "UPI",
    "fraud_type": "Phishing",
    "bank_name": "SBI",
    "reported_loss_amount": "10000.0", # STRING?
    "num_transactions": 1,
    "device_type": "Android",
    "is_otp_shared": 1,
    "clicked_malicious_link": 1,
    "urgency_score": 0.8,
    "account_age_months": 12,
    "prior_complaints_same_upi": 0,
    "linked_fraud_ring": "None",
    "time_of_complaint": "2025-12-09T10:00:00Z"
}

print("Sending POST request to", url)
try:
    r = requests.post(url, json=payload)
    print(f"Status Code: {r.status_code}")
    print("Response text:", r.text)
except Exception as e:
    print("Connect failed:", e)
