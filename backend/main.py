
# backend/main.py
from pydantic import BaseModel, field_validator
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

# History API
from backend.history_database import SessionHistory
from backend.history_models import HistoryComplaint

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

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"VALIDATION ERROR: {exc}")
    with open("C:/Users/SRIVANDHI/CIPHER/CIPHER-25257/debug_val_error.log", "a") as f:
        f.write(f"Validation Error: {exc}\nBody: {exc.body}\n")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )

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
    channel: str = "Unknown"
    fraud_type: str = "Unknown"
    bank_name: str = "Unknown"
    reported_loss_amount: float
    num_transactions: int
    device_type: str = "Unknown"
    is_otp_shared: int
    clicked_malicious_link: int
    urgency_score: float = 3.4
    account_age_months: int
    prior_complaints_same_upi: int = 2
    linked_fraud_ring: str = "None"
    time_of_complaint: datetime = None

    @field_validator('victim_pincode', 'num_transactions', 'account_age_months', 'prior_complaints_same_upi', 'is_otp_shared', 'clicked_malicious_link', mode='before')
    @classmethod
    def sanitize_int(cls, v):
        if v == "" or v is None:
            return 0
        return int(float(v)) # handle "12.0" strings too

    @field_validator('victim_lat', 'victim_lon', 'reported_loss_amount', 'urgency_score', mode='before')
    @classmethod
    def sanitize_float(cls, v):
        if v == "" or v is None:
            return 0.0
        return float(v)

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
    print("[DEBUG] Fetching complaints from DB...")
    complaints = db.query(DBComplaint).all()
    print(f"[DEBUG] Found {len(complaints)} complaints")
    
    result = []
    for c in complaints:
        # Create a safe copy of data mapped to Pydantic schema
        c_dict = {
            "complaint_id": c.complaint_id,
            "victim_state": c.victim_state,
            "victim_district": c.victim_district,
            "victim_taluka": c.victim_taluka,
            "victim_village": c.victim_village,
            "victim_pincode": c.victim_pincode,
            "victim_rural_urban": c.victim_rural_urban,
            "victim_lat": c.victim_lat,
            "victim_lon": c.victim_lon,
            "channel": c.channel,
            "fraud_type": c.fraud_type,
            "bank_name": c.bank_name,
            "reported_loss_amount": c.reported_loss_amount,
            "num_transactions": c.num_transactions,
            "device_type": c.device_type,
            "is_otp_shared": c.is_otp_shared,
            "clicked_malicious_link": c.clicked_malicious_link,
            "urgency_score": c.urgency_score,
            "account_age_months": c.account_age_months,
            "prior_complaints_same_upi": c.prior_complaints_same_upi,
            "linked_fraud_ring": c.linked_fraud_ring,
            "time_of_complaint": c.complaint_timestamp
        }
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
            comp_data['complaint_timestamp'] = comp_data.pop('time_of_complaint', None)
            if not comp_data['complaint_timestamp']:
                comp_data['complaint_timestamp'] = datetime.now()
            new_comp = DBComplaint(**comp_data)
            db.add(new_comp)
            db.commit()
    except Exception as e:
        import traceback
        with open("C:/Users/SRIVANDHI/CIPHER/CIPHER-25257/debug_err.log", "a") as f:
            f.write(f"Upsert Error: {e}\n{traceback.format_exc()}\n")
        print(f"Upsert Error: {e}")
        raise e

    try:
        # 2. Run model
        c_dict = complaint.dict()
        # Robustly handle timestamp
        ts = c_dict.get('time_of_complaint')
        if not ts:
            ts = datetime.now()
        c_dict['complaint_timestamp'] = ts
        
        df: pd.DataFrame = predict_atm_risk(c_dict)

        # keep TOP 50
        TOP_K = 50
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
                    "time_of_complaint": c_dict['complaint_timestamp'],
                }
            )

        # { complaint_id: [ {...}, {...} ] }
        return {complaint.complaint_id: hotspots}
        
    except Exception as e:
        import traceback
        with open("C:/Users/SRIVANDHI/CIPHER/CIPHER-25257/debug_err.log", "a") as f:
            f.write(f"Prediction Error: {e}\n{traceback.format_exc()}\n")
        print(f"Prediction Error: {e}")
        raise e

def get_history_db():
    db = SessionHistory()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/complaints/{complaint_id}/archive")
def archive_complaint_to_history(
    complaint_id: str,
    db: Session = Depends(get_db),
    history_db: Session = Depends(get_history_db)
):
    """
    Archive a complaint from active complaints to history.
    Used when forwarding to bank.
    """
    try:
        # 1. Fetch the complaint from active DB
        active_complaint = db.query(DBComplaint).filter(
            DBComplaint.complaint_id == complaint_id
        ).first()
        
        if not active_complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # 2. Check if already in history
        existing_history = history_db.query(HistoryComplaint).filter(
            HistoryComplaint.complaint_id == complaint_id
        ).first()
        
        if existing_history:
            # Already archived, just return success
            return {"message": "Complaint already in history", "complaint_id": complaint_id}
        
        # 3. Create history record
        history_data = {
            "complaint_id": active_complaint.complaint_id,
            "complaint_timestamp": active_complaint.complaint_timestamp,
            "victim_state": active_complaint.victim_state,
            "victim_district": active_complaint.victim_district,
            "victim_taluka": active_complaint.victim_taluka,
            "victim_village": active_complaint.victim_village,
            "victim_pincode": active_complaint.victim_pincode,
            "victim_rural_urban": active_complaint.victim_rural_urban,
            "victim_lat": active_complaint.victim_lat,
            "victim_lon": active_complaint.victim_lon,
            "channel": active_complaint.channel,
            "fraud_type": active_complaint.fraud_type,
            "bank_name": active_complaint.bank_name,
            "reported_loss_amount": active_complaint.reported_loss_amount,
            "num_transactions": active_complaint.num_transactions,
            "device_type": active_complaint.device_type,
            "urgency_score": active_complaint.urgency_score,
            "account_age_months": active_complaint.account_age_months,
            "prior_complaints_same_upi": active_complaint.prior_complaints_same_upi,
            "linked_fraud_ring": active_complaint.linked_fraud_ring,
            "status": "Forwarded to Bank",
            "resolution_date": datetime.now(),
            "resolution_notes": "Automatically archived after forwarding to bank"
        }
        
        history_complaint = HistoryComplaint(**history_data)
        history_db.add(history_complaint)
        history_db.commit()
        
        # 4. Delete from active complaints
        db.delete(active_complaint)
        db.commit()
        
        return {
            "message": "Complaint archived successfully",
            "complaint_id": complaint_id,
            "status": "Forwarded to Bank"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Archive Error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_history_complaints(db: Session = Depends(get_history_db)):
    complaints = db.query(HistoryComplaint).all()
    # Manual serialization to handle datetime and status
    res = []
    for c in complaints:
        d = c.__dict__.copy()
        if "_sa_instance_state" in d:
            del d["_sa_instance_state"]
        # map complaint_timestamp to time_of_complaint if frontend expects it
        d['time_of_complaint'] = d.get('complaint_timestamp')
        res.append(d)
    return res
