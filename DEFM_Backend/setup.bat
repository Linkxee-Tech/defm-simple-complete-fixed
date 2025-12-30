@echo off
REM Digital Evidence Framework Management (DEFM) - Quick Start Script for Windows

echo ===================================================================
echo Digital Evidence Framework Management (DEFM) - Backend Setup
echo ===================================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is required but not installed.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: pip is required but not installed.
    pause
    exit /b 1
)

echo ✓ Python found
echo ✓ pip found

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Copy environment file
if not exist .env (
    echo Creating environment configuration...
    copy .env.example .env
    echo ✓ Environment file created (.env)
    echo   Please review and update the .env file with your settings
) else (
    echo ✓ Environment file already exists
)

REM Create directories
echo Creating necessary directories...
if not exist uploads mkdir uploads
if not exist reports mkdir reports
if not exist logs mkdir logs

REM Initialize database
echo Initializing database...
alembic upgrade head

echo ===================================================================
echo Setup completed successfully!
echo ===================================================================
echo.
echo To start the server:
echo 1. Activate the virtual environment: venv\Scripts\activate.bat
echo 2. Run the server: uvicorn main:app --reload
echo.
echo API Documentation will be available at:
echo - Swagger UI: http://localhost:8000/docs
echo - ReDoc: http://localhost:8000/redoc
echo.
echo Default users:
echo - admin/admin123 (Administrator)
echo - manager/mgr123 (Manager - Ibrahim Isa)
echo - investigator1/inv111 (Investigator - Solomon John)
echo - investigator2/inv122 (Investigator - Ahmad Lawal)
echo - investigator3/inv133 (Investigator - Mike Davis)
echo.
echo ===================================================================
pause