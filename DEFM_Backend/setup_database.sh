#!/bin/bash

# Digital Evidence Framework Management - Database Setup Script
# This script sets up the database for DEFM project

echo "🗄️  DEFM Database Setup Script"
echo "================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p logs
mkdir -p alembic/versions

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Initialize Alembic (if not already done)
if [ ! -f "alembic/versions" ]; then
    echo "🔄 Initializing Alembic..."
    alembic init alembic
fi

# Create initial migration
echo "🔄 Creating initial database migration..."
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
echo "🔄 Applying database migrations..."
alembic upgrade head

# Create database tables (alternative method)
echo "🔄 Creating database tables..."
python -c "
from app.core.database import create_tables
create_tables()
print('✅ Database tables created successfully!')
"

# Create initial data
echo "🔄 Creating initial data..."
python -c "
from app.services.initial_data import create_initial_data
create_initial_data()
print('✅ Initial data created successfully!')
"

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review and update .env file with your settings"
echo "2. Run the backend: python main.py"
echo "3. Access API at: http://127.0.0.1:8000"
echo "4. View docs at: http://127.0.0.1:8000/docs"
echo ""
echo "🔐 Default login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
