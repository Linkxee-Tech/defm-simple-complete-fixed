from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Report, Case, User
from app.schemas.schemas import Report as ReportSchema, ReportCreate
from app.api.dependencies import get_current_user, get_audit_service
from app.services.audit_service import AuditService
from app.services.report_service import ReportService
from fastapi.responses import StreamingResponse

import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Ensure reports directory exists
os.makedirs("./reports", exist_ok=True)
    
@router.get("/", response_model=List[ReportSchema])
async def read_reports(
    skip: int = 0,
    limit: int = 100,
    case_id: Optional[int] = None,
    report_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get reports with optional filters."""
    query = db.query(Report)
    
    # Apply filters
    if case_id:
        query = query.filter(Report.case_id == case_id)
    if report_type:
        query = query.filter(Report.report_type == report_type)
    
    reports = query.offset(skip).limit(limit).all()
    return reports

@router.get("/{report_id}", response_model=ReportSchema)
async def read_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get report by ID."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    return report

@router.post("/", response_model=ReportSchema)
async def create_report(
    report_create: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Create new report."""
    # Verify case exists
    case = db.query(Case).filter(Case.id == report_create.case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    db_report = Report(
        case_id=report_create.case_id,
        title=report_create.title,
        content=report_create.content,
        report_type=report_create.report_type,
        generated_by=current_user.id
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    # Log the action
    await audit_service.log_action(
        action="report_created",
        entity_type="report",
        entity_id=db_report.id,
        details=f"Created report: {db_report.title} for case {case.case_number}"
    )
    
    logger.info(f"Report created: {db_report.title} by {current_user.username}")
    return db_report

@router.post("/generate/{case_id}")
async def generate_case_report(
    case_id: int,
    report_type: str = "summary",
    include_evidence: bool = True,
    include_custody: bool = True,
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Generate comprehensive case report."""
    # Verify case exists
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    try:
        # Initialize report service
        report_service = ReportService(db)
        
        # Generate report based on type
        if format.lower() == "pdf":
            file_path = await report_service.generate_pdf_report(
                case=case,
                report_type=report_type,
                include_evidence=include_evidence,
                include_custody=include_custody,
                generated_by=current_user
            )
        else:
            # Default to HTML/text format
            content = await report_service.generate_text_report(
                case=case,
                report_type=report_type,
                include_evidence=include_evidence,
                include_custody=include_custody
            )
            
            # Save as text file
            filename = f"report_{case.case_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            file_path = os.path.join("./reports", filename)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        # Create report record
        db_report = Report(
            case_id=case_id,
            title=f"{report_type.title()} Report - {case.case_number}",
            content=f"Generated {report_type} report for case {case.case_number}",
            report_type=report_type,
            generated_by=current_user.id,
            file_path=file_path
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        # Log the action
        await audit_service.log_action(
            action="report_generated",
            entity_type="report",
            entity_id=db_report.id,
            details=f"Generated {format.upper()} {report_type} report for case {case.case_number}"
        )
        
        logger.info(f"Report generated: {file_path} by {current_user.username}")
        
        return {
            "report_id": db_report.id,
            "case_id": case_id,
            "case_number": case.case_number,
            "report_type": report_type,
            "format": format,
            "file_path": file_path,
            "generated_at": db_report.generated_at.isoformat(),
            "generated_by": current_user.full_name
        }
        
    except Exception as e:
        logger.error(f"Report generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )

@router.get("/{report_id}/download")
async def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Download report file."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report file not found"
        )
    
    # Log the download
    await audit_service.log_action(
        action="report_downloaded",
        entity_type="report",
        entity_id=report_id,
        details=f"Downloaded report: {report.title}"
    )
    
    # Determine content type based on file extension
    file_extension = os.path.splitext(report.file_path)[1].lower()
    content_type = "application/octet-stream"
    
    if file_extension == ".pdf":
        content_type = "application/pdf"
    elif file_extension == ".txt":
        content_type = "text/plain"
    elif file_extension == ".html":
        content_type = "text/html"
    elif file_extension == ".docx":
        content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    # Read file content
    try:
        with open(report.file_path, 'rb') as f:
            file_content = f.read()
        
        filename = os.path.basename(report.file_path)
        
        return Response(
            content=file_content,
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"File download error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download report file"
        )

@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Delete report (admin/manager only)."""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_report = db.query(Report).filter(Report.id == report_id).first()
    if db_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    report_title = db_report.title
    
    # Delete physical file if exists
    if db_report.file_path and os.path.exists(db_report.file_path):
        try:
            os.remove(db_report.file_path)
        except Exception as e:
            logger.error(f"Failed to delete report file: {str(e)}")
    
    db.delete(db_report)
    db.commit()
    
    # Log the action
    await audit_service.log_action(
        action="report_deleted",
        entity_type="report",
        entity_id=report_id,
        details=f"Deleted report: {report_title}"
    )
    
    logger.info(f"Report deleted: {report_title} by {current_user.username}")
    return {"message": "Report deleted successfully"}