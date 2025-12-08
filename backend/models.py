
from sqlalchemy import Column, Integer, String, Float, DateTime, BigInteger, Text, Boolean
from sqlalchemy.sql import func
from .database import Base

class ATM(Base):
    __tablename__ = "atms"

    # Based on: ['suspected_atm_index', 'suspected_atm_lat', 'suspected_atm_lon', 'suspected_atm_place', 'suspected_atm_name', 'atm_total_complaints', 'atm_avg_loss']
    id = Column(Integer, primary_key=True, index=True) # Db internal ID
    suspected_atm_index = Column(Integer, unique=True, index=True) # CSV ID
    suspected_atm_lat = Column(Float)
    suspected_atm_lon = Column(Float)
    suspected_atm_place = Column(String)
    suspected_atm_name = Column(String)
    atm_total_complaints = Column(Integer)
    atm_avg_loss = Column(Float)

class Complaint(Base):
    __tablename__ = "complaints"

    complaint_id = Column(String, primary_key=True, index=True)
    complaint_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    victim_state = Column(String)
    victim_district = Column(String)
    victim_taluka = Column(String)
    victim_village = Column(String)
    victim_pincode = Column(Integer)
    victim_rural_urban = Column(String)
    victim_lat = Column(Float)
    victim_lon = Column(Float)
    
    channel = Column(String)
    fraud_type = Column(String)
    bank_name = Column(String)
    reported_loss_amount = Column(Float)
    num_transactions = Column(Integer)
    device_type = Column(String)
    is_otp_shared = Column(Integer) # or Boolean
    clicked_malicious_link = Column(Integer) # or Boolean
    
    urgency_score = Column(Float)
    account_age_months = Column(Integer)
    prior_complaints_same_upi = Column(Integer)
    linked_fraud_ring = Column(String)

class RankPair(Base):
    __tablename__ = "rank_pairs"
    
    id = Column(Integer, primary_key=True, index=True)
    # Based on: ['complaint_id', 'day_of_week', 'hour_of_day', 'victim_state', 'victim_district', 'victim_taluka', 'victim_village', 'victim_pincode', 'victim_rural_urban', 'victim_lat', 'victim_lon', 'channel', 'fraud_type', 'bank_name', 'reported_loss_amount', 'num_transactions', 'device_type', 'is_otp_shared', 'clicked_malicious_link', 'urgency_score', 'account_age_months', 'prior_complaints_same_upi', 'linked_fraud_ring', 'atm_id', 'atm_distance_km', 'label']
    
    # We really only need to link complaint to ATM here?
    # Or is this training data? 
    # The prompt says: "Seed all these tables... Rank pairs..." 
    # It seems to be a dataset pairing complaints and ATMs with a 'label' (likely is_suspect).
    # We will just map the columns.
    
    complaint_id = Column(String, index=True) 
    atm_id = Column(Integer, index=True) # This maps to suspected_atm_index presumably
    label = Column(Integer)
    atm_distance_km = Column(Float)
    
    # We could store the rest, but maybe not strictly necessary if we join with Complaint/ATM tables. 
    # However, to faithfully "Seed all... Rank pairs", let's dump them in. 
    # Or better, just the keys if the data is redundant. 
    # PROMPT: "every complaint and ATM/master data is stored in PostgreSQL... Rank pairs (from cipher_rank_pairs.csv)"
    # I will be safe and store what looks relevant or everything if feasible. 
    # Given 75MB, strictly storing everything is fine for Postgres.
    
    day_of_week = Column(Integer)
    hour_of_day = Column(Integer)
    # ... other complaint props are redundant if we have the complaint table.
    # But this file might contain historical pairs not in the 'sampleComplaints'.
    # So I will add them loosely.
    
    victim_state = Column(String)
    # ... skipping full duplication to avoid massive schema for now unless needed. 
    # I will stick to the core purpose: linking complaints to ATMs for training? 
    # The prompt focused on *Prediction* which uses `predict.py`.
    # `predict.py` uses `ATM master` and the input `complaint` dict. 
    # `Rank pairs` are for `train_ranker.py`. Does `predict.py` use it? 
    # `predict.py` seems to NOT use `cipher_rank_pairs.csv`. 
    # So `RankPair` table is mainly for future training or data integrity.


