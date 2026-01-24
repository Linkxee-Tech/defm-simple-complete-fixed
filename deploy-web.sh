#!/bin/bash

# Digital Evidence Framework Management - Web Deployment Script
# This script deploys the DEFM application as a web service

echo "🚀 DEFM Web Deployment Script"
echo "============================="

# Configuration
PROJECT_NAME="defm"
DOMAIN="your-domain.com"  # Change this to your domain
EMAIL="admin@your-domain.com"  # Change this to your email

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create production environment file
echo "📝 Creating production environment file..."
cat > .env.production << EOF
# Production Environment Variables
DATABASE_URL=sqlite:///./defm.db
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIRECTORY=./uploads
MAX_FILE_SIZE=100000000
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,7z,log
APP_NAME=DEFM API
APP_VERSION=1.0.0
DEBUG=false
ALLOWED_ORIGINS=https://$DOMAIN,http://localhost:3000
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
EOF

echo "✅ Production environment file created."

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Show logs
echo "📋 Showing recent logs..."
docker-compose logs --tail=50

echo ""
echo "🎉 Web deployment complete!"
echo ""
echo "📋 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "🔧 Management commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
echo "🌐 For production deployment:"
echo "   1. Update DOMAIN variable in this script"
echo "   2. Configure SSL certificates"
echo "   3. Set up reverse proxy with nginx"
echo "   4. Configure firewall rules"
echo ""
