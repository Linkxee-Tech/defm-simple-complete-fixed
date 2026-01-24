from sqlalchemy.orm import Session
from app.models.models import AuditLog
from fastapi import Request
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class AuditService:
    def __init__(self, db: Session, current_user=None):
        self.db = db
        self.current_user = current_user

    async def log_action(
        self,
        action: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log an audit trail entry."""
        try:
            if not self.current_user:
                logger.warning("Audit log attempted without current user")
                return

            audit_log = AuditLog(
                user_id=self.current_user.id,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent
            )

            self.db.add(audit_log)
            self.db.commit()

            logger.info(
                f"Audit log created: {action} by user {self.current_user.username}")

        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")
            self.db.rollback()

    def get_audit_logs(
        self,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[int] = None,
        entity_type: Optional[str] = None,
        action: Optional[str] = None
    ):
        """Get audit logs with optional filters."""
        query = self.db.query(AuditLog)

        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        if action:
            query = query.filter(AuditLog.action == action)

        return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    def get_entity_audit_trail(self, entity_type: str, entity_id: int):
        """Get complete audit trail for a specific entity."""
        return (
            self.db.query(AuditLog)
            .filter(
                AuditLog.entity_type == entity_type,
                AuditLog.entity_id == entity_id
            )
            .order_by(AuditLog.timestamp.desc())
            .all()
        )
