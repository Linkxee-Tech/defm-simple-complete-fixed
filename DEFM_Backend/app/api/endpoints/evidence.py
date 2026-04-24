from datetime import datetime
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, selectinload

from app.api.dependencies import get_current_user, get_audit_service
from app.core.config import settings
from app.core.database import get_db
from app.models.models import Evidence, Case, User, EvidenceType, EvidenceStatus
from app.schemas.schemas import (
    Evidence as EvidenceSchema,
    EvidenceCreate,
    EvidenceUpdate,
    FileUpload,
)
from app.services.audit_service import AuditService
from app.utils.file_utils import validate_file, save_upload_file

import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def generate_evidence_number(db: Session) -> str:
    """Generate a sequential evidence number."""
    last_evidence = db.query(Evidence).order_by(Evidence.id.desc()).first()
    next_id = 1 if last_evidence is None else (last_evidence.id + 1)
    return f"EVD-{datetime.utcnow().strftime('%Y%m%d')}-{next_id:06d}"


def compute_file_hash_from_path(file_path: str) -> str:
    """Compute SHA-256 hash for a file already stored on disk."""
    import hashlib

    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()


os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)


@router.get("/", response_model=List[EvidenceSchema])
async def read_evidence(
    skip: int = 0,
    limit: int = 100,
    case_id: Optional[int] = None,
    evidence_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get evidence with optional filters."""
    query = db.query(Evidence).options(
        selectinload(Evidence.collected_by_user),
        selectinload(Evidence.case),
        selectinload(Evidence.custody_records),
    )

    if case_id:
        query = query.filter(Evidence.case_id == case_id)

    if evidence_type:
        try:
            evidence_type_enum = EvidenceType(evidence_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid evidence type")
        query = query.filter(Evidence.evidence_type == evidence_type_enum)

    if status:
        try:
            evidence_status_enum = EvidenceStatus(status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid evidence status")
        query = query.filter(Evidence.status == evidence_status_enum)

    return query.offset(skip).limit(limit).all()


@router.get("/{evidence_id}", response_model=EvidenceSchema)
async def read_evidence_item(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get evidence by ID."""
    evidence = (
        db.query(Evidence)
        .options(
            selectinload(Evidence.collected_by_user),
            selectinload(Evidence.case),
            selectinload(Evidence.custody_records),
        )
        .filter(Evidence.id == evidence_id)
        .first()
    )
    if evidence is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found",
        )
    return evidence


@router.post("/", response_model=EvidenceSchema)
async def create_evidence(
    evidence_create: EvidenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service),
):
    """Create new evidence entry."""
    case_id = evidence_create.case_id
    if not case_id:
        # Graceful fallback for legacy desktop bundles that may submit
        # empty case_id; attach to the most recently created case.
        fallback_case = db.query(Case).order_by(Case.id.desc()).first()
        if not fallback_case:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No case available. Create a case first.",
            )
        case_id = fallback_case.id

    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )

    db_evidence = Evidence(
        evidence_number=generate_evidence_number(db),
        case_id=case_id,
        title=evidence_create.title,
        description=evidence_create.description,
        evidence_type=evidence_create.evidence_type,
        status=evidence_create.status,
        collection_location=evidence_create.collection_location,
        collection_method=evidence_create.collection_method,
        collected_by=current_user.id,
    )

    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)

    await audit_service.log_action(
        action="evidence_created",
        entity_type="evidence",
        entity_id=db_evidence.id,
        details=f"Created evidence: {db_evidence.evidence_number} - {db_evidence.title}",
    )

    logger.info(
        "Evidence created: %s by %s",
        db_evidence.evidence_number,
        current_user.username,
    )
    return db_evidence


@router.post("/{evidence_id}/upload", response_model=FileUpload)
async def upload_evidence_file(
    evidence_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service),
):
    """Upload file for evidence and persist computed SHA-256 hash."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found",
        )

    await validate_file(file)

    try:
        upload_dir = os.path.join(
            settings.UPLOAD_DIRECTORY,
            str(evidence.case_id),
            str(evidence_id),
        )
        file_path = os.path.join(upload_dir, file.filename)

        saved_path, file_size, file_hash = await save_upload_file(file, file_path)

        evidence.file_name = file.filename
        evidence.file_path = saved_path
        evidence.file_size = file_size
        evidence.file_hash = file_hash
        evidence.mime_type = file.content_type

        db.commit()
        db.refresh(evidence)

        await audit_service.log_action(
            action="file_uploaded",
            entity_type="evidence",
            entity_id=evidence_id,
            details=f"Uploaded file: {file.filename} for evidence {evidence.evidence_number}",
        )

        logger.info(
            "File uploaded: %s for evidence %s by %s",
            file.filename,
            evidence.evidence_number,
            current_user.username,
        )

        return FileUpload(
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream",
            file_size=file_size,
            file_hash=file_hash,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("File upload error: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )


@router.get("/{evidence_id}/download")
async def download_evidence_file(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download evidence file."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence or not evidence.file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence file not found",
        )
    if not os.path.exists(evidence.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file not found",
        )

    filename = evidence.file_name or os.path.basename(evidence.file_path)
    return FileResponse(
        path=evidence.file_path,
        media_type=evidence.mime_type or "application/octet-stream",
        filename=filename,
    )


@router.put("/{evidence_id}", response_model=EvidenceSchema)
async def update_evidence(
    evidence_id: int,
    evidence_update: EvidenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service),
):
    """Update evidence."""
    db_evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if db_evidence is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found",
        )

    update_data = evidence_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_evidence, field, value)

    db.commit()
    db.refresh(db_evidence)

    await audit_service.log_action(
        action="evidence_updated",
        entity_type="evidence",
        entity_id=db_evidence.id,
        details=f"Updated evidence: {db_evidence.evidence_number}",
    )

    logger.info(
        "Evidence updated: %s by %s",
        db_evidence.evidence_number,
        current_user.username,
    )
    return db_evidence


@router.delete("/{evidence_id}")
async def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service),
):
    """Delete evidence (admin/manager only)."""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    db_evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if db_evidence is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found",
        )

    evidence_number = db_evidence.evidence_number

    if db_evidence.file_path and os.path.exists(db_evidence.file_path):
        try:
            os.remove(db_evidence.file_path)
        except Exception as e:
            logger.error("Failed to delete physical file: %s", str(e))

    db.delete(db_evidence)
    db.commit()

    await audit_service.log_action(
        action="evidence_deleted",
        entity_type="evidence",
        entity_id=evidence_id,
        details=f"Deleted evidence: {evidence_number}",
    )

    logger.info("Evidence deleted: %s by %s", evidence_number, current_user.username)
    return {"message": "Evidence deleted successfully"}


@router.post("/{evidence_id}/verify-integrity")
async def verify_evidence_integrity(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service),
):
    """Verify evidence file integrity using hash comparison."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found",
        )

    if not evidence.file_path or not evidence.file_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file or hash information available",
        )

    if not os.path.exists(evidence.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file not found",
        )

    current_hash = compute_file_hash_from_path(evidence.file_path)
    integrity_verified = current_hash == evidence.file_hash

    await audit_service.log_action(
        action="integrity_check",
        entity_type="evidence",
        entity_id=evidence_id,
        details=(
            f"Integrity check for {evidence.evidence_number}: "
            f"{'PASSED' if integrity_verified else 'FAILED'}"
        ),
    )

    return {
        "evidence_id": evidence_id,
        "evidence_number": evidence.evidence_number,
        "integrity_verified": integrity_verified,
        "original_hash": evidence.file_hash,
        "current_hash": current_hash,
        "checked_at": datetime.utcnow().isoformat(),
    }
