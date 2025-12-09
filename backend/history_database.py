
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Separate SQLite DB for History
HISTORY_DATABASE_URL = "sqlite:///./history.db"

engine_history = create_engine(
    HISTORY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionHistory = sessionmaker(autocommit=False, autoflush=False, bind=engine_history)

BaseHistory = declarative_base()

def get_history_db():
    db = SessionHistory()
    try:
        yield db
    finally:
        db.close()
