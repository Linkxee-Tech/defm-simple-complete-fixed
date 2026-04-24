from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.models import User, AuditLog

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
    current_user: User = Depends(get_current_user),
):
    """Get user notifications derived from recent audit logs."""
    try:
        week_ago = datetime.utcnow() - timedelta(days=7)
        audit_logs = (
            db.query(AuditLog)
            .filter(AuditLog.user_id == current_user.id, AuditLog.timestamp >= week_ago)
            .order_by(desc(AuditLog.timestamp))
            .limit(limit)
            .all()
        )

        notifications: List[NotificationResponse] = []
        for log in audit_logs:
            action_lower = (log.action or "").lower()
            notification_type = "info"
            if "error" in action_lower or "failed" in action_lower:
                notification_type = "error"
            elif "warning" in action_lower:
                notification_type = "warning"
            elif "created" in action_lower or "added" in action_lower:
                notification_type = "success"

            notifications.append(
                NotificationResponse(
                    id=log.id,
                    message=f"{log.action}: {log.details or 'No details available'}",
                    type=notification_type,
                    created_at=log.timestamp,
                    read=False,
                )
            )

        # Placeholder: unread tracking not persisted yet.
        if unread_only:
            return notifications
        return notifications
    except Exception as e:
        logger.error("Error retrieving notifications: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notifications",
        )


@router.post("/mark-read/{notification_id}")
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a notification as read (placeholder implementation)."""
    try:
        return {"message": f"Notification {notification_id} marked as read"}
    except Exception as e:
        logger.error("Error marking notification as read: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read",
        )


@router.post("/mark-all-read")
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read (placeholder implementation)."""
    try:
        return {"message": "All notifications marked as read"}
    except Exception as e:
        logger.error("Error marking all notifications as read: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark all notifications as read",
        )


@router.get("/count")
async def get_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get count of recent notifications."""
    try:
        week_ago = datetime.utcnow() - timedelta(days=7)
        count = (
            db.query(AuditLog)
            .filter(AuditLog.user_id == current_user.id, AuditLog.timestamp >= week_ago)
            .count()
        )
        return {"unread_count": count}
    except Exception as e:
        logger.error("Error getting notification count: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notification count",
        )
