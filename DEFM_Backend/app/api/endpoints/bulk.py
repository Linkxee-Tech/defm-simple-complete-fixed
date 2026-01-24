from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User
from app.models.evidence import Evidence
from app.models.case import Case
import logging

router = APIRouter(prefix="/bulk", tags=["Bulk Operations"])
logger = logging.getLogger(__name__)

class BulkEvidenceUpdate(BaseModel):
    evidence_ids: List[int]
    updates: Dict[str, Any]

class BulkCaseUpdate(BaseModel):
    case_ids: List[int]
    updates: Dict[str, Any]

@router.post("/evidence/update")
async def bulk_update_evidence(
    bulk_update: BulkEvidenceUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk update multiple evidence records."""
    try:
        # Verify user has permission for bulk operations
        if current_user.role not in ['admin', 'forensic_lead']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for bulk operations"
            )
        
        # Validate evidence IDs exist
        existing_evidence = db.query(Evidence).filter(
            Evidence.id.in_(bulk_update.evidence_ids)
        ).all()
        
        if len(existing_evidence) != len(bulk_update.evidence_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more evidence records not found"
            )
        
        # Perform bulk update
        updated_count = db.query(Evidence).filter(
            Evidence.id.in_(bulk_update.evidence_ids)
        ).update(bulk_update.updates, synchronize_session=False)
        
        db.commit()
        
        # Log the bulk operation
        background_tasks.add_task(
            log_bulk_operation,
            current_user.id,
            "bulk_evidence_update",
            f"Updated {updated_count} evidence records",
            bulk_update.evidence_ids
        )
        
        return {
            "message": f"Successfully updated {updated_count} evidence records",
            "updated_count": updated_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Bulk evidence update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk update failed"
        )

@router.post("/cases/update")
async def bulk_update_cases(
    bulk_update: BulkCaseUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk update multiple case records."""
    try:
        # Verify user has permission for bulk operations
        if current_user.role not in ['admin', 'forensic_lead']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for bulk operations"
            )
        
        # Validate case IDs exist
        existing_cases = db.query(Case).filter(
            Case.id.in_(bulk_update.case_ids)
        ).all()
        
        if len(existing_cases) != len(bulk_update.case_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more case records not found"
            )
        
        # Perform bulk update
        updated_count = db.query(Case).filter(
            Case.id.in_(bulk_update.case_ids)
        ).update(bulk_update.updates, synchronize_session=False)
        
        db.commit()
        
        # Log the bulk operation
        background_tasks.add_task(
            log_bulk_operation,
            current_user.id,
            "bulk_case_update",
            f"Updated {updated_count} case records",
            bulk_update.case_ids
        )
        
        return {
            "message": f"Successfully updated {updated_count} case records",
            "updated_count": updated_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Bulk case update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk update failed"
        )

@router.delete("/evidence")
async def bulk_delete_evidence(
    evidence_ids: List[int],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk delete multiple evidence records (soft delete)."""
    try:
        # Verify user has permission for bulk operations
        if current_user.role not in ['admin', 'forensic_lead']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for bulk operations"
            )
        
        # Validate evidence IDs exist
        existing_evidence = db.query(Evidence).filter(
            Evidence.id.in_(evidence_ids)
        ).all()
        
        if len(existing_evidence) != len(evidence_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more evidence records not found"
            )
        
        # Perform soft delete
        deleted_count = db.query(Evidence).filter(
            Evidence.id.in_(evidence_ids)
        ).update({"deleted_at": datetime.utcnow()}, synchronize_session=False)
        
        db.commit()
        
        # Log the bulk operation
        background_tasks.add_task(
            log_bulk_operation,
            current_user.id,
            "bulk_evidence_delete",
            f"Soft deleted {deleted_count} evidence records",
            evidence_ids
        )
        
        return {
            "message": f"Successfully deleted {deleted_count} evidence records",
            "deleted_count": deleted_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Bulk evidence delete failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk delete failed"
        )

async def log_bulk_operation(user_id: int, operation_type: str, description: str, target_ids: List[int]):
    """Log bulk operations for audit trail."""
    logger.info(f"User {user_id} performed {operation_type}: {description}")
    # In a real implementation, this would create an audit log entry
