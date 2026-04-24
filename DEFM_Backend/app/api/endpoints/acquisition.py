from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_audit_service
from app.core.database import get_db
from app.models.models import Evidence, Case, User
from app.schemas.schemas import EvidenceCreate, Evidence as EvidenceSchema
from app.services.audit_service import AuditService

import logging

router = APIRouter(prefix="/acquisition", tags=["Acquisition"])
logger = logging.getLogger(__name__)


def generate_evidence_number(db: Session) -> str:
    last_evidence = db.query(Evidence).order_by(Evidence.id.desc()).first()
    next_id = 1 if last_evidence is None else (last_evidence.id + 1)
    return f"EVD-{datetime.utcnow().strftime('%Y%m%d')}-{next_id:06d}"


@router.post("/evidence", response_model=EvidenceSchema)
async def acquire_evidence(
    evidence_data: EvidenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service),
):
    """Acquire new evidence through dedicated acquisition endpoint."""
    case = db.query(Case).filter(Case.id == evidence_data.case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )

    try:
        evidence = Evidence(
            evidence_number=generate_evidence_number(db),
            case_id=evidence_data.case_id,
            title=evidence_data.title,
            description=evidence_data.description,
            evidence_type=evidence_data.evidence_type,
            status=evidence_data.status,
            collection_location=evidence_data.collection_location,
            collection_method=evidence_data.collection_method,
            collected_by=current_user.id,
        )

        db.add(evidence)
        db.commit()
        db.refresh(evidence)

        await audit_service.log_action(
            action="evidence_acquired",
            entity_type="evidence",
            entity_id=evidence.id,
            details=f"Acquired evidence {evidence.evidence_number} for case {case.case_number}",
        )

        logger.info("Evidence acquired by %s: %s", current_user.username, evidence.evidence_number)
        return evidence
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Error acquiring evidence: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to acquire evidence",
        )


@router.get("/evidence", response_model=List[EvidenceSchema])
async def list_acquired_evidence(
    case_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List acquired evidence with optional case filter."""
    try:
        query = db.query(Evidence)

        if case_id:
            query = query.filter(Evidence.case_id == case_id)

        if current_user.role.value == "investigator":
            query = query.filter(Evidence.collected_by == current_user.id)

        return query.order_by(Evidence.collected_at.desc()).all()
    except Exception as e:
        logger.error("Error listing acquired evidence: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve evidence",
        )
