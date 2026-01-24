from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies.roles import require_role
from app.core.database import get_db
from app.models.models import User

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users", dependencies=[Depends(require_role("admin"))])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
