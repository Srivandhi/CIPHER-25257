
import requests
import datetime
import json

url = "http://127.0.0.1:8000/api/complaints/atm-hotspots"

# Payload MISSING time_of_complaint and complaint_timestamp
payload = {
    "complaint_id": "CMP-TEST-MISSING-TIME",
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
}

try:
    print("Sending POST request to", url)
    print("Payload keys:", payload.keys())
    r = requests.post(url, json=payload)
    print(f"Status Code: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print("Response received successfully!")
        print("Response keys:", data.keys())
    else:
        print("Error:", r.text)
except Exception as e:
    print("Failed to connect:", e)
