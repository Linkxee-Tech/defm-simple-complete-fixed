from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User
from app.models.evidence import Evidence
from app.models.case import Case
from app.schemas.schemas import Evidence, Case
import logging

router = APIRouter(prefix="/search", tags=["Search"])
logger = logging.getLogger(__name__)

@router.get("/evidence", response_model=List[Evidence])
async def search_evidence(
    q: str = Query(..., min_length=1, description="Search query"),
    case_id: Optional[int] = Query(None, description="Filter by case ID"),
    evidence_type: Optional[str] = Query(None, description="Filter by evidence type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search evidence by text query with optional filters."""
    try:
        query = db.query(Evidence)
        
        # Build search conditions
        search_conditions = [
            Evidence.evidence_id.ilike(f"%{q}%"),
            Evidence.display_name.ilike(f"%{q}%"),
            Evidence.description.ilike(f"%{q}%")
        ]
        
        query = query.filter(or_(*search_conditions))
        
        # Apply additional filters
        if case_id:
            query = query.filter(Evidence.case_id == case_id)
        
        if evidence_type:
            query = query.filter(Evidence.evidence_type == evidence_type)
        
        # Role-based filtering
        if current_user.role not in ['admin', 'forensic_lead']:
            if current_user.role == 'investigator':
                # Investigators can see evidence from their assigned cases
                assigned_cases = db.query(Case).filter(Case.assigned_to == current_user.id).all()
                case_ids = [case.id for case in assigned_cases]
                query = query.filter(Evidence.case_id.in_(case_ids))
            else:
                # Other roles see only their own acquired evidence
                query = query.filter(Evidence.acquired_by == current_user.id)
        
        results = query.limit(100).all()
        return results
        
    except Exception as e:
        logger.error(f"Error searching evidence: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed"
        )

@router.get("/cases", response_model=List[Case])
async def search_cases(
    q: str = Query(..., min_length=1, description="Search query"),
    status: Optional[str] = Query(None, description="Filter by case status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search cases by text query with optional status filter."""
    try:
        query = db.query(Case)
        
        # Build search conditions
        search_conditions = [
            Case.case_number.ilike(f"%{q}%"),
            Case.title.ilike(f"%{q}%"),
            Case.description.ilike(f"%{q}%")
        ]
        
        query = query.filter(or_(*search_conditions))
        
        # Apply status filter
        if status:
            query = query.filter(Case.status == status)
        
        # Role-based filtering
        if current_user.role not in ['admin', 'forensic_lead']:
            if current_user.role == 'investigator':
                query = query.filter(Case.assigned_to == current_user.id)
            elif current_user.role == 'legal':
                query = query.filter(Case.legal_flagged == True)
        
        results = query.limit(100).all()
        return results
        
    except Exception as e:
        logger.error(f"Error searching cases: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed"
        )
