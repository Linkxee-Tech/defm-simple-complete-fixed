# This file makes the endpoints package importable
from .auth import router as auth_router
from .users import router as users_router
from .cases import router as cases_router
from .evidence import router as evidence_router
from .chain_of_custody import router as chain_of_custody_router
from .reports import router as reports_router
from .audit_logs import router as audit_logs_router
from .admin import router as admin_router
from .dashboard import router as dashboard_router
from .acquisition import router as acquisition_router
from .search import router as search_router
from .bulk import router as bulk_router
from .notifications import router as notifications_router

__all__ = [
    "auth_router",
    "users_router", 
    "cases_router",
    "evidence_router",
    "chain_of_custody_router",
    "reports_router",
    "audit_logs_router",
    "admin_router",
    "dashboard_router",
    "acquisition_router",
    "search_router",
    "bulk_router",
    "notifications_router"
]