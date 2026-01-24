#!/usr/bin/env bash

# Digital Evidence Framework Management (DEFM) - Quick Start Script

echo "==================================================================="
echo "Digital Evidence Framework Management (DEFM) - Backend Setup"
echo "==================================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is required but not installed."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "ERROR: pip3 is required but not installed."
    exit 1
fi

echo "✓ Python 3 found"
echo "✓ pip3 found"

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo "Creating environment configuration..."
    cp .env.example .env
    echo "✓ Environment file created (.env)"
    echo "  Please review and update the .env file with your settings"
else
    echo "✓ Environment file already exists"
fi

# Create directories
echo "Creating necessary directories..."
mkdir -p uploads reports logs

# Initialize database
echo "Initializing database..."
alembic upgrade head

echo "==================================================================="
echo "Setup completed successfully!"
echo "==================================================================="
echo ""
echo "To start the server:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Run the server: uvicorn main:app --reload"
echo ""
echo "API Documentation will be available at:"
echo "- Swagger UI: http://localhost:8000/docs"
echo "- ReDoc: http://localhost:8000/redoc"
echo ""
echo "Default users:"
echo "- admin/admin123 (Administrator)"
echo "- manager/mgr123 (Manager - Ibrahim Isa)"
echo "- investigator1/inv111 (Investigator - Solomon John)"
echo "- investigator2/inv122 (Investigator - Ahmad Lawal)"
echo "- investigator3/inv133 (Investigator - Mike Davis)"
echo ""
echo "==================================================================="