from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User
from app.models.audit import Audit
import logging

router = APIRouter(prefix="/notifications", tags=["Notifications"])
logger = logging.getLogger(__name__)

class NotificationResponse(BaseModel):
    id: int
    message: str
    type: str
    created_at: datetime
    read: bool = False

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = Query(False, description="Show only unread notifications"),
    limit: int = Query(50, le=100, description="Maximum number of notifications to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user notifications."""
    try:
        # For now, we'll create notifications from audit logs
        # In a real implementation, you'd have a dedicated notifications table
        
        query = db.query(Audit).filter(
            Audit.user_id == current_user.id
        ).order_by(desc(Audit.timestamp))
        
        # Filter for recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        query = query.filter(Audit.timestamp >= week_ago)
        
        if unread_only:
            # For demo purposes, mark all as read after retrieval
            pass
        
        audit_logs = query.limit(limit).all()
        
        # Convert audit logs to notification format
        notifications = []
        for log in audit_logs:
            notification_type = "info"
            if "error" in log.action.lower():
                notification_type = "error"
            elif "warning" in log.action.lower():
                notification_type = "warning"
            elif "created" in log.action.lower() or "added" in log.action.lower():
                notification_type = "success"
            
            notifications.append(NotificationResponse(
                id=log.id,
                message=f"{log.action}: {'No details available'}",
                type=notification_type,
                created_at=log.timestamp,
                read=False  # In real implementation, track read status
            ))
        
        return notifications
        
    except Exception as e:
        logger.error(f"Error retrieving notifications: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notifications"
        )

@router.post("/mark-read/{notification_id}")
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read."""
    try:
        # In a real implementation, you'd update a notifications table
        # For now, we'll just return success
        
        return {"message": "Notification marked as read"}
        
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )

@router.post("/mark-all-read")
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read."""
    try:
        # In a real implementation, you'd update all user's notifications
        # For now, we'll just return success
        
        return {"message": "All notifications marked as read"}
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark all notifications as read"
        )

@router.get("/count")
async def get_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications."""
    try:
        # Count recent audit logs as unread notifications
        week_ago = datetime.utcnow() - timedelta(days=7)
        count = db.query(Audit).filter(
            Audit.user_id == current_user.id,
            Audit.timestamp >= week_ago
        ).count()
        
        return {"unread_count": count}
        
    except Exception as e:
        logger.error(f"Error getting notification count: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notification count"
        )
