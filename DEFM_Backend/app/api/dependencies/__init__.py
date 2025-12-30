# This file makes the dependencies package importable
from .auth import (
    get_current_user,
    get_current_active_user,
    require_admin,
    require_admin_or_manager,
    get_audit_service
)

__all__ = [
    "get_current_user",
    "get_current_active_user", 
    "require_admin",
    "require_admin_or_manager",
    "get_audit_service"
]