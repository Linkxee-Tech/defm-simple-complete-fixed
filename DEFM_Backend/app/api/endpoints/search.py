from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.models import User, Evidence, Case, EvidenceType, CaseStatus
from app.schemas.schemas import Evidence as EvidenceSchema, Case as CaseSchema

import logging

router = APIRouter(prefix="/search", tags=["Search"])
logger = logging.getLogger(__name__)


@router.get("/evidence", response_model=List[EvidenceSchema])
async def search_evidence(
    q: str = Query(..., min_length=1, description="Search query"),
    case_id: Optional[int] = Query(None, description="Filter by case ID"),
    evidence_type: Optional[str] = Query(None, description="Filter by evidence type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search evidence by number/title/description with optional filters."""
    try:
        query = db.query(Evidence)

        search_conditions = [
            Evidence.evidence_number.ilike(f"%{q}%"),
            Evidence.title.ilike(f"%{q}%"),
            Evidence.description.ilike(f"%{q}%"),
        ]
        query = query.filter(or_(*search_conditions))

        if case_id:
            query = query.filter(Evidence.case_id == case_id)

        if evidence_type:
            try:
                evidence_type_enum = EvidenceType(evidence_type)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid evidence type")
            query = query.filter(Evidence.evidence_type == evidence_type_enum)

        if current_user.role.value == "investigator":
            assigned_case_ids = [
                case_id for (case_id,) in db.query(Case.id).filter(Case.assigned_to == current_user.id).all()
            ]
            query = query.filter(Evidence.case_id.in_(assigned_case_ids or [-1]))

        return query.limit(100).all()
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error searching evidence: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed",
        )


@router.get("/cases", response_model=List[CaseSchema])
async def search_cases(
    q: str = Query(..., min_length=1, description="Search query"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by case status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search cases by number/title/description with optional status filter."""
    try:
        query = db.query(Case)

        search_conditions = [
            Case.case_number.ilike(f"%{q}%"),
            Case.title.ilike(f"%{q}%"),
            Case.description.ilike(f"%{q}%"),
        ]
        query = query.filter(or_(*search_conditions))

        if status_filter:
            try:
                status_enum = CaseStatus(status_filter)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid case status")
            query = query.filter(Case.status == status_enum)

        if current_user.role.value == "investigator":
            query = query.filter(Case.assigned_to == current_user.id)

        return query.limit(100).all()
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error searching cases: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed",
        )
