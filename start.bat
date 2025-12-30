@echo off
REM DEFM Quick Start Script for Windows

echo ======================================
echo   DEFM System Setup for Windows
echo ======================================
echo.

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is required but not found
    echo Please install Python 3.11+ from python.org
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [OK] Found Python %PYTHON_VERSION%

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is required but not found
    echo Please install Node.js from nodejs.org
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Found Node.js %NODE_VERSION%
echo.

REM Backend Setup
echo ======================================
echo   Setting up Backend...
echo ======================================
cd DEFM_Backend

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -q --upgrade pip
pip install -q -r requirements.txt

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo WARNING: Please update SECRET_KEY in .env for production!
)

echo Running database migrations...
alembic upgrade head

echo [OK] Backend setup complete!
echo.

REM Frontend Setup
echo ======================================
echo   Setting up Frontend...
echo ======================================
cd ..\DEFM_Frontend

if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
)

echo [OK] Frontend setup complete!
echo.

REM Instructions
echo ======================================
echo   DEFM System is ready to run!
echo ======================================
echo.
echo To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd DEFM_Backend
echo   venv\Scripts\activate.bat
echo   python main.py
echo   -^> Backend: http://localhost:8000
echo   -^> API Docs: http://localhost:8000/docs
echo.
echo Terminal 2 (Frontend):
echo   cd DEFM_Frontend
echo   npm run dev
echo   -^> Frontend: http://localhost:5173
echo.
echo ======================================
echo Default Login Credentials:
echo ======================================
echo Admin:         admin / admin123
echo Manager:       manager / manager123
echo Investigator:  investigator / investigator123
echo.
echo WARNING: Change these passwords after first login!
echo ======================================
echo.

set /p START_NOW="Do you want to start the backend now? (Y/N): "
if /i "%START_NOW%"=="Y" (
    echo Starting backend server...
    cd ..\DEFM_Backend
    call venv\Scripts\activate.bat
    python main.py
)

pause
