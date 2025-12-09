
import requests
import datetime
import json

url = "http://127.0.0.1:8000/api/complaints/atm-hotspots"

payload = {
    "complaint_id": "CMP-TEST-001",
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
    "linked_fraud_ring": "None",
    "time_of_complaint": datetime.datetime.now().isoformat()
}

try:
    print("Sending POST request to", url)
    print("Payload:", json.dumps(payload, indent=2))
    r = requests.post(url, json=payload)
    print(f"Status Code: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print("Response keys:", data.keys())
        if "CMP-TEST-001" in data:
            items = data["CMP-TEST-001"]
            print(f"Items count: {len(items)}")
            if len(items) > 0:
                print("First item:", json.dumps(items[0], indent=2))
            else:
                print("⚠️ No hotspots returned!")
        else:
            print("⚠️ Key 'CMP-TEST-001' not in response!")
            print("Full response:", data)
    else:
        print("Error:", r.text)
except Exception as e:
    print("Failed to connect:", e)
