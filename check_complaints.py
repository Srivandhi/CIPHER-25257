
from backend.database import SessionLocal
from backend.models import Complaint

def count_complaints():
    db = SessionLocal()
    count = db.query(Complaint).count()
    print(f"Total Complaints: {count}")
    
    if count > 0:
        first = db.query(Complaint).first()
        print(f"First ID: {first.complaint_id}")
    db.close()

if __name__ == "__main__":
    count_complaints()
