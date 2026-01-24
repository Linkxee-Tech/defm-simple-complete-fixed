from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.audit_service import AuditService
from app.core.database import create_tables
from app.api.router import api_router  # Fixed import
from app.core.lifespan import lifespan  # Use imported lifespan
from fastapi.staticfiles import StaticFiles
from app.services.initial_data import create_initial_data
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
    lifespan=lifespan  # Use the imported lifespan
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
    
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
