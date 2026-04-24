@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo DEFM Desktop EXE Build Script (Windows)
echo ==========================================

set ROOT_DIR=%~dp0
set FRONTEND_DIR=%ROOT_DIR%DEFM_Frontend
set BACKEND_DIR=%ROOT_DIR%DEFM_Backend
set FRONTEND_LOG=%ROOT_DIR%frontend_build.log

if not exist "%FRONTEND_DIR%" (
  echo ERROR: Frontend directory not found.
  exit /b 1
)

if not exist "%BACKEND_DIR%" (
  echo ERROR: Backend directory not found.
  exit /b 1
)

echo.
echo [1/5] Building frontend...
cd /d "%FRONTEND_DIR%"
call npm.cmd install
if errorlevel 1 (
  echo ERROR: npm install failed.
  exit /b 1
)

if exist "%FRONTEND_LOG%" del /q "%FRONTEND_LOG%"
call npm.cmd run build > "%FRONTEND_LOG%" 2>&1
set FRONTEND_BUILD_RC=%ERRORLEVEL%

if "%FRONTEND_BUILD_RC%"=="0" (
  echo Frontend build completed.
) else (
  findstr /C:"spawn EPERM" "%FRONTEND_LOG%" >nul
  if errorlevel 1 (
    echo ERROR: frontend build failed.
    type "%FRONTEND_LOG%"
    exit /b 1
  )

  if exist "%FRONTEND_DIR%\dist\index.html" (
    echo WARNING: frontend build hit spawn EPERM, using existing frontend dist fallback.
    echo WARNING: Reused build: %FRONTEND_DIR%\dist
  ) else (
    echo ERROR: frontend build hit spawn EPERM and no reusable dist was found.
    type "%FRONTEND_LOG%"
    exit /b 1
  )
)

echo.
echo [2/5] Preparing backend environment...
cd /d "%BACKEND_DIR%"

if not exist venv (
  python -m venv venv
)

call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

set PYINSTALLER_CMD=
if exist "venv\Scripts\pyinstaller.exe" set PYINSTALLER_CMD=venv\Scripts\pyinstaller.exe

if not defined PYINSTALLER_CMD (
  where pyinstaller >nul 2>&1
  if not errorlevel 1 set PYINSTALLER_CMD=pyinstaller
)

if not defined PYINSTALLER_CMD (
  for /f "usebackq delims=" %%F in (`powershell -NoProfile -Command "$c = Get-Command pyinstaller -ErrorAction SilentlyContinue; if ($c) { $c.Source }"`) do (
    if not defined PYINSTALLER_CMD set PYINSTALLER_CMD=%%~fF
  )
)

if not defined PYINSTALLER_CMD (
  for /f "delims=" %%F in ('where /r "%LocalAppData%\Programs\Python" pyinstaller.exe 2^>nul') do (
    if not defined PYINSTALLER_CMD set PYINSTALLER_CMD=%%~fF
  )
)

if not defined PYINSTALLER_CMD (
  pip install pyinstaller
  if exist "venv\Scripts\pyinstaller.exe" set PYINSTALLER_CMD=venv\Scripts\pyinstaller.exe
)

if not defined PYINSTALLER_CMD (
  echo ERROR: pyinstaller was not found and could not be installed.
  exit /b 1
)

echo.
echo [3/5] Cleaning old build artifacts...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist DEFM_Desktop.spec del /q DEFM_Desktop.spec

echo.
echo [4/5] Building EXE with PyInstaller...
"%PYINSTALLER_CMD%" --noconfirm --clean ^
  --name DEFM_Desktop ^
  --onedir ^
  --hidden-import desktop_main ^
  --collect-submodules passlib.handlers ^
  --copy-metadata email_validator ^
  --copy-metadata pydantic ^
  --add-data "..\DEFM_Frontend\dist;DEFM_Frontend\dist" ^
  --add-data "alembic;alembic" ^
  desktop_entry.py

if errorlevel 1 (
  echo ERROR: EXE build failed.
  exit /b 1
)

echo.
echo [5/5] Build completed successfully.
echo EXE path:
echo %BACKEND_DIR%\dist\DEFM_Desktop\DEFM_Desktop.exe
echo.
echo Run the EXE to start backend + UI in browser.

endlocal
