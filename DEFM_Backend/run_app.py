"""
DEFM Backend Entry Point for PyInstaller Packaging
This script serves as the entry point when running the application as a standalone executable.
"""
import os
import sys
import logging
from dotenv import load_dotenv
import uvicorn

# Ensure current working directory is the DEFM_Backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE_DIR)

# Load environment variables from .env file if present
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("DEFM_Run")

if __name__ == "__main__":
    # Import the FastAPI app from main
    # This will not run create_initial_data at import because startup handler handles that
    from main import app

    # Get host and port from environment or use defaults
    host = os.getenv("DEFM_HOST", "127.0.0.1")
    port = int(os.getenv("DEFM_PORT", "8000"))

    logger.info(f"Starting DEFM backend on http://{host}:{port}")
    logger.info(f"API Documentation available at http://{host}:{port}/docs")

    # Start uvicorn programmatically
    uvicorn.run(app, host=host, port=port)
