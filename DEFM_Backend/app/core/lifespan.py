from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.database import create_tables
from app.core.config import settings
from app.services.initial_data import create_initial_data
import logging
import os

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - handles startup and shutdown events."""
    # Startup
    logger.info("=" * 60)
    logger.info("DEFM API starting up...")
    logger.info("=" * 60)
    
    try:
        # Create upload directory if it doesn't exist
        os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
        logger.info(f"✓ Upload directory ready: {settings.UPLOAD_DIRECTORY}")
        
        # Create database tables
        logger.info("Creating database tables...")
        create_tables()
        logger.info("✓ Database tables created")
        
        # Create initial data (admin user, etc.)
        logger.info("Setting up initial data...")
        create_initial_data()
        logger.info("✓ Initial data created")
        
        logger.info("=" * 60)
        logger.info("✓ DEFM API is ready!")
        logger.info(f"✓ Documentation: http://localhost:8000/docs")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"✗ Startup failed: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("=" * 60)
    logger.info("DEFM API shutting down...")
    logger.info("=" * 60)
