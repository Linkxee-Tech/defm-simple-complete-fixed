@echo off
REM ============================================================================
REM DEFM Backend - Windows EXE Build Script
REM ============================================================================
REM This script builds a standalone Windows executable using PyInstaller
REM 
REM Prerequisites:
REM   1. Python 3.11+ installed
REM   2. Virtual environment activated with all dependencies installed
REM   3. PyInstaller installed: pip install pyinstaller
REM
REM Usage:
REM   Run this script from the DEFM_Backend directory with venv activated
REM ============================================================================

echo.
echo ============================================================================
echo DEFM Backend - Building Windows Executable
echo ============================================================================
echo.

REM Check if PyInstaller is installed
python -c "import PyInstaller" 2>nul
if errorlevel 1 (
    echo ERROR: PyInstaller is not installed!
    echo Please install it with: pip install pyinstaller
    echo.
    pause
    exit /b 1
)

echo [1/3] Cleaning previous build artifacts...
if exist "build" rmdir /s /q "build"
if exist "dist" rmdir /s /q "dist"
if exist "DEFM.spec" del /q "DEFM.spec"

echo [2/3] Building executable with PyInstaller...
echo.
pyinstaller --onefile ^
    --name DEFM ^
    --add-data ".env;." ^
    --add-data "uploads;uploads" ^
    --hidden-import uvicorn.logging ^
    --hidden-import uvicorn.loops ^
    --hidden-import uvicorn.loops.auto ^
    --hidden-import uvicorn.protocols ^
    --hidden-import uvicorn.protocols.http ^
    --hidden-import uvicorn.protocols.http.auto ^
    --hidden-import uvicorn.protocols.websockets ^
    --hidden-import uvicorn.protocols.websockets.auto ^
    --hidden-import uvicorn.lifespan ^
    --hidden-import uvicorn.lifespan.on ^
    run_app.py

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Build complete!
echo.
echo ============================================================================
echo Executable created: dist\DEFM.exe
echo ============================================================================
echo.
echo To run the application:
echo   1. Copy dist\DEFM.exe to your desired location
echo   2. Ensure .env file is in the same directory as DEFM.exe
echo   3. Run DEFM.exe
echo   4. Access the API at http://127.0.0.1:8000
echo   5. API docs available at http://127.0.0.1:8000/docs
echo.
echo ============================================================================
echo.
pause
