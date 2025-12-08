# backend/main.py
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import pandas as pd
import numpy as np
from predict import predict_atm_risk  # your function from predict.py
from backend.database import get_db, engine, Base
from backend.models import Complaint as DBComplaint, ATM

# Create tables on startup (if not already)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CIPHER ATM Risk API")

# --- CORS so React (http://localhost:5173) can talk to FastAPI ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------- Pydantic models ---------

class Complaint(BaseModel):
    complaint_id: str
    victim_state: str
    victim_district: str
    victim_taluka: str
    victim_village: str
    victim_pincode: int
    victim_rural_urban: str
    victim_lat: float
    victim_lon: float
    channel: str
    fraud_type: str
    bank_name: str
    reported_loss_amount: float
    num_transactions: int
    device_type: str
    is_otp_shared: int
    clicked_malicious_link: int
    urgency_score: float
    account_age_months: int
    prior_complaints_same_upi: int
    linked_fraud_ring: str
    time_of_complaint: datetime

    class Config:
        from_attributes = True

class ATMRisk(BaseModel):
    atm_id: int
    atm_name: str
    lat: float
    lon: float
    risk_score: float
    risk_score_norm: float
    risk_class: str
    rank: int
    fraud_type: str
    suspected_atm_place: str
    total_complaints: int
    bank_name: str
    estimated_loss: float
    complaint_id: str
    time_of_complaint: datetime


# ---------- ENDPOINTS --------------

@app.get("/api/complaints", response_model=List[Complaint])
def read_complaints(db: Session = Depends(get_db)):
    """Fetch all complaints from PostgreSQL"""
    complaints = db.query(DBComplaint).all()
    # Map DB -> Pydantic
    # DB has complaint_timestamp, Pydantic has time_of_complaint
    # We can use list comp or rely on orm_mode if fields match.
    # Fields do match MOSTLY, except time_of_complaint vs complaint_timestamp.
    # I should align them or map them.
    # Existing Pydantic: time_of_complaint
    # DB: complaint_timestamp
    
    # I'll manually map to be safe and compatible with frontend expected Pydantic shape
    result = []
    for c in complaints:
        c_dict = c.__dict__
        # Pydantic expects time_of_complaint
        c_dict['time_of_complaint'] = c.complaint_timestamp
        result.append(c_dict)
    return result

@app.post("/api/complaints", response_model=Complaint)
def create_complaint(complaint: Complaint, db: Session = Depends(get_db)):
    """Create a new complaint"""
    db_complaint = db.query(DBComplaint).filter(DBComplaint.complaint_id == complaint.complaint_id).first()
    if db_complaint:
        # update or return existing
        return db_complaint
    
    # Create new
    comp_data = complaint.dict()
    # map time_of_complaint -> complaint_timestamp
    comp_data['complaint_timestamp'] = comp_data.pop('time_of_complaint')
    
    new_complaint = DBComplaint(**comp_data)
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    # Pydantic resp
    new_complaint.time_of_complaint = new_complaint.complaint_timestamp
    return new_complaint


@app.post("/api/complaints/atm-hotspots", response_model=Dict[str, List[ATMRisk]])
def get_atm_hotspots(complaint: Complaint, db: Session = Depends(get_db)):
    """
    Given a complaint:
    1. Upsert complaint in DB
    2. Run prediction (reads ATM data from DB)
    3. Return TOP 25 ranked ATM hotspots
    """
    
    # 1. Upsert Complaint
    try:
        existing = db.query(DBComplaint).filter(DBComplaint.complaint_id == complaint.complaint_id).first()
        if existing:
            pass # Already exists
        else:
            comp_data = complaint.dict()
            comp_data['complaint_timestamp'] = comp_data.pop('time_of_complaint')
            new_comp = DBComplaint(**comp_data)
            db.add(new_comp)
            db.commit()
    except Exception as e:
        import traceback
        with open("server_error.log", "a") as f:
            f.write(f"Upsert Error: {e}\n{traceback.format_exc()}\n")
        raise e

    try:
        # 2. Run model
        # predict_atm_risk reads ATMs from DB (via engine inside predict.py)
        # It expects a dict with 'complaint_timestamp' key potentially?
        # predict.py: ts_str = complaint.get("complaint_timestamp")
        # Pydantic has time_of_complaint.
        
        c_dict = complaint.dict()
        c_dict['complaint_timestamp'] = c_dict.get('time_of_complaint') # ensure key exists
        
        df: pd.DataFrame = predict_atm_risk(c_dict)

        # keep TOP 25
        TOP_K = 25
        df = (
            df.sort_values("risk_score_raw", ascending=False)
            .head(TOP_K)
            .reset_index(drop=True)
        )

        # DEBUG: confirm how many rows we are actually returning
        print(f"[DEBUG] Returning {len(df)} ATM hotspots for complaint {complaint.complaint_id}")

        # build list of ATMRisk dicts
        hotspots: List[Dict[str, Any]] = []
        for _, row in df.iterrows():
            # Helper to sanitize float
            def sanitize(val):
                if pd.isna(val) or val is None:
                    return 0.0
                try:
                    f = float(val)
                    if not np.isfinite(f):
                        return 0.0
                    return f
                except:
                    return 0.0

            hotspots.append(
                {
                    "atm_id": int(row["atm_id"]),
                    "atm_name": row["atm_name_display"],
                    "lat": sanitize(row["atm_lat"]),
                    "lon": sanitize(row["atm_lon"]),
                    "risk_score": sanitize(row["risk_score_raw"]),
                    "risk_score_norm": sanitize(row["risk_score_norm"]),
                    "risk_class": row["risk_class"],
                    "rank": int(row["rank_order"]),

                    # from complaint / ATM master
                    "fraud_type": complaint.fraud_type,
                    "suspected_atm_place": row["atm_place_display"],
                    "total_complaints": int(row["atm_total_complaints"]),
                    "bank_name": complaint.bank_name,
                    "estimated_loss": sanitize(row["atm_avg_loss"]),

                    # meta
                    "complaint_id": complaint.complaint_id,
                    "time_of_complaint": complaint.time_of_complaint,
                }
            )

        # { complaint_id: [ {...}, {...} ] }
        return {complaint.complaint_id: hotspots}
        
    except Exception as e:
        import traceback
        with open("server_error.log", "a") as f:
            f.write(f"Prediction Error: {e}\n{traceback.format_exc()}\n")
        raise e
    # predict_atm_risk reads ATMs from DB (via engine inside predict.py)
    # It expects a dict with 'complaint_timestamp' key potentially?
    # predict.py: ts_str = complaint.get("complaint_timestamp")
    # Pydantic has time_of_complaint.
    # I should pass dict with 'complaint_timestamp'
    
    c_dict = complaint.dict()
    c_dict['complaint_timestamp'] = c_dict.get('time_of_complaint') # ensure key exists
    
    df: pd.DataFrame = predict_atm_risk(c_dict)

    # keep TOP 25
    TOP_K = 25
    df = (
        df.sort_values("risk_score_raw", ascending=False)
        .head(TOP_K)
        .reset_index(drop=True)
    )

    # DEBUG: confirm how many rows we are actually returning
    print(f"[DEBUG] Returning {len(df)} ATM hotspots for complaint {complaint.complaint_id}")

    # build list of ATMRisk dicts
    hotspots: List[Dict[str, Any]] = []
    for _, row in df.iterrows():
        hotspots.append(
            {
                "atm_id": int(row["atm_id"]),
                "atm_name": row["atm_name_display"],
                "lat": float(row["atm_lat"]) if pd.notnull(row["atm_lat"]) else 0.0,
                "lon": float(row["atm_lon"]) if pd.notnull(row["atm_lon"]) else 0.0,
                "risk_score": float(row["risk_score_raw"]) if pd.notnull(row["risk_score_raw"]) and np.isfinite(row["risk_score_raw"]) else 0.0,
                "risk_score_norm": float(row["risk_score_norm"]) if pd.notnull(row["risk_score_norm"]) and np.isfinite(row["risk_score_norm"]) else 0.0,
                "risk_class": row["risk_class"],
                "rank": int(row["rank_order"]),

                # from complaint / ATM master
                "fraud_type": complaint.fraud_type,
                "suspected_atm_place": row["atm_place_display"],
                "total_complaints": int(row["atm_total_complaints"]),
                "bank_name": complaint.bank_name,
                "estimated_loss": float(row["atm_avg_loss"]) if pd.notnull(row["atm_avg_loss"]) else 0.0,

                # meta
                "complaint_id": complaint.complaint_id,
                "time_of_complaint": complaint.time_of_complaint,
            }
        )

    # { complaint_id: [ {...}, {...} ] }
    return {complaint.complaint_id: hotspots}
