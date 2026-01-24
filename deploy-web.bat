@echo off
REM Digital Evidence Framework Management - Web Deployment Script (Windows)
REM This script deploys the DEFM application as a web service

echo 🚀 DEFM Web Deployment Script
echo =============================

REM Configuration
set PROJECT_NAME=defm
set DOMAIN=your-domain.com
set EMAIL=admin@your-domain.com

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create production environment file
echo 📝 Creating production environment file...
(
echo # Production Environment Variables
echo DATABASE_URL=sqlite:///./defm.db
echo SECRET_KEY=defm-secret-key-change-in-production-MUST-BE-SECURE
echo ALGORITHM=HS256
echo ACCESS_TOKEN_EXPIRE_MINUTES=30
echo UPLOAD_DIRECTORY=./uploads
echo MAX_FILE_SIZE=100000000
echo ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,7z,log
echo APP_NAME=DEFM API
echo APP_VERSION=1.0.0
echo DEBUG=false
echo ALLOWED_ORIGINS=https://%DOMAIN%,http://localhost:3000
echo SMTP_HOST=
echo SMTP_PORT=587
echo SMTP_USERNAME=
echo SMTP_PASSWORD=
) > .env.production

echo ✅ Production environment file created.

REM Build and start services
echo 🔨 Building Docker images...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps

REM Show logs
echo 📋 Showing recent logs...
docker-compose logs --tail=50

echo.
echo 🎉 Web deployment complete!
echo.
echo 📋 Access URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Documentation: http://localhost:8000/docs
echo.
echo 🔧 Management commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo.
echo 🌐 For production deployment:
echo    1. Update DOMAIN variable in this script
echo    2. Configure SSL certificates
echo    3. Set up reverse proxy with nginx
echo    4. Configure firewall rules
echo.
pause
