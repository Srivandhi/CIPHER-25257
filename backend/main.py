# backend/main.py
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import pandas as pd
from predict import predict_atm_risk  # your function from predict.py

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

    # fields you already use in complaint_example in predict.py
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

    # for showing in UI “Time of complaint / time series start”
    time_of_complaint: datetime


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


# ---------- ENDPOINT --------------
# RESPONSE SHAPE:
# {
#   "C12345": [
#       { atm_id: ..., atm_name: ..., ... },
#       ...
#   ]
# }


@app.post("/api/complaints/atm-hotspots", response_model=Dict[str, List[ATMRisk]])
def get_atm_hotspots(complaint: Complaint):
    """
    Given a complaint, return TOP 25 ranked ATM hotspots in the format required
    by the management layer -> control layer JSON.
    """
    # run model
    df: pd.DataFrame = predict_atm_risk(complaint.dict())

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
                "lat": float(row["atm_lat"]),
                "lon": float(row["atm_lon"]),
                "risk_score": float(row["risk_score_raw"]),
                "risk_score_norm": float(row["risk_score_norm"]),
                "risk_class": row["risk_class"],
                "rank": int(row["rank_order"]),

                # from complaint / ATM master
                "fraud_type": complaint.fraud_type,
                "suspected_atm_place": row["atm_place_display"],
                "total_complaints": int(row["atm_total_complaints"]),
                "bank_name": complaint.bank_name,
                "estimated_loss": float(row["atm_avg_loss"]),

                # meta
                "complaint_id": complaint.complaint_id,
                "time_of_complaint": complaint.time_of_complaint,
            }
        )

    # { complaint_id: [ {...}, {...} ] }
    return {complaint.complaint_id: hotspots}
