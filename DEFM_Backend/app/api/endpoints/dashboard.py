from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.models import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return {
        "total_cases": db.query(Case).count(),
        "total_evidence": db.query(Evidence).count(),
        "total_users": db.query(User).count(),
    }
