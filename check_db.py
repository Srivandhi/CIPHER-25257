
import pandas as pd
from backend.database import engine

def check_db():
    try:
        df = pd.read_sql("SELECT suspected_atm_index, suspected_atm_lat, suspected_atm_lon FROM atms LIMIT 5", engine)
        print("Data:\n", df.to_string())
        print("\nTypes:\n", df.dtypes)
    except Exception as e:
        print(f"Error reading DB: {e}")

if __name__ == "__main__":
    check_db()
