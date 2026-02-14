#!/bin/bash

echo "🚀 Knowledge Platform Backend - Quick Start Script"
echo "=================================================="
echo ""

# Check Python version
echo "✓ Checking Python version..."
python3 --version || { echo "❌ Python 3 not found. Please install Python 3.10+"; exit 1; }

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your configuration (API keys, etc.)"
    echo "   Required: LLM_API_KEY, SECRET_KEY"
    echo ""
    read -p "Press Enter once you've configured .env..."
fi

# Check PostgreSQL
echo "🗄️  Checking PostgreSQL connection..."
python3 << END
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection
try:
    connection.ensure_connection()
    print("✓ PostgreSQL connected successfully")
except Exception as e:
    print(f"❌ PostgreSQL connection failed: {e}")
    print("   Please ensure PostgreSQL is running with pgvector extension")
    exit(1)
END

# Run migrations
echo "🔧 Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo ""
echo "👤 Create a superuser account:"
python manage.py createsuperuser

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start the development server:"
echo "      python manage.py runserver"
echo ""
echo "   2. In a new terminal, start Celery worker:"
echo "      celery -A config worker -l info"
echo ""
echo "   3. Access the API at: http://localhost:8000"
echo "   4. Admin panel: http://localhost:8000/admin"
echo ""
echo "🐳 Alternatively, use Docker:"
echo "   docker-compose up"
echo ""
