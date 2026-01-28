from sqlalchemy.orm import Session
from app.models.models import User, AuditLog
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class AuditService:
    """Service for logging audit trail of user actions."""
    
    def __init__(self, db: Session, current_user: User):
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
    ) -> AuditLog:
        """
        Log an audit action.
        
        Args:
            action: The action performed (e.g., "user_created", "case_updated")
            entity_type: Type of entity affected (e.g., "user", "case", "evidence")
            entity_id: ID of the affected entity
            details: Additional details about the action
            ip_address: IP address of the user
            user_agent: User agent string
            
        Returns:
            The created AuditLog entry
        """
        try:
            audit_log = AuditLog(
                user_id=self.current_user.id,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent,
                timestamp=datetime.utcnow()
            )
            
            self.db.add(audit_log)
            self.db.commit()
            self.db.refresh(audit_log)
            
            logger.info(
                f"Audit log created: {action} by user {self.current_user.username} "
                f"on {entity_type}:{entity_id}"
            )
            
            return audit_log
            
        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")
            self.db.rollback()
            raise
    
    def get_logs(
        self,
        skip: int = 0,
        limit: int = 100,
        action: Optional[str] = None,
        entity_type: Optional[str] = None,
        user_id: Optional[int] = None
    ):
        """
        Retrieve audit logs with optional filters.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            action: Filter by action type
            entity_type: Filter by entity type
            user_id: Filter by user ID
            
        Returns:
            List of AuditLog entries
        """
        query = self.db.query(AuditLog)
        
        if action:
            query = query.filter(AuditLog.action == action)
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        
        return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
