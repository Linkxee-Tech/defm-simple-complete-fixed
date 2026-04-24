from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from dotenv import load_dotenv
from pathlib import Path
import os

# Ensure the database directory exists for SQLite
load_dotenv()

# Prefer explicit environment value, then fall back to configured default.
DATABASE_URL = os.getenv("DATABASE_URL") or settings.DATABASE_URL

# Normalize relative SQLite paths to backend root so running from a different
# working directory still points to the same database file.
if DATABASE_URL.startswith("sqlite:///"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    if not os.path.isabs(db_path):
        backend_root = Path(__file__).resolve().parents[2]
        normalized_path = (backend_root / db_path).resolve()
        DATABASE_URL = f"sqlite:///{normalized_path.as_posix()}"
        db_path = str(normalized_path)

    # SQLite-specific handling (Windows safe)
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith(
        "sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Database dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
