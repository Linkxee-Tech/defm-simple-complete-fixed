from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os
import hashlib
import aiofiles
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Evidence, Case, User, EvidenceType, EvidenceStatus
from app.schemas.schemas import Evidence as EvidenceSchema, EvidenceCreate, EvidenceUpdate, FileUpload
from app.api.dependencies import get_current_user, get_audit_service
from app.services.audit_service import AuditService
# from app.utils.file_utils import validate_file, get_file_hash, generate_evidence_number
import logging

# Temporary placeholder functions
def validate_file(file):
    return True

def get_file_hash(content):
    return hashlib.sha256(content).hexdigest()

def generate_evidence_number():
    return f"EVI{datetime.now().strftime('%Y%m%d%H%M%S')}"

router = APIRouter()
logger = logging.getLogger(__name__)

class EvidenceResponse(BaseModel):
    filename: str
    case_id: int
    message: Optional[str] = "Upload successful"
    
# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)


@router.get("/", response_model=List[EvidenceSchema])
async def read_evidence(
    skip: int = 0,
    limit: int = 100,
    case_id: Optional[int] = None,
    evidence_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get evidence with optional filters."""
    query = (
        db.query(Evidence)
        .options(
            selectinload(Evidence.collected_by_user),
            selectinload(Evidence.case),
            selectinload(Evidence.custody_records)
        )
    )

    # Apply filters
    if case_id:
        query = query.filter(Evidence.case_id == case_id)
    if evidence_type:
        try:
            type_enum = EvidenceType(evidence_type)
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid evidence type")
        query = query.filter(Evidence.evidence_type == type_enum)
    if status:
        try:
            status_enum = EvidenceStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid evidence status")
        query = query.filter(Evidence.status == status_enum)

    evidence_list = query.offset(skip).limit(limit).all()
    return evidence_list


@router.get("/{evidence_id}", response_model=EvidenceSchema)
async def read_evidence_item(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get evidence by ID."""
    evidence = (
        db.query(Evidence)
        .options(
            selectinload(Evidence.collected_by_user),
            selectinload(Evidence.case),
            selectinload(Evidence.custody_records)
        )
        .filter(Evidence.id == evidence_id)
        .first()
    )
    if evidence is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )
    return evidence


@router.post("/", response_model=EvidenceSchema)
async def create_evidence(
    evidence_create: EvidenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Create new evidence entry."""
    # Verify case exists
    case = db.query(Case).filter(Case.id == evidence_create.case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )

    # Generate evidence number
    evidence_number = generate_evidence_number(db, case.case_number)

    db_evidence = Evidence(
        evidence_number=evidence_number,
        case_id=evidence_create.case_id,
        title=evidence_create.title,
        description=evidence_create.description,
        evidence_type=evidence_create.evidence_type,
        status=evidence_create.status,
        collection_location=evidence_create.collection_location,
        collection_method=evidence_create.collection_method,
        collected_by=current_user.id
    )

    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)

    # Log the action
    await audit_service.log_action(
        action="evidence_created",
        entity_type="evidence",
        entity_id=db_evidence.id,
        details=f"Created evidence: {db_evidence.evidence_number} - {db_evidence.title}"
    )

    logger.info(
        f"Evidence created: {db_evidence.evidence_number} by {current_user.username}")
    return db_evidence


@router.post("/{evidence_id}/upload", response_model=FileUpload)
async def upload_evidence_file(
    evidence_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Upload file for evidence."""
    # Get evidence record
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )

    # Validate file
    validation_result = validate_file(file)
    if not validation_result["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=validation_result["error"]
        )

    try:
        # Create directory structure: uploads/case_id/evidence_id/
        upload_dir = os.path.join(settings.UPLOAD_DIRECTORY, str(
            evidence.case_id), str(evidence_id))
        os.makedirs(upload_dir, exist_ok=True)

        # Save file
        file_path = os.path.join(upload_dir, file.filename)

        # Calculate hash while writing file
        hash_sha256 = hashlib.sha256()

        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            hash_sha256.update(content)
            await f.write(content)

        file_hash = hash_sha256.hexdigest()

        # Update evidence record with file information
        evidence.file_name = file.filename
        evidence.file_path = file_path
        evidence.file_size = len(content)
        evidence.file_hash = file_hash
        evidence.mime_type = file.content_type

        db.commit()
        db.refresh(evidence)

        # Log the action
        await audit_service.log_action(
            action="file_uploaded",
            entity_type="evidence",
            entity_id=evidence_id,
            details=f"Uploaded file: {file.filename} for evidence {evidence.evidence_number}"
        )

        logger.info(
            f"File uploaded: {file.filename} for evidence {evidence.evidence_number} by {current_user.username}")

        return FileUpload(
            filename=file.filename,
            content_type=file.content_type,
            file_size=len(content),
            file_hash=file_hash
        )

    except Exception as e:
        logger.error(f"File upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.get("/{evidence_id}/download")
async def download_evidence_file(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download evidence file."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence or not evidence.file_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Evidence file not found")
    if not os.path.exists(evidence.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Physical file not found")

    filename = evidence.file_name or os.path.basename(evidence.file_path)

    return FileResponse(
        path=evidence.file_path,
        media_type=evidence.mime_type or "application/octet-stream",
        filename=filename
    )


@router.put("/{evidence_id}", response_model=EvidenceSchema)
async def update_evidence(
    evidence_id: int,
    evidence_update: EvidenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Update evidence."""
    db_evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if db_evidence is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )

    # Update fields
    update_data = evidence_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_evidence, field, value)

    db.commit()
    db.refresh(db_evidence)

    # Log the action
    await audit_service.log_action(
        action="evidence_updated",
        entity_type="evidence",
        entity_id=db_evidence.id,
        details=f"Updated evidence: {db_evidence.evidence_number}"
    )

    logger.info(
        f"Evidence updated: {db_evidence.evidence_number} by {current_user.username}")
    return db_evidence


@router.delete("/{evidence_id}")
async def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Delete evidence (admin/manager only)."""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    db_evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if db_evidence is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )

    evidence_number = db_evidence.evidence_number

    # Delete physical file if exists
    if db_evidence.file_path and os.path.exists(db_evidence.file_path):
        try:
            os.remove(db_evidence.file_path)
        except Exception as e:
            logger.error(f"Failed to delete physical file: {str(e)}")

    db.delete(db_evidence)
    db.commit()

    # Log the action
    await audit_service.log_action(
        action="evidence_deleted",
        entity_type="evidence",
        entity_id=evidence_id,
        details=f"Deleted evidence: {evidence_number}"
    )

    logger.info(
        f"Evidence deleted: {evidence_number} by {current_user.username}")
    return {"message": "Evidence deleted successfully"}


@router.post("/upload", response_model=EvidenceResponse)
def upload_evidence(file: UploadFile = File(...), case_id: int = Form(...)):
    """
    Upload evidence endpoint.
    """
    # For now, just return placeholder response
    return EvidenceResponse(filename=file.filename, case_id=case_id)


@router.post("/{evidence_id}/verify-integrity")
async def verify_evidence_integrity(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Verify evidence file integrity using hash comparison."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )

    if not evidence.file_path or not evidence.file_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file or hash information available"
        )

    if not os.path.exists(evidence.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file not found"
        )

    # Calculate current file hash
    current_hash = get_file_hash(evidence.file_path)

    integrity_verified = current_hash == evidence.file_hash

    # Log the verification
    await audit_service.log_action(
        action="integrity_check",
        entity_type="evidence",
        entity_id=evidence_id,
        details=f"Integrity check for {evidence.evidence_number}: {'PASSED' if integrity_verified else 'FAILED'}"
    )

    return {
        "evidence_id": evidence_id,
        "evidence_number": evidence.evidence_number,
        "integrity_verified": integrity_verified,
        "original_hash": evidence.file_hash,
        "current_hash": current_hash,
        "checked_at": datetime.utcnow().isoformat()
    }
