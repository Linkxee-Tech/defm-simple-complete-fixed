from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_audit_service
from app.core.database import get_db
from app.models.models import User, Evidence, Case
from app.services.audit_service import AuditService

import logging

router = APIRouter(prefix="/bulk", tags=["Bulk Operations"])
logger = logging.getLogger(__name__)


class BulkEvidenceUpdate(BaseModel):
    evidence_ids: List[int]
    updates: Dict[str, Any]


class BulkCaseUpdate(BaseModel):
    case_ids: List[int]
    updates: Dict[str, Any]


def ensure_bulk_permissions(current_user: User) -> None:
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions for bulk operations",
        )


@router.post("/evidence/update")
async def bulk_update_evidence(
    bulk_update: BulkEvidenceUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service),
):
    """Bulk update multiple evidence records."""
    try:
        ensure_bulk_permissions(current_user)

        existing_evidence = db.query(Evidence).filter(Evidence.id.in_(bulk_update.evidence_ids)).all()
        if len(existing_evidence) != len(bulk_update.evidence_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more evidence records not found",
            )

        updated_count = (
            db.query(Evidence)
            .filter(Evidence.id.in_(bulk_update.evidence_ids))
            .update(bulk_update.updates, synchronize_session=False)
        )
        db.commit()

        background_tasks.add_task(
            log_bulk_operation,
            current_user.username,
            "bulk_evidence_update",
            f"Updated {updated_count} evidence records",
        )
        await audit_service.log_action(
            action="bulk_evidence_updated",
            entity_type="evidence",
            details=f"Updated {updated_count} evidence records",
        )

        return {"message": f"Successfully updated {updated_count} evidence records", "updated_count": updated_count}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Bulk evidence update failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk update failed",
        )


@router.post("/cases/update")
async def bulk_update_cases(
    bulk_update: BulkCaseUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service),
):
    """Bulk update multiple case records."""
    try:
        ensure_bulk_permissions(current_user)

        existing_cases = db.query(Case).filter(Case.id.in_(bulk_update.case_ids)).all()
        if len(existing_cases) != len(bulk_update.case_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more case records not found",
            )

        updated_count = (
            db.query(Case)
            .filter(Case.id.in_(bulk_update.case_ids))
            .update(bulk_update.updates, synchronize_session=False)
        )
        db.commit()

        background_tasks.add_task(
            log_bulk_operation,
            current_user.username,
            "bulk_case_update",
            f"Updated {updated_count} case records",
        )
        await audit_service.log_action(
            action="bulk_case_updated",
            entity_type="case",
            details=f"Updated {updated_count} case records",
        )

        return {"message": f"Successfully updated {updated_count} case records", "updated_count": updated_count}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Bulk case update failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk update failed",
        )


@router.delete("/evidence")
async def bulk_delete_evidence(
    evidence_ids: List[int],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service),
):
    """Bulk delete multiple evidence records (hard delete)."""
    try:
        ensure_bulk_permissions(current_user)

        existing_evidence = db.query(Evidence).filter(Evidence.id.in_(evidence_ids)).all()
        if len(existing_evidence) != len(evidence_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more evidence records not found",
            )

        deleted_count = db.query(Evidence).filter(Evidence.id.in_(evidence_ids)).delete(synchronize_session=False)
        db.commit()

        background_tasks.add_task(
            log_bulk_operation,
            current_user.username,
            "bulk_evidence_delete",
            f"Deleted {deleted_count} evidence records",
        )
        await audit_service.log_action(
            action="bulk_evidence_deleted",
            entity_type="evidence",
            details=f"Deleted {deleted_count} evidence records",
        )

        return {"message": f"Successfully deleted {deleted_count} evidence records", "deleted_count": deleted_count}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Bulk evidence delete failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk delete failed",
        )


async def log_bulk_operation(actor_username: str, operation_type: str, description: str):
    """Log bulk operation details."""
    logger.info("User %s performed %s: %s", actor_username, operation_type, description)
