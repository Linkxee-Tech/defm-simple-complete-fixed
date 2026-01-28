from fastapi import APIRouter
from app.api.endpoints import (
    auth_router,
    users_router,
    cases_router,
    evidence_router,
    chain_of_custody_router,
    reports_router,
    audit_logs_router,
    admin_router,
    dashboard_router,
    acquisition_router,
    search_router,
    bulk_router,
    notifications_router
)
import logging

logger = logging.getLogger(__name__)

api_router = APIRouter()

# Include routers with prefixes
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(cases_router, prefix="/cases", tags=["cases"])
api_router.include_router(evidence_router, prefix="/evidence", tags=["evidence"])
api_router.include_router(chain_of_custody_router, prefix="/chain-of-custody", tags=["chain-of-custody"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])
api_router.include_router(audit_logs_router, prefix="/audit-logs", tags=["audit-logs"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
api_router.include_router(dashboard_router, tags=["dashboard"])
api_router.include_router(acquisition_router, tags=["acquisition"])
api_router.include_router(search_router, tags=["search"])
api_router.include_router(bulk_router, tags=["bulk"])
api_router.include_router(notifications_router, tags=["notifications"])
