#!/bin/bash
# APK Build Script for DEFM Mobile App

echo "📱 DEFM APK Build Script"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd DEFM_Frontend
npm install

# Install Capacitor for mobile app
echo "📱 Installing Capacitor for mobile app..."
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init DEFM com.defm.app

# Configure Android
echo "🤖 Configuring Android..."
npx cap add android

# Build the web app
echo "🔨 Building web app..."
npm run build

# Sync with Android
echo "🔄 Syncing with Android..."
npx cap sync android

# Open Android Studio (optional)
echo "📱 Opening Android Studio..."
echo "To build APK:"
echo "1. Open Android Studio"
echo "2. Import project: DEFM_Frontend/android"
echo "3. Build -> Build Bundle(s) / APK(s) -> Build APK(s)"
echo ""
npx cap open android

echo "✅ APK build setup complete!"
echo "📱 Follow the instructions in Android Studio to build the APK."
