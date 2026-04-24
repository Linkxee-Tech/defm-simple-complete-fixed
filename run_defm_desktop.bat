@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "EXE_PATH=%ROOT_DIR%DEFM_Backend\dist\DEFM_Desktop\DEFM_Desktop.exe"
set "DEFM_PORT="
set "DEFM_APP_DIR=%LOCALAPPDATA%\DEFM"
set "DEFM_TMP_DIR=%DEFM_APP_DIR%\tmp"

if not exist "%EXE_PATH%" (
  echo [ERROR] DEFM desktop executable was not found:
  echo %EXE_PATH%
  echo.
  echo Run build_windows_exe.bat first, then try again.
  pause
  exit /b 1
)

if not exist "%DEFM_APP_DIR%" mkdir "%DEFM_APP_DIR%" >nul 2>&1
if not exist "%DEFM_TMP_DIR%" mkdir "%DEFM_TMP_DIR%" >nul 2>&1
set "TMP=%DEFM_TMP_DIR%"
set "TEMP=%DEFM_TMP_DIR%"

set "DEFM_PORT=8000"
netstat -ano | findstr /R /C:":8000 .*LISTENING" >nul 2>&1
if not errorlevel 1 set "DEFM_PORT=8001"

if not "%DEFM_PORT%"=="8000" (
  echo [WARN] Port 8000 is busy. Using port %DEFM_PORT% instead.
)

echo Starting DEFM Desktop...
start "" "%EXE_PATH%"

if errorlevel 1 (
  echo [ERROR] Failed to launch DEFM_Desktop.exe
  pause
  exit /b 1
)

exit /b 0
