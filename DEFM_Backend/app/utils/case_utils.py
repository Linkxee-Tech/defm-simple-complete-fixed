from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Case
from sqlalchemy import func

def generate_case_number(db: Session) -> str:
    """Generate unique case number."""
    current_year = datetime.now().year
    
    # Count cases created this year
    case_count = (
        db.query(func.count(Case.id))
        .filter(func.extract('year', Case.created_at) == current_year)
        .scalar() or 0
    )
    
    # Generate case number: DEFM-YYYY-001, DEFM-YYYY-002, etc.
    case_number = f"DEFM-{current_year}-{str(case_count + 1).zfill(3)}"
    
    # Ensure uniqueness
    while db.query(Case).filter(Case.case_number == case_number).first():
        case_count += 1
        case_number = f"DEFM-{current_year}-{str(case_count + 1).zfill(3)}"
    
    return case_number

def get_case_status_color(status: str) -> str:
    """Get color code for case status."""
    status_colors = {
        "open": "#3B82F6",      # Blue
        "in_progress": "#F59E0B", # Yellow
        "closed": "#10B981",     # Green
        "archived": "#6B7280"    # Gray
    }
    return status_colors.get(status, "#6B7280")

def get_priority_color(priority: str) -> str:
    """Get color code for case priority."""
    priority_colors = {
        "low": "#10B981",       # Green
        "medium": "#F59E0B",    # Yellow
        "high": "#F97316",      # Orange
        "critical": "#EF4444"   # Red
    }
    return priority_colors.get(priority, "#6B7280")

def format_case_summary(case) -> dict:
    """Format case data for summary display."""
    return {
        "id": case.id,
        "case_number": case.case_number,
        "title": case.title,
        "status": case.status.value if case.status else "unknown",
        "priority": case.priority.value if case.priority else "medium",
        "created_at": case.created_at.isoformat() if case.created_at else None,
        "status_color": get_case_status_color(case.status.value if case.status else "unknown"),
        "priority_color": get_priority_color(case.priority.value if case.priority else "medium"),
        "created_by": case.created_by_user.full_name if case.created_by_user else "Unknown",
        "assigned_to": case.assigned_to_user.full_name if case.assigned_to_user else "Unassigned"
    }