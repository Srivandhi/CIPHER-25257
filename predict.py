import pandas as pd
import numpy as np
import pickle
from datetime import datetime

BUNDLE_PATH = "cipher_ranker_bundle.pkl"
ATM_MASTER_PATH = "cipher_atm_master.csv"


def encode_with_encoder(colname: str, series, encoders: dict):
    """
    Encode using the same LabelEncoder from training.
    Handles unknown categories by mapping to 0.
    """
    import pandas as pd

    if colname not in encoders:
        return series

    if isinstance(series, pd.DataFrame):
        series = series.iloc[:, 0]

    le = encoders[colname]
    classes = list(le.classes_)
    mapping = {cls: idx for idx, cls in enumerate(classes)}

    encoded = series.astype(str).map(mapping)
    encoded = encoded.fillna(0).astype(int)
    return encoded


def predict_atm_risk(complaint: dict):
    # -------- 0. Handle / normalize complaint timestamp ----------
    # allow complaint_timestamp in dict, else use "now"
    ts_str = complaint.get("complaint_timestamp")
    if ts_str is None:
        ts = datetime.now()
    else:
        # try to parse, otherwise just keep raw string
        try:
            ts = pd.to_datetime(ts_str)
        except Exception:
            ts = ts_str  # keep as string
    # also store a nice display string
    if isinstance(ts, (pd.Timestamp, datetime)):
        ts_display = ts.strftime("%d-%b-%Y %H:%M")
    else:
        ts_display = str(ts)

    # --- Load ATM master from DB ---
    print(f"[LOAD] ATM master from PostgreSQL ...")
    from backend.database import engine
    from backend.models import ATM
    
    # Read entire ATM table
    # Columns in DB match CSV structure: suspected_atm_lat, suspected_atm_lon, etc.
    atm_df = pd.read_sql("SELECT * FROM atms", engine)
    print("[INFO] ATM count:", len(atm_df))

    # Rename columns to match what the model and logic expects
    atm_df = atm_df.rename(columns={
        "suspected_atm_index": "atm_id",
        "suspected_atm_lat": "atm_lat",
        "suspected_atm_lon": "atm_lon",
        "suspected_atm_name": "atm_name",
        "suspected_atm_place": "atm_place"
    })
    
    # Cast to correct types to avoid 'object' dtype (Decimal)
    atm_df["atm_id"] = pd.to_numeric(atm_df["atm_id"], errors='coerce').fillna(0).astype(int)
    atm_df["atm_lat"] = pd.to_numeric(atm_df["atm_lat"], errors='coerce').astype(float)
    atm_df["atm_lon"] = pd.to_numeric(atm_df["atm_lon"], errors='coerce').astype(float)
    atm_df["atm_total_complaints"] = pd.to_numeric(atm_df["atm_total_complaints"], errors='coerce').fillna(0).astype(int)
    atm_df["atm_avg_loss"] = pd.to_numeric(atm_df["atm_avg_loss"], errors='coerce').astype(float)

    # Nice display columns (kept separate from encoded cols)
    atm_df["atm_name_display"] = atm_df["atm_name"]
    atm_df["atm_place_display"] = atm_df["atm_place"]

    # --- Load model bundle ---
    print(f"[LOAD] Bundle from {BUNDLE_PATH} ...")
    with open(BUNDLE_PATH, "rb") as f:
        bundle = pickle.load(f)

    model = bundle["model"]
    feature_cols = bundle["feature_cols"]
    categorical_cols = bundle["categorical_cols"]
    encoders = bundle["encoders"]

    # --- Build full candidate set: one row per ATM for this complaint ---
    n_atm = len(atm_df)
    comp_df = pd.DataFrame([complaint] * n_atm)

    # attach normalized timestamp fields if you want later
    comp_df["complaint_timestamp"] = ts_display

    full_df = pd.concat(
        [comp_df.reset_index(drop=True), atm_df.reset_index(drop=True)],
        axis=1
    )

    # --- Compute victim_atm_distance_km if not already there ---
    if "victim_atm_distance_km" not in full_df.columns:
        if (
            "victim_lat" in full_df.columns
            and "victim_lon" in full_df.columns
            and "atm_lat" in full_df.columns
            and "atm_lon" in full_df.columns
        ):
            # rough Euclidean distance in km
            full_df["victim_atm_distance_km"] = np.sqrt(
                (full_df["victim_lat"].astype(float) - full_df["atm_lat"].astype(float)) ** 2
                + (full_df["victim_lon"].astype(float) - full_df["atm_lon"].astype(float)) ** 2
            ) * 111.0
        else:
            full_df["victim_atm_distance_km"] = 0.0

    # --- Encode categorical columns exactly as in training ---
    for col in categorical_cols:
        if col in full_df.columns:
            full_df[col] = encode_with_encoder(col, full_df[col], encoders)

    # --- Select features in correct order ---
    used_feature_cols = [c for c in feature_cols if c in full_df.columns]
    print("[INFO] Using", len(used_feature_cols), "features at prediction:")
    
    missing_cols = set(feature_cols) - set(full_df.columns)
    if missing_cols:
        print(f"[WARNING] The following {len(missing_cols)} features are MISSING from data: {missing_cols}")
        # Add them as 0 to avoid crash?
        for c in missing_cols:
             full_df[c] = 0.0
        print("[INFO] Filled missing features with 0.0")
        
        # Re-select to include filled ones
        used_feature_cols = [c for c in feature_cols if c in full_df.columns]

    X = full_df[used_feature_cols]

    # --- Predict raw scores ---
    print("[PREDICT] Scoring ATMs ...")
    raw_scores = model.predict(X)
    full_df["risk_score_raw"] = raw_scores

    # --- Normalize scores (0–1) for display ---
    s = full_df["risk_score_raw"].astype(float)
    s_min, s_max = float(s.min()), float(s.max())
    denom = (s_max - s_min) if s_max > s_min else 1.0
    full_df["risk_score_norm"] = (s - s_min) / denom

    # --- Sort by highest risk & assign rank-based risk classes ---
    full_df = full_df.sort_values("risk_score_raw", ascending=False).reset_index(drop=True)
    full_df["rank_order"] = full_df.index + 1  # 1,2,3,...

    # Hybrid Approach: Classify by Rank, then Assign Score within Range
    # This ensures the Top 25 list shows a diversity of Risk Levels as per user requirement.
    def classify_and_score(row):
        r = row["rank_order"]
        # Ranges:
        # Very Critical: 0.9 - 1.0 (Top 1-5)
        # Critical:      0.8 - 0.9 (Top 6-10)
        # High:          0.7 - 0.8 (Top 11-15)
        # Medium:        0.6 - 0.7 (Top 16-20)
        # Low:           0.5 - 0.6 (Top 21-25)
        
        if r <= 5:
            # Map 1-5 linearly to 0.99 - 0.91
            # 1 -> 0.99, 5 -> 0.91
            # score = 1.01 - (r * 0.02)
            score = 1.0 - (r / 50.0) # 1->0.98, 5->0.90
            # Let's use simple interpolation for cleaner code if needed, but this is fine.
            # 0.9 + (5-r+1)*0.018 roughly
            val = 0.9 + ((6-r)/5.0)*0.09 
            return "Very Critical", min(val, 0.99)
        elif r <= 10:
            # 0.8 - 0.9
            # 6->0.89, 10->0.81
            val = 0.8 + ((11-r)/5.0)*0.09
            return "Critical", val
        elif r <= 15:
            # 0.7 - 0.8
            val = 0.7 + ((16-r)/5.0)*0.09
            return "High", val
        elif r <= 20:
            # 0.6 - 0.7
            val = 0.6 + ((21-r)/5.0)*0.09
            return "Medium", val
        elif r <= 25:
            # 0.5 - 0.6
            val = 0.5 + ((26-r)/5.0)*0.09
            return "Low", val
        else:
            # Fallback for > 25 (Low/Safe)
            return "Low", 0.4

    # Apply valid logic
    res = full_df.apply(classify_and_score, axis=1, result_type='expand')
    full_df["risk_class"] = res[0]
    full_df["risk_score_norm"] = res[1]

    # --- Build complaint_text including timestamp (for UI alerts) ---
    # (same text repeated for each row; frontend can just use the first row)
    full_df["complaint_text"] = (
        "Complaint received on "
        + full_df["complaint_timestamp"].astype(str)
        + " from "
        + full_df["victim_village"].astype(str)
        + ", "
        + full_df["victim_taluka"].astype(str)
        + ", "
        + full_df["victim_district"].astype(str)
        + ". Fraud type: "
        + full_df["fraud_type"].astype(str)
        + ", Bank: "
        + full_df["bank_name"].astype(str)
        + "."
    )

    result = full_df[[
        "atm_id",
        "atm_name_display",
        "atm_place_display",
        "atm_lat",
        "atm_lon",
        "risk_score_raw",
        "risk_score_norm",
        "risk_class",
        "atm_total_complaints",
        "atm_avg_loss",
        "rank_order",
        "complaint_timestamp",
        "complaint_text",
    ]]

    return result


if __name__ == "__main__":

    # Example complaint (plug real complaint data here)
    complaint_example = {
        "complaint_timestamp": "2025-10-03 13:55:00",   # <--- NEW
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

    df_pred = predict_atm_risk(complaint_example)

    print("\n====== TOP 10 PREDICTED ATMs ======")
    print(df_pred.head(10))
    df_pred.to_csv("prediction_output.csv",index = False)
    print("\n[SAVED] prediction_output.csv")