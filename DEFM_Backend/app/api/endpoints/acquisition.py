from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User
from app.models.evidence import Evidence
from app.models.case import Case
from app.schemas.schemas import EvidenceCreate, Evidence
import logging

router = APIRouter(prefix="/acquisition", tags=["Acquisition"])
logger = logging.getLogger(__name__)

@router.post("/evidence", response_model=Evidence)
async def acquire_evidence(
    evidence_data: EvidenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Acquire new digital evidence."""
    try:
        # Verify case exists and user has access
        case = db.query(Case).filter(Case.id == evidence_data.case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        # Create evidence record
        evidence = Evidence(
            **evidence_data.dict(),
            acquired_by=current_user.id
        )
        
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        
        logger.info(f"Evidence {evidence.evidence_id} acquired by {current_user.username}")
        
        return evidence
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error acquiring evidence: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to acquire evidence"
        )

@router.get("/evidence", response_model=List[Evidence])
async def list_acquired_evidence(
    case_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List acquired evidence with optional case filter."""
    try:
        query = db.query(Evidence)
        
        if case_id:
            query = query.filter(Evidence.case_id == case_id)
        
        # Filter based on user role
        if current_user.role not in ['admin', 'forensic_lead']:
            query = query.filter(Evidence.acquired_by == current_user.id)
        
        evidence = query.all()
        return evidence
        
    except Exception as e:
        logger.error(f"Error listing evidence: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve evidence"
        )
