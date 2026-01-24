from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from app.core.database import get_db
from app.models.models import ChainOfCustody, Evidence, User
from app.schemas.schemas import ChainOfCustody as ChainOfCustodySchema, ChainOfCustodyCreate
from app.api.dependencies import get_current_user, get_audit_service
from app.services.audit_service import AuditService
import logging
from app.models.chain_of_custody import ChainOfCustody

router = APIRouter(prefix="/chain-of-custody", tags=["Chain of Custody"])

@router.get("/{evidence_id}")
def get_chain(evidence_id: int, db: Session = Depends(get_db)):
    return (
        db.query(ChainOfCustody)
        .filter(ChainOfCustody.evidence_id == evidence_id)
        .order_by(ChainOfCustody.timestamp.asc())
        .all()
    )

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[ChainOfCustodySchema])
async def read_chain_of_custody(
    skip: int = 0,
    limit: int = 100,
    evidence_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chain of custody records with optional filters."""
    query = (
        db.query(ChainOfCustody)
        .options(
            selectinload(ChainOfCustody.handler_user),
            selectinload(ChainOfCustody.evidence)
        )
    )
    
    # Apply filters
    if evidence_id:
        query = query.filter(ChainOfCustody.evidence_id == evidence_id)
    
    custody_records = query.offset(skip).limit(limit).all()
    return custody_records

@router.get("/evidence/{evidence_id}", response_model=List[ChainOfCustodySchema])
async def read_evidence_custody_chain(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete chain of custody for specific evidence."""
    # Verify evidence exists
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )
    
    custody_records = (
        db.query(ChainOfCustody)
        .options(
            selectinload(ChainOfCustody.handler_user),
            selectinload(ChainOfCustody.evidence)
        )
        .filter(ChainOfCustody.evidence_id == evidence_id)
        .order_by(ChainOfCustody.timestamp.desc())
        .all()
    )
    
    return custody_records

@router.get("/{custody_id}", response_model=ChainOfCustodySchema)
async def read_custody_record(
    custody_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chain of custody record by ID."""
    custody_record = (
        db.query(ChainOfCustody)
        .options(
            selectinload(ChainOfCustody.handler_user),
            selectinload(ChainOfCustody.evidence)
        )
        .filter(ChainOfCustody.id == custody_id)
        .first()
    )
    if custody_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chain of custody record not found"
        )
    return custody_record

@router.post("/", response_model=ChainOfCustodySchema)
async def create_custody_record(
    custody_create: ChainOfCustodyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Create new chain of custody record."""
    # Verify evidence exists
    evidence = db.query(Evidence).filter(Evidence.id == custody_create.evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )
    
    # Verify transferred_to user exists if specified
    if custody_create.transferred_to:
        transferred_to_user = db.query(User).filter(User.id == custody_create.transferred_to).first()
        if not transferred_to_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transferred to user not found"
            )
    
    # Verify transferred_from user exists if specified
    if custody_create.transferred_from:
        transferred_from_user = db.query(User).filter(User.id == custody_create.transferred_from).first()
        if not transferred_from_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transferred from user not found"
            )
    
    db_custody = ChainOfCustody(
        evidence_id=custody_create.evidence_id,
        handler_id=current_user.id,
        action=custody_create.action,
        location=custody_create.location,
        purpose=custody_create.purpose,
        notes=custody_create.notes,
        transferred_from=custody_create.transferred_from,
        transferred_to=custody_create.transferred_to
    )
    
    db.add(db_custody)
    db.commit()
    db.refresh(db_custody)
    
    # Log the action
    await audit_service.log_action(
        action="custody_record_created",
        entity_type="chain_of_custody",
        entity_id=db_custody.id,
        details=f"Created custody record for evidence {evidence.evidence_number}: {custody_create.action}"
    )
    
    logger.info(f"Custody record created for evidence {evidence.evidence_number} by {current_user.username}")
    return db_custody

@router.post("/transfer", response_model=ChainOfCustodySchema)
async def transfer_evidence_custody(
    evidence_id: int,
    transferred_to: int,
    location: str,
    purpose: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Transfer evidence custody to another user."""
    # Verify evidence exists
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )
    
    # Verify target user exists
    target_user = db.query(User).filter(User.id == transferred_to).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found"
        )
    
    # Cannot transfer to self
    if transferred_to == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot transfer custody to yourself"
        )
    
    # Create custody record for the transfer
    db_custody = ChainOfCustody(
        evidence_id=evidence_id,
        handler_id=current_user.id,
        action="transferred",
        location=location,
        purpose=purpose,
        notes=notes,
        transferred_from=current_user.id,
        transferred_to=transferred_to
    )
    
    db.add(db_custody)
    db.commit()
    db.refresh(db_custody)
    
    # Log the action
    await audit_service.log_action(
        action="evidence_transferred",
        entity_type="chain_of_custody",
        entity_id=db_custody.id,
        details=f"Transferred evidence {evidence.evidence_number} from {current_user.full_name} to {target_user.full_name}"
    )
    
    logger.info(f"Evidence {evidence.evidence_number} transferred from {current_user.username} to {target_user.username}")
    return db_custody

@router.delete("/{custody_id}")
async def delete_custody_record(
    custody_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Delete chain of custody record (admin/manager only)."""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_custody = db.query(ChainOfCustody).filter(ChainOfCustody.id == custody_id).first()
    if db_custody is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chain of custody record not found"
        )
    
    custody_info = f"Evidence ID: {db_custody.evidence_id}, Action: {db_custody.action}"
    db.delete(db_custody)
    db.commit()
    
    # Log the action
    await audit_service.log_action(
        action="custody_record_deleted",
        entity_type="chain_of_custody",
        entity_id=custody_id,
        details=f"Deleted custody record: {custody_info}"
    )
    
    logger.info(f"Custody record deleted: {custody_info} by {current_user.username}")
    return {"message": "Chain of custody record deleted successfully"}