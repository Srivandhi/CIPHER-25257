
from sqlalchemy import Column, Integer, String, Float, DateTime
from backend.history_database import BaseHistory

class HistoryComplaint(BaseHistory):
    __tablename__ = "history_complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String, unique=True, index=True)
    complaint_timestamp = Column(DateTime)
    
    # Location
    victim_state = Column(String)
    victim_district = Column(String)
    victim_taluka = Column(String)
    victim_village = Column(String)
    victim_pincode = Column(Integer)
    victim_rural_urban = Column(String)
    victim_lat = Column(Float)
    victim_lon = Column(Float)

    # Fraud details
    channel = Column(String)
    fraud_type = Column(String)
    bank_name = Column(String)
    reported_loss_amount = Column(Float)
    num_transactions = Column(Integer)
    device_type = Column(String)
    
    # Risk/Analysis
    urgency_score = Column(Float)
    account_age_months = Column(Integer)
    prior_complaints_same_upi = Column(Integer)
    linked_fraud_ring = Column(String)
    
    # History Specific
    status = Column(String, default="Resolved")
    resolution_date = Column(DateTime)
    resolution_notes = Column(String)
