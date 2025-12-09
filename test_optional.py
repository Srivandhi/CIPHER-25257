
import requests
import json

url = "http://127.0.0.1:8000/api/complaints/atm-hotspots"

# Payload MISSING linked_fraud_ring and other string fields
payload = {
    "complaint_id": "CMP-TEST-OPTIONAL",
    "victim_state": "Maharashtra",
    "victim_district": "Mumbai",
    "victim_taluka": "Mumbai",
    "victim_village": "Mumbai",
    "victim_pincode": 400001,
    "victim_rural_urban": "Urban",
    "victim_lat": 19.0760,
    "victim_lon": 72.8777,
    "reported_loss_amount": 10000.0,
    "num_transactions": 1,
    "is_otp_shared": 1,
    "clicked_malicious_link": 1,
    "urgency_score": 0.8,
    "account_age_months": 12,
    "prior_complaints_same_upi": 0
    # MISSING: channel, fraud_type, bank_name, device_type, linked_fraud_ring, time_of_complaint
}

print("Sending POST request to", url)
try:
    r = requests.post(url, json=payload)
    print(f"Status Code: {r.status_code}")
    if r.status_code == 200:
        print("Success! API accepted missing optional fields.")
    else:
        print("Failed:", r.text)
except Exception as e:
    print("Connect failed:", e)
