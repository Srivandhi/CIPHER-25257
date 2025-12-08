
import os
import pandas as pd
import json
from datetime import datetime
from backend.database import SessionLocal, engine, Base
from backend.models import ATM, Complaint, RankPair

# Path to files
ATM_MASTER_PATH = "cipher_atm_master.csv"
RANK_PAIRS_PATH = "cipher_rank_pairs.csv"
SAMPLE_COMPLAINTS_JS_PATH = "src/page/sampleComplaints.js"

def seed_data():
    # 1. Init DB
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 2. Seed ATMs
        # Truncate first to fix bad data
        db.query(ATM).delete()
        db.commit()
        print("Truncated ATMs table.")

        print(f"Seeding ATMs from {ATM_MASTER_PATH}...")
        if os.path.exists(ATM_MASTER_PATH):
            df_atm = pd.read_csv(ATM_MASTER_PATH)
            
            # Clean columns
            df_atm.columns = [c.strip() for c in df_atm.columns]
            print("CSV Columns:", df_atm.columns.tolist())
            
            records = []
            for _, row in df_atm.iterrows():
                # Map CSV -> Model
                r = {
                    "suspected_atm_index": row.get("atm_id") if "atm_id" in row else row.get("suspected_atm_index"),
                    "suspected_atm_lat": row.get("atm_lat") if "atm_lat" in row else row.get("suspected_atm_lat"),
                    "suspected_atm_lon": row.get("atm_lon") if "atm_lon" in row else row.get("suspected_atm_lon"),
                    "suspected_atm_place": row.get("suspected_atm_place"),
                    "suspected_atm_name": row.get("suspected_atm_name"),
                    "atm_total_complaints": row.get("atm_total_complaints"),
                    "atm_avg_loss": row.get("atm_avg_loss"),
                }
                records.append(r)
            
            if len(records) > 0:
                print("Mapped Record:", records[0])

            objects = [ATM(**r) for r in records]
            db.add_all(objects)
            db.commit()
            print(f"Seeded {len(records)} ATMs.")
        else:
            print("ATM Master file not found.")

        # 3. Seed Rank Pairs
        # This file is large (75MB), verify if needed or partial.
        # User said "Seed all these tables". 
        if db.query(RankPair).count() == 0:
            print(f"Seeding RankPairs from {RANK_PAIRS_PATH}...")
            if os.path.exists(RANK_PAIRS_PATH):
                # We might need to handle chunking if it's too big, but 75MB is okay for pandas + postgres usually.
                # Just reading necessary columns.
                df_rank = pd.read_csv(RANK_PAIRS_PATH)
                
                # Filter to columns we actually defined in RankPair model to avoiding errors if we didn't define all
                # Our RankPair model has: complaint_id, atm_id, label, atm_distance_km
                # Plus maybe day_of_week etc if we added them. 
                # Let's map specifically to avoid 'column x not found' error.
                
                records = []
                for _, row in df_rank.iterrows():
                    records.append({
                        "complaint_id": row.get("complaint_id"),
                        "atm_id": row.get("atm_id"),
                        "label": row.get("label"),
                        "atm_distance_km": row.get("atm_distance_km"),
                        # Add day_of_week if we added it to model, otherwise ignore.
                        # I'll stick to what I defined in `RankPair` in models.py
                    })
                
                db.bulk_insert_mappings(RankPair, records)
                db.commit()
                print(f"Seeded {len(records)} RankPairs.")
            else:
                print("Rank Pairs file not found.")
        else:
            print("RankPairs already seeded.")

        # 4. Seed Complaints from JS
        # We need to parse src/page/sampleComplaints.js
        # It's a JS file exporting an array. We can try to regex extract the JSON part or use node to dump it to json.
        # Regex is safer to avoid node dependency in python script if possible.
        if db.query(Complaint).count() == 0:
            print("Seeding Complaints from JS...")
            with open(SAMPLE_COMPLAINTS_JS_PATH, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Content looks like "export default [\n { ... }, \n { ... } \n];"
            # We can strip "export default " and ";", then parse as JSON?
            # JS object keys might not be quoted, e.g. complaint_id: "..." 
            # If keys are unquoted, json.loads will fail. 
            # sampleComplaints.js usually has unquoted keys in React projects.
            # I will use a simple regex to direct-insert or clean it.
            # OR I can manually construct a list if there are few.
            # There seem to be around 8 complaints.
            # Let's try to lazy-parse or just use the exact values I saw in view_file.
            
            # Actually, I'll use a hack: Replace key: with "key":
            import re
            # Remove "export default " and ";"
            json_str = content.replace("export default", "").strip().rstrip(";")
            # Quote keys
            json_str = re.sub(r'(\w+):', r'"\1":', json_str)
            # Fix potential issues with datetimes or trailing commas
            json_str = re.sub(r',\s*([\]}])', r'\1', json_str) # remove trailing comma
            
            try:
                complaints_data = json.loads(json_str)
                # Convert date string to datetime object if needed? 
                # Pydantic or SQLA will handle string-to-datetime often, but safer to parse.
                for c in complaints_data:
                    c['time_of_complaint'] = None # DB has complaint_timestamp
                    if 'complaint_timestamp' in c:
                        # "2025-09-21 10:32:00"
                        try:
                            c['complaint_timestamp'] = datetime.strptime(c['complaint_timestamp'], "%Y-%m-%d %H:%M:%S")
                        except:
                            pass
                    
                    # Ensure fields match model exactly.
                    # Model: complaint_id, victim_state...
                    # JS: complaint_id, victim_state... matches well.
                    
                    db_obj = Complaint(**c)
                    db.add(db_obj)
                
                db.commit()
                print(f"Seeded {len(complaints_data)} Complaints.")
            except Exception as e:
                print(f"Failed to parse JS complaints: {e}")
                # Fallback: maybe just hardcode the few I saw if parsing fails? 
                # Or use `node` to output json.
                pass
        else:
             print("Complaints already seeded.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
