# Know Your Organization - Backend

Django REST API backend with RAG (Retrieval-Augmented Generation) capabilities using pgvector and Hugging Face models.

---

## Tech Stack

- **Framework:** Django 4.2 + Django REST Framework
- **Database:** PostgreSQL 14+ with pgvector extension
- **Cache/Queue:** Redis 7+
- **Task Queue:** Celery 5.3
- **WSGI Server:** Gunicorn
- **Web Server:** Nginx (production)
- **AI/ML:** Hugging Face Inference API
  - Embeddings: BAAI/bge-base-en-v1.5 (768-dim)
  - Generation: Mistral-7B-Instruct-v0.2

---

## Project Structure

```
backend/
├── apps/
│   ├── core/                   # User model & authentication
│   │   ├── models.py          # Custom User model with roles
│   │   ├── permissions.py     # Role-based permissions
│   │   ├── serializers.py     # JWT & user serializers
│   │   └── views.py           # Auth endpoints
│   │
│   ├── documents/              # Document management
│   │   ├── models.py          # Document, Version, Chunk models
│   │   ├── tasks.py           # Celery tasks for processing
│   │   ├── services.py        # Document processing logic
│   │   └── views.py           # CRUD endpoints
│   │
│   ├── retrieval/              # RAG & vector search
│   │   ├── services.py        # HF API integration
│   │   ├── vector_search.py   # pgvector queries
│   │   ├── views.py           # Query endpoints
│   │   └── models.py          # Query & Feedback models
│   │
│   ├── analytics/              # Usage analytics
│   │   ├── models.py          # Analytics aggregation
│   │   └── views.py           # Statistics endpoints
│   │
│   └── audit/                  # Audit logging
│       ├── models.py          # AuditLog model
│       ├── services.py        # Logging service
│       └── views.py           # Audit log endpoints
│
├── config/
│   ├── settings.py            # Django configuration
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI configuration
│   └── celery.py              # Celery configuration
│
├── media/                      # Uploaded documents
├── staticfiles/                # Collected static files
├── logs/                       # Application logs
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
└── manage.py                  # Django management script
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 14+ with pgvector
- Redis 7+

### Installation

**1. Clone and navigate:**
```bash
git clone https://github.com/yourusername/know-your-organization.git
cd know-your-organization/backend
```

**2. Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**3. Install dependencies:**
```bash
pip install -r requirements.txt
```

**4. Setup PostgreSQL with pgvector:**
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install pgvector
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Create database
sudo -u postgres psql
CREATE DATABASE knowledge_platform;
CREATE USER kyo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE knowledge_platform TO kyo_user;
\c knowledge_platform
CREATE EXTENSION vector;
\q
```

**5. Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

**6. Run migrations:**
```bash
python manage.py migrate
```

**7. Create superuser:**
```bash
python manage.py createsuperuser
```

**8. Collect static files:**
```bash
python manage.py collectstatic --noinput
```

**9. Start development server:**
```bash
python manage.py runserver
```

**10. Start Celery worker (new terminal):**
```bash
celery -A config worker --loglevel=info
```

---

## Configuration

### Environment Variables

Create `.env` file:

```bash
# Django Core
SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=knowledge_platform
DB_USER=kyo_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Hugging Face API
HF_EMBEDDING_API_KEY=hf_your_token_here
HF_LLM_API_KEY=hf_your_token_here

# Document Processing
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=pdf,docx,txt
CHUNK_SIZE=500
CHUNK_OVERLAP=50

# Vector Search
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.7

# Rate Limiting
MAX_QUERIES_PER_DAY=100
MAX_TOKENS_PER_QUERY=2000

# JWT Tokens
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (get JWT tokens) |
| POST | `/api/auth/refresh/` | Refresh access token |
| POST | `/api/auth/logout/` | Logout (blacklist token) |
| GET | `/api/auth/profile/` | Get current user profile |
| PUT | `/api/auth/profile/` | Update user profile |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents/` | List all documents |
| POST | `/api/documents/upload/` | Upload new document |
| GET | `/api/documents/{id}/` | Get document details |
| POST | `/api/documents/{id}/approve/` | Approve document |
| POST | `/api/documents/{id}/archive/` | Archive document |
| DELETE | `/api/documents/{id}/` | Delete document (admin) |

### Retrieval

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/retrieval/query/` | Ask a question |
| GET | `/api/retrieval/history/` | Get query history |
| GET | `/api/retrieval/history/{id}/` | Get query details |
| POST | `/api/retrieval/feedback/` | Submit feedback |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview/` | Platform statistics |
| GET | `/api/analytics/me/` | User statistics |
| GET | `/api/analytics/feedback/` | Feedback summary |

### Audit

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit/logs/` | Get audit logs (admin) |

---

## Testing

**Run all tests:**
```bash
pytest
```

**Run with coverage:**
```bash
pytest --cov=apps --cov-report=html
```

**Run specific app tests:**
```bash
pytest apps/documents/tests/
pytest apps/retrieval/tests/
```

---

## Production Deployment

### AWS EC2 Setup

**1. Launch EC2 Instance:**
- AMI: Ubuntu 22.04 LTS
- Instance Type: t2.micro (free tier)
- Storage: 30GB

**2. Install system dependencies:**
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv python3-pip
sudo apt install -y postgresql postgresql-contrib redis-server
sudo apt install -y nginx
```

**3. Install pgvector:**
```bash
sudo apt install -y build-essential git postgresql-server-dev-all
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

**4. Setup PostgreSQL:**
```bash
sudo -u postgres psql
CREATE DATABASE knowledge_platform;
CREATE USER kyo_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE knowledge_platform TO kyo_user;
\c knowledge_platform
CREATE EXTENSION vector;
\q
```

**5. Clone and setup project:**
```bash
cd ~
git clone https://github.com/yourusername/know-your-organization.git backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

**6. Configure environment:**
```bash
nano .env
# Add production environment variables
```

**7. Run migrations:**
```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

**8. Setup Gunicorn service:**
```bash
sudo nano /etc/systemd/system/gunicorn.service
```

```ini
[Unit]
Description=Gunicorn daemon for KYO Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/backend
Environment="PATH=/home/ubuntu/backend/venv/bin"
ExecStart=/home/ubuntu/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind 127.0.0.1:8000 \
          --timeout 120 \
          config.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

**9. Setup Celery service:**
```bash
sudo nano /etc/systemd/system/celery.service
```

```ini
[Unit]
Description=Celery Worker for KYO Backend
After=network.target redis.service

[Service]
Type=forking
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/backend
Environment="PATH=/home/ubuntu/backend/venv/bin"
ExecStart=/home/ubuntu/backend/venv/bin/celery -A config worker \
          --loglevel=info \
          --logfile=/home/ubuntu/backend/logs/celery.log \
          --pidfile=/home/ubuntu/backend/celery.pid \
          --detach

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start celery
sudo systemctl enable celery
```

**10. Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/kyo
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;

    location /static/ {
        alias /home/ubuntu/backend/staticfiles/;
    }

    location /media/ {
        alias /home/ubuntu/backend/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kyo /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**11. Setup SSL (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

---

## Monitoring & Logs

**View Gunicorn logs:**
```bash
sudo journalctl -u gunicorn -f
```

**View Celery logs:**
```bash
tail -f logs/celery.log
```

**View Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**Django logs:**
```bash
tail -f logs/django.log
```

---

## Security Considerations

- Change `SECRET_KEY` in production
- Use strong database passwords
- Enable firewall (ufw)
- Keep dependencies updated
- Regular database backups
- Monitor logs for suspicious activity
- Use environment variables for secrets
- Enable HTTPS only in production

---

## Performance Optimization

**Database:**
- Enable connection pooling
- Index frequently queried fields
- Regular VACUUM on PostgreSQL

**Caching:**
- Redis for session storage
- Cache frequently accessed queries
- Use CDN for static files

**Celery:**
- Limit worker tasks per child
- Monitor queue length
- Use task priorities

---

## Troubleshooting

**Gunicorn won't start:**
```bash
sudo journalctl -u gunicorn -n 50
python manage.py check
```

**Database connection issues:**
```bash
python manage.py dbshell
# If fails, check PostgreSQL service and credentials
```

**Celery tasks not processing:**
```bash
sudo systemctl status celery
tail -f logs/celery.log
```

**502 Bad Gateway:**
```bash
sudo systemctl status gunicorn nginx
sudo journalctl -u gunicorn -n 50
```

---

## License

MIT License - see [LICENSE](../LICENSE) file

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**For frontend documentation, see [../frontend/README.md](../frontend/README.md)**
