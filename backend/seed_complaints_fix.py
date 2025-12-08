
from datetime import datetime
from backend.database import SessionLocal, engine, Base
from backend.models import Complaint

# Hardcoded data from src/page/sampleComplaints.js
complaints_data = [
  {
    "complaint_id": "CMP-MH-2001",
    "complaint_timestamp": "2025-09-21 10:32:00",
    "victim_state": "Maharashtra",
    "victim_district": "Mumbai City",
    "victim_taluka": "Dadar",
    "victim_village": "Prabhadevi",
    "victim_pincode": 400025,
    "victim_rural_urban": "Urban",
    "victim_lat": 19.0160,
    "victim_lon": 72.8300,
    "channel": "NCRP",
    "fraud_type": "UPI Scam",
    "bank_name": "HDFC",
    "reported_loss_amount": 42580.0,
    "num_transactions": 3,
    "device_type": "Android",
    "is_otp_shared": 0,
    "clicked_malicious_link": 1,
    "urgency_score": 0.88,
    "account_age_months": 36,
    "prior_complaints_same_upi": 1,
    "linked_fraud_ring": "Ring_A"
  },
  {
    "complaint_id": "CMP-MH-2002",
    "complaint_timestamp": "2024-11-05 19:15:20",
    "victim_state": "Maharashtra",
    "victim_district": "Thane",
    "victim_taluka": "Kalyan",
    "victim_village": "Dombivli",
    "victim_pincode": 421201,
    "victim_rural_urban": "Urban",
    "victim_lat": 19.2094,
    "victim_lon": 73.0939,
    "channel": "Helpline",
    "fraud_type": "OTP Fraud",
    "bank_name": "SBI",
    "reported_loss_amount": 18750.0,
    "num_transactions": 2,
    "device_type": "Android",
    "is_otp_shared": 1,
    "clicked_malicious_link": 0,
    "urgency_score": 0.76,
    "account_age_months": 22,
    "prior_complaints_same_upi": 0,
    "linked_fraud_ring": "None"
  },
  {
    "complaint_id": "CMP-MH-2003",
    "complaint_timestamp": "2025-01-12 08:42:10",
    "victim_state": "Maharashtra",
    "victim_district": "Pune",
    "victim_taluka": "Haveli",
    "victim_village": "Kothrud",
    "victim_pincode": 411038,
    "victim_rural_urban": "Urban",
    "victim_lat": 18.5074,
    "victim_lon": 73.8077,
    "channel": "NCRP",
    "fraud_type": "KYC Update Scam",
    "bank_name": "Axis",
    "reported_loss_amount": 13990.5,
    "num_transactions": 1,
    "device_type": "Android",
    "is_otp_shared": 1,
    "clicked_malicious_link": 1,
    "urgency_score": 0.59,
    "account_age_months": 48,
    "prior_complaints_same_upi": 0,
    "linked_fraud_ring": "None"
  },
  {
    "complaint_id": "CMP-MH-2004",
    "complaint_timestamp": "2024-12-03 23:05:44",
    "victim_state": "Maharashtra",
    "victim_district": "Nagpur",
    "victim_taluka": "Nagpur Rural",
    "victim_village": "Hudkeshwar",
    "victim_pincode": 440034,
    "victim_rural_urban": "Urban",
    "victim_lat": 21.0870,
    "victim_lon": 79.1180,
    "channel": "Helpline",
    "fraud_type": "Card Skimming",
    "bank_name": "BoB",
    "reported_loss_amount": 9780.0,
    "num_transactions": 1,
    "device_type": "ATM",
    "is_otp_shared": 0,
    "clicked_malicious_link": 0,
    "urgency_score": 0.32,
    "account_age_months": 30,
    "prior_complaints_same_upi": 0,
    "linked_fraud_ring": "None"
  },
  {
    "complaint_id": "CMP-MH-2005",
    "complaint_timestamp": "2025-02-18 16:27:09",
    "victim_state": "Maharashtra",
    "victim_district": "Nashik",
    "victim_taluka": "Igatpuri",
    "victim_village": "Ghoti",
    "victim_pincode": 422402,
    "victim_rural_urban": "Rural",
    "victim_lat": 19.7200,
    "victim_lon": 73.6130,
    "channel": "Email",
    "fraud_type": "Loan App Scam",
    "bank_name": "ICICI",
    "reported_loss_amount": 68540.0,
    "num_transactions": 4,
    "device_type": "Android",
    "is_otp_shared": 0,
    "clicked_malicious_link": 1,
    "urgency_score": 0.91,
    "account_age_months": 10,
    "prior_complaints_same_upi": 0,
    "linked_fraud_ring": "Ring_C"
  },
  {
    "complaint_id": "CMP-MH-2006",
    "complaint_timestamp": "2024-09-27 07:55:33",
    "victim_state": "Maharashtra",
    "victim_district": "Aurangabad",
    "victim_taluka": "Khuldabad",
    "victim_village": "Ellora",
    "victim_pincode": 431102,
    "victim_rural_urban": "Rural",
    "victim_lat": 20.0269,
    "victim_lon": 75.1786,
    "channel": "NCRP",
    "fraud_type": "UPI Scam",
    "bank_name": "PNB",
    "reported_loss_amount": 24360.0,
    "num_transactions": 3,
    "device_type": "Android",
    "is_otp_shared": 0,
    "clicked_malicious_link": 1,
    "urgency_score": 0.67,
    "account_age_months": 18,
    "prior_complaints_same_upi": 1,
    "linked_fraud_ring": "Ring_B"
  },
  {
    "complaint_id": "CMP-MH-2007",
    "complaint_timestamp": "2025-03-09 13:11:51",
    "victim_state": "Maharashtra",
    "victim_district": "Kolhapur",
    "victim_taluka": "Karveer",
    "victim_village": "Rankala",
    "victim_pincode": 416003,
    "victim_rural_urban": "Urban",
    "victim_lat": 16.6950,
    "victim_lon": 74.2433,
    "channel": "Helpline",
    "fraud_type": "OTP Fraud",
    "bank_name": "HDFC",
    "reported_loss_amount": 15220.8,
    "num_transactions": 2,
    "device_type": "Android",
    "is_otp_shared": 1,
    "clicked_malicious_link": 0,
    "urgency_score": 0.54,
    "account_age_months": 54,
    "prior_complaints_same_upi": 0,
    "linked_fraud_ring": "None"
  },
  {
    "complaint_id": "CMP-MH-2008",
    "complaint_timestamp": "2025-04-15 20:39:05",
    "victim_state": "Maharashtra",
    "victim_district": "Raigad",
    "victim_taluka": "Panvel",
    "victim_village": "New Panvel",
    "victim_pincode": 410206,
    "victim_rural_urban": "Urban",
    "victim_lat": 18.9920,
    "victim_lon": 73.1170,
    "channel": "NCRP",
    "fraud_type": "Impersonation / Digital Arrest",
    "bank_name": "SBI",
    "reported_loss_amount": 812000.0,
    "num_transactions": 2,
    "device_type": "Android",
    "is_otp_shared": 1,
    "clicked_malicious_link": 0,
    "urgency_score": 0.97,
    "account_age_months": 96,
    "prior_complaints_same_upi": 2,
    "linked_fraud_ring": "Ring_A"
  }
]

def seed_complaints():
    db = SessionLocal()
    print("Seeding complaints...")
    try:
        count = 0
        for c in complaints_data:
            # check if exists
            exists = db.query(Complaint).filter(Complaint.complaint_id == c['complaint_id']).first()
            if not exists:
                # parse date
                c_copy = c.copy()
                c_copy['complaint_timestamp'] = datetime.strptime(c['complaint_timestamp'], "%Y-%m-%d %H:%M:%S")
                db_obj = Complaint(**c_copy)
                db.add(db_obj)
                count += 1
        db.commit()
        print(f"Seeded {count} complaints.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_complaints()
