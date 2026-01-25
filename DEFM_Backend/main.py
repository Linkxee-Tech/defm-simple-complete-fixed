from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.audit_service import AuditService
from app.core.database import create_tables
from app.api.router import api_router
from app.core.lifespan import lifespan
from fastapi.staticfiles import StaticFiles
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app with lifespan
app = FastAPI(
    title="DEFM API",
    version="1.0.0",
    description="A comprehensive backend system for managing digital forensic evidence, chain of custody, and case management.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup():
    """Initialize database and create initial data on startup."""
    try:
        create_tables()
        from app.services.initial_data import create_initial_data
        create_initial_data()
        logger.info("Database tables ensured and initial data created.")
    except Exception as e:
        logger.error(f"Startup initialization failed: {e}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Digital Evidence Framework Management (DEFM) API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "running"
    }


@app.get("/dashboard")
async def dashboard_placeholder():
    return {"page": "Dashboard", "note": "Handled by frontend"}


@app.get("/admin")
async def admin_placeholder():
    return {"page": "Admin", "note": "Handled by frontend"}


@app.get("/investigator")
async def investigator_placeholder():
    return {"page": "Investigator", "note": "Handled by frontend"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": settings.APP_VERSION
    }


@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle internal server errors."""
    logger.error(f"Internal server error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Guard StaticFiles mount - check for frontend directory
frontend_dir = "frontend"
if not os.path.isdir(frontend_dir):
    # Try alternative location
    alt_dir = "DEFM_Frontend"
    if os.path.isdir(alt_dir):
        frontend_dir = alt_dir
        logger.info(f"Using alternative frontend directory: {alt_dir}")
    else:
        # Create empty frontend directory to prevent crash
        os.makedirs(frontend_dir, exist_ok=True)
        logger.warning(
            f"Frontend directory not found, created empty: {frontend_dir}")

app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
