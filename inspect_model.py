
import pickle
import pandas as pd

BUNDLE_PATH = "cipher_ranker_bundle.pkl"

try:
    with open(BUNDLE_PATH, "rb") as f:
        bundle = pickle.load(f)
    
    feature_cols = bundle["feature_cols"]
    print(f"Expected {len(feature_cols)} features:")
    print(feature_cols)
    
except Exception as e:
    print(f"Error: {e}")
