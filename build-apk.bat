@echo off
REM APK Build Script for DEFM Mobile App

echo 📱 DEFM APK Build Script
echo ========================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
cd DEFM_Frontend
npm install

REM Install Capacitor
echo 📱 Installing Capacitor...
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init DEFM com.defm.app

REM Configure Android
echo 🤖 Configuring Android...
npx cap add android

REM Build web app
echo 🔨 Building web app...
npm run build

REM Sync with Android
echo 🔄 Syncing with Android...
npx cap sync android

echo ✅ APK build setup complete!
echo 📱 Open Android Studio to build APK:
echo    1. Import project: DEFM_Frontend\android
echo    2. Build -> Build Bundle(s) / APK(s) -> Build APK(s)
echo.
npx cap open android
pause
