from backend.database import SessionLocal, engine, Base
from backend.models import Complaint
from backend.seed_complaints_fix import seed_complaints as seed_fix

def clean_and_seed():
    db = SessionLocal()
    try:
        print("Deleting all complaints...")
        db.query(Complaint).delete()
        db.commit()
        print("Complaints table truncated.")
    except Exception as e:
        print(f"Error truncating: {e}")
        db.rollback()
    finally:
        db.close()
    
    # Re-seed
    seed_fix()

if __name__ == "__main__":
    clean_and_seed()
