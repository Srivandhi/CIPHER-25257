
import pandas as pd
from predict import predict_atm_risk

complaint_example = {
    "complaint_id": "TEST_VERIFY",
    "complaint_timestamp": "2025-10-03 13:55:00",
    "victim_state": "Maharashtra",
    "victim_district": "Aurangabad",
    "victim_taluka": "Khuldabad",
    "victim_village": "Bajarwadi",
    "victim_pincode": 431101,
    "victim_rural_urban": "Rural",
    "victim_lat": 20.0085,
    "victim_lon": 75.1892,
    "channel": "NCRP",
    "fraud_type": "OTP Fraud",
    "bank_name": "BoB",
    "reported_loss_amount": 28450.00,
    "num_transactions": 4,
    "device_type": "Android",
    "is_otp_shared": 1,
    "clicked_malicious_link": 0,
    "urgency_score": 0.91,
    "account_age_months": 18,
    "prior_complaints_same_upi": 0,
    "linked_fraud_ring": "Ring_B",
}

try:
    print("Running prediction...")
    df = predict_atm_risk(complaint_example)
    print("Prediction successful!")
    print("Columns:", df.columns.tolist())
    print("Head:", df.head(1))
except Exception as e:
    print(f"Prediction FAILED: {e}")
    
    # Debug missing features
    import pickle
    with open("cipher_ranker_bundle.pkl", "rb") as f:
        bundle = pickle.load(f)
    expected = set(bundle["feature_cols"])
    
    # We can't easily access the internal df from here unless we mod predict.py
    # But we can see what predict.py *would* find.
    # It constructs df from complaint + atm_master.
    # We know what cols are there.
    # Let's just print expected and let user compare with what predict.py printed earlier?
    # No, better to verify specifically.
    
    print("\nEXPECTED FEATURES:", sorted(list(expected)))
    import traceback
    traceback.print_exc()
