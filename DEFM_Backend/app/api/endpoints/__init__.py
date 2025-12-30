# This file makes the endpoints package importable
from .auth import router as auth_router
from .users import router as users_router
from .cases import router as cases_router
from .evidence import router as evidence_router
from .chain_of_custody import router as chain_of_custody_router
from .reports import router as reports_router
from .audit_logs import router as audit_logs_router

__all__ = [
    "auth_router",
    "users_router", 
    "cases_router",
    "evidence_router",
    "chain_of_custody_router",
    "reports_router",
    "audit_logs_router"
]