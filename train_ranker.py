import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import lightgbm as lgb

TRAIN_DATA_PATH = "cipher_rank_pairs.csv"   # your pairs dataset
BUNDLE_PATH = "cipher_ranker_bundle.pkl"    # saved model+


def main():
    print(f"[LOAD] Reading training data from {TRAIN_DATA_PATH} ...")
    df = pd.read_csv(TRAIN_DATA_PATH)
    print("[LOAD] Shape:", df.shape)

    # --- Basic sanity checks ---
    if "label" not in df.columns:
        raise ValueError("Expected a 'label' column (1 for true ATM, 0 for others).")

    if "complaint_id" not in df.columns:
        raise ValueError("Expected a 'complaint_id' column for grouping.")

    label_col = "label"
    group_col = "complaint_id"

    # --- Define features explicitly (NO cluster_id) ---
    candidate_feature_cols = [
        # Complaint-level features
        "victim_state",
        "victim_district",
        "victim_taluka",
        "victim_village",
        "victim_pincode",
        "victim_rural_urban",
        "victim_lat",
        "victim_lon",
        "channel",
        "fraud_type",
        "bank_name",
        "reported_loss_amount",
        "num_transactions",
        "device_type",
        "is_otp_shared",
        "clicked_malicious_link",
        "urgency_score",
        "account_age_months",
        "prior_complaints_same_upi",
        "linked_fraud_ring",

        # ATM-level features
        "atm_id",
        "suspected_atm_name",
        "suspected_atm_place",
        "atm_lat",
        "atm_lon",
        "atm_bank_name",
        "atm_total_complaints",
        "atm_cashout_rate",
        "atm_avg_loss",
        "victim_atm_distance_km",
    ]

    # Keep only those that truly exist
    feature_cols = [c for c in candidate_feature_cols if c in df.columns]
    print("[INFO] Using", len(feature_cols), "features:")
    for c in feature_cols:
        print("  -", c)

    # Categorical columns (subset of features)
    categorical_cols = [
        "victim_state",
        "victim_district",
        "victim_taluka",
        "victim_village",
        "victim_rural_urban",
        "channel",
        "fraud_type",
        "device_type",
        "linked_fraud_ring",
        "bank_name",
        "suspected_atm_name",
        "suspected_atm_place",
        "atm_bank_name",
    ]
    categorical_cols = [c for c in categorical_cols if c in feature_cols]

    # --- Encode categorical features ---
    encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        print(f"[ENCODE] {col} -> {len(le.classes_)} classes")

    # --- Train/test split by complaint_id (group-aware) ---
    complaint_ids = df[group_col].unique()
    train_ids, test_ids = train_test_split(
        complaint_ids,
        test_size=0.2,
        random_state=42,
        shuffle=True,
    )

    train_df = df[df[group_col].isin(train_ids)].copy()
    test_df = df[df[group_col].isin(test_ids)].copy()

    print("[SPLIT] Train rows:", len(train_df))
    print("[SPLIT] Test rows :", len(test_df))

    X_train = train_df[feature_cols]
    y_train = train_df[label_col].values
    X_test = test_df[feature_cols]
    y_test = test_df[label_col].values

    # Group sizes = how many ATMs per complaint
    train_group = train_df.groupby(group_col).size().values

    # --- Train LightGBM Ranker ---
    ranker = lgb.LGBMRanker(
        objective="lambdarank",
        n_estimators=200,
        learning_rate=0.05,
        num_leaves=63,
        random_state=42,
    )

    print("[TRAIN] Training LightGBM Ranker ...")
    ranker.fit(
        X_train,
        y_train,
        group=train_group,
    )

    # Simple sanity eval: positive vs negative scores
    y_pred_test = ranker.predict(X_test)
    print("[EVAL] Mean score (label=1):", y_pred_test[y_test == 1].mean())
    print("[EVAL] Mean score (label=0):", y_pred_test[y_test == 0].mean())

    # --- Save bundle (model + encoders + feature list) ---
    bundle = {
        "model": ranker,
        "feature_cols": feature_cols,
        "categorical_cols": categorical_cols,
        "encoders": encoders,
    }

    with open(BUNDLE_PATH, "wb") as f:
        pickle.dump(bundle, f)

    print(f"[SAVE] Saved ranker bundle to {BUNDLE_PATH}")


if __name__ == "__main__":
    main()
