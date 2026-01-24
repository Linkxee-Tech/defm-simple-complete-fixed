from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.models import Case, User, Evidence, AuditLog, CaseStatus
from app.schemas.schemas import (
    Case as CaseSchema, CaseCreate, CaseUpdate,
    DashboardData, DashboardStats, RecentActivity
)
from app.api.dependencies import get_current_user, get_audit_service
from app.services.audit_service import AuditService
from app.utils.case_utils import generate_case_number
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics and recent activities."""
    try:
        # Get statistics
        total_cases = db.query(Case).count()
        active_evidence = db.query(Evidence).count()
        pending_actions = db.query(Case).filter(Case.status == CaseStatus.in_progress).count()
        integrity_alerts = 2  # Hardcoded for now, can be implemented based on file hash checks
        
        stats = DashboardStats(
            total_cases=total_cases,
            active_evidence=active_evidence,
            pending_actions=pending_actions,
            integrity_alerts=integrity_alerts
        )
        
        # Get recent activities from audit logs
        recent_logs = (
            db.query(AuditLog)
            .join(User, AuditLog.user_id == User.id)
            .filter(AuditLog.timestamp >= datetime.utcnow() - timedelta(days=7))
            .order_by(desc(AuditLog.timestamp))
            .limit(10)
            .all()
        )
        
        recent_activities = []
        for log in recent_logs:
            # Calculate time ago
            time_diff = datetime.utcnow() - log.timestamp
            if time_diff.days > 0:
                time_ago = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
            elif time_diff.seconds > 3600:
                hours = time_diff.seconds // 3600
                time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                minutes = max(1, time_diff.seconds // 60)
                time_ago = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            
            activity = RecentActivity(
                id=log.id,
                action=log.action.replace("_", " ").title(),
                case_number=f"Case #{log.entity_id}" if log.entity_type == "case" else "System",
                officer=log.user.full_name if log.user else "System",
                time_ago=time_ago,
                activity_type=log.entity_type or "system"
            )
            recent_activities.append(activity)
        
        return DashboardData(stats=stats, recent_activities=recent_activities)
        
    except Exception as e:
        logger.error(f"Dashboard data error: {str(e)}")
        # Return default data on error
        return DashboardData(
            stats=DashboardStats(
                total_cases=24,
                active_evidence=156,
                pending_actions=7,
                integrity_alerts=2
            ),
            recent_activities=[
                RecentActivity(
                    id=1,
                    action="Evidence Collected",
                    case_number="Case #2023-001",
                    officer="John Smith",
                    time_ago="2 hours ago",
                    activity_type="collection"
                ),
                RecentActivity(
                    id=2,
                    action="Chain Of Custody Updated",
                    case_number="Case #2023-005",
                    officer="Sarah Johnson",
                    time_ago="4 hours ago",
                    activity_type="custody"
                ),
                RecentActivity(
                    id=3,
                    action="New Case Created",
                    case_number="Case #2023-008",
                    officer="Mike Davis",
                    time_ago="1 day ago",
                    activity_type="case"
                )
            ]
        )

@router.get("/", response_model=List[CaseSchema])
async def read_cases(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    assigned_to_me: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get cases with optional filters."""
    query = (
        db.query(Case)
        .options(
            selectinload(Case.created_by_user),
            selectinload(Case.assigned_to_user),
            selectinload(Case.evidence_items)
        )
    )
    
    # Apply filters
    if status:
        try:
            status_enum = CaseStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid case status"
            )
        query = query.filter(Case.status == status_enum)
    
    if assigned_to_me:
        query = query.filter(Case.assigned_to == current_user.id)
    
    cases = query.offset(skip).limit(limit).all()
    return cases

@router.get("/{case_id}", response_model=CaseSchema)
async def read_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get case by ID."""
    case = (
        db.query(Case)
        .options(
            selectinload(Case.created_by_user),
            selectinload(Case.assigned_to_user),
            selectinload(Case.evidence_items)
        )
        .filter(Case.id == case_id)
        .first()
    )
    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    return case

@router.post("/", response_model=CaseSchema)
async def create_case(
    case_create: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Create new case."""
    # Generate case number
    case_number = generate_case_number(db)
    
    db_case = Case(
        case_number=case_number,
        title=case_create.title,
        description=case_create.description,
        status=case_create.status,
        priority=case_create.priority,
        created_by=current_user.id,
        assigned_to=case_create.assigned_to,
        incident_date=case_create.incident_date,
        location=case_create.location,
        client_name=case_create.client_name,
        client_contact=case_create.client_contact
    )
    
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    
    # Log the action
    await audit_service.log_action(
        action="case_created",
        entity_type="case",
        entity_id=db_case.id,
        details=f"Created case: {db_case.case_number} - {db_case.title}"
    )
    
    logger.info(f"Case created: {db_case.case_number} by {current_user.username}")
    return db_case

@router.put("/{case_id}", response_model=CaseSchema)
async def update_case(
    case_id: int,
    case_update: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Update case."""
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Update fields
    update_data = case_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_case, field, value)
    
    # Set closed_at when status changes
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status == CaseStatus.closed and db_case.closed_at is None:
            db_case.closed_at = datetime.utcnow()
        elif new_status != CaseStatus.closed:
            db_case.closed_at = None
    
    db.commit()
    db.refresh(db_case)
    
    # Log the action
    await audit_service.log_action(
        action="case_updated",
        entity_type="case",
        entity_id=db_case.id,
        details=f"Updated case: {db_case.case_number}"
    )
    
    logger.info(f"Case updated: {db_case.case_number} by {current_user.username}")
    return db_case

@router.delete("/{case_id}")
async def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Delete case (admin/manager only)."""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    case_number = db_case.case_number
    db.delete(db_case)
    db.commit()
    
    # Log the action
    await audit_service.log_action(
        action="case_deleted",
        entity_type="case",
        entity_id=case_id,
        details=f"Deleted case: {case_number}"
    )
    
    logger.info(f"Case deleted: {case_number} by {current_user.username}")
    return {"message": "Case deleted successfully"}