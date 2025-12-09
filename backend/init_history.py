
from datetime import datetime, timedelta
from backend.history_database import engine_history, SessionHistory, BaseHistory
from backend.history_models import HistoryComplaint

def init_history_db():
    # Create tables
    BaseHistory.metadata.create_all(bind=engine_history)
    
    db = SessionHistory()
    
    # Check if data exists
    if db.query(HistoryComplaint).first():
        print("History DB already seeded.")
        db.close()
        return

    print("Seeding History DB...")
    
    history_data = [
        {
            "complaint_id": "CMP-MH-1998",
            "complaint_timestamp": datetime(2024, 1, 15, 10, 30),
            "victim_state": "Maharashtra",
            "victim_district": "Mumbai City",
            "victim_taluka": "Colaba",
            "victim_village": "Navy Nagar",
            "victim_pincode": 400005,
            "victim_rural_urban": "Urban",
            "victim_lat": 18.9067,
            "victim_lon": 72.8147,
            "channel": "NCRP",
            "fraud_type": "UPI Scam",
            "bank_name": "SBI",
            "reported_loss_amount": 12000.0,
            "num_transactions": 1,
            "device_type": "Android",
            "urgency_score": 0.2,
            "account_age_months": 24,
            "prior_complaints_same_upi": 0,
            "linked_fraud_ring": "None",
            "status": "Resolved",
            "resolution_date": datetime(2024, 1, 15, 12, 00),
            "resolution_notes": "Money recovered via bank."
        },
        {
            "complaint_id": "CMP-MH-1999",
            "complaint_timestamp": datetime(2024, 2, 20, 14, 15),
            "victim_state": "Maharashtra",
            "victim_district": "Pune",
            "victim_taluka": "Pune City",
            "victim_village": "Shivajinagar",
            "victim_pincode": 411005,
            "victim_rural_urban": "Urban",
            "victim_lat": 18.5314,
            "victim_lon": 73.8446,
            "channel": "Helpline",
            "fraud_type": "OTP Fraud",
            "bank_name": "HDFC",
            "reported_loss_amount": 5500.0,
            "num_transactions": 2,
            "device_type": "Android",
            "urgency_score": 0.1,
            "account_age_months": 12,
            "prior_complaints_same_upi": 0,
            "linked_fraud_ring": "None",
            "status": "Closed",
            "resolution_date": datetime(2024, 2, 21, 10, 00),
            "resolution_notes": "User education provided. Amount non-recoverable."
        },
        {
             "complaint_id": "CMP-MH-2000",
            "complaint_timestamp": datetime(2024, 3, 5, 9, 0),
            "victim_state": "Maharashtra",
            "victim_district": "Nagpur",
            "victim_taluka": "Nagpur",
            "victim_village": "Sadar",
            "victim_pincode": 440001,
            "victim_rural_urban": "Urban",
            "victim_lat": 21.1458,
            "victim_lon": 79.0882,
            "channel": "Email",
            "fraud_type": "Card Skimming",
            "bank_name": "ICICI",
            "reported_loss_amount": 25000.0,
            "num_transactions": 1,
            "device_type": "ATM",
            "urgency_score": 0.3,
            "account_age_months": 60,
            "prior_complaints_same_upi": 0,
            "linked_fraud_ring": "None",
            "status": "Resolved",
            "resolution_date": datetime(2024, 3, 10, 15, 30),
            "resolution_notes": "Suspect apprehended at ATM."
        }
    ]

    for item in history_data:
        db.add(HistoryComplaint(**item))
    
    db.commit()
    print("Seeded 3 history complaints.")
    db.close()

if __name__ == "__main__":
    init_history_db()
