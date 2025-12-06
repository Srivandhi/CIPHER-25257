import pandas as pd
import numpy as np
import pickle

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
    # --- Load ATM master ---
    print(f"[LOAD] ATM master from {ATM_MASTER_PATH} ...")
    atm_df = pd.read_csv(ATM_MASTER_PATH)
    print("[INFO] ATM count:", len(atm_df))

    # Nice display columns (kept separate from encoded cols)
    atm_df["atm_name_display"] = atm_df["suspected_atm_name"]
    atm_df["atm_place_display"] = atm_df["suspected_atm_place"]

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
                (full_df["victim_lat"] - full_df["atm_lat"]) ** 2
                + (full_df["victim_lon"] - full_df["atm_lon"]) ** 2
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

    def classify_rank(r):
        if r <= 3:
            return "Critical"
        elif r <= 10:
            return "High"
        elif r <= 20:
            return "Medium"
        else:
            return "Low"

    full_df["risk_class"] = full_df["rank_order"].apply(classify_rank)

    # === If you only want the TOP 20 for dashboard, uncomment: ===
    # full_df = full_df.head(20)

    result = full_df[[
        "atm_id",
        "atm_name_display",
        "atm_place_display",
        "atm_lat",
        "atm_lon",
        "risk_score_raw",
        "risk_score_norm",
        "risk_class",
        "rank_order",
    ]]

    return result


if __name__ == "__main__":
    # Example complaint (plug real complaint data here)
    complaint_example = {
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

    df_pred.to_csv("prediction_output.csv", index=False)
    print("\n[SAVED] prediction_output.csv")
