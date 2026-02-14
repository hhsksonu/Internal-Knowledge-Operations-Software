# Internal Knowledge Operations Platform - Backend

A production-ready Django backend for an enterprise knowledge management and RAG (Retrieval-Augmented Generation) system.

## 🎯 What This Platform Does

This is **NOT** a simple "chat with PDF" demo. This is a **production-grade internal knowledge platform** that companies use to:

- ✅ Upload and manage internal documents (PDF, DOCX, TXT)
- ✅ Process documents asynchronously with Celery
- ✅ Search documents using semantic similarity (vector search)
- ✅ Get AI-powered answers WITH source attribution
- ✅ Enforce role-based access control
- ✅ Track costs (token usage) and rate limits
- ✅ Collect human feedback for quality improvement
- ✅ Monitor usage with analytics
- ✅ Maintain audit logs for compliance

## 🏗️ Architecture

```
API Layer (Django REST Framework)
    ↓
Service Layer (Business Logic)
    ↓
┌─────────────┬──────────────┬────────────────┐
│   Celery    │  LLM Service │ Vector Storage │
│   Workers   │  (Abstract)  │   (pgvector)   │
└─────────────┴──────────────┴────────────────┘
    ↓
PostgreSQL Database
```

## 📦 Tech Stack

- **Backend**: Python 3.10+, Django 4.2, Django REST Framework
- **Database**: PostgreSQL 14+ with pgvector extension
- **Async Processing**: Celery + Redis
- **Vector Storage**: pgvector (PostgreSQL extension)
- **Authentication**: JWT (Simple JWT)
- **LLM Integration**: Abstracted (supports OpenAI, Anthropic, etc.)

## 🚀 Getting Started

### Prerequisites

1. **Python 3.10+**
2. **PostgreSQL 14+** with pgvector extension
3. **Redis** (for Celery)
4. **LLM API Key** (OpenAI or Anthropic)

### Installation Steps

#### 1. Clone and Setup Virtual Environment

```bash
cd knowledge_platform_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Setup PostgreSQL with pgvector

```bash
# Install PostgreSQL (if not already installed)
# On Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# Install pgvector extension
sudo apt-get install postgresql-14-pgvector

# Or on macOS with Homebrew:
brew install postgresql@14
brew install pgvector

# Create database
sudo -u postgres psql

CREATE DATABASE knowledge_platform;
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE knowledge_platform TO postgres;

# Enable pgvector extension
\c knowledge_platform
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

#### 4. Setup Redis

```bash
# On Ubuntu/Debian:
sudo apt-get install redis-server
sudo systemctl start redis-server

# On macOS:
brew install redis
brew services start redis

# Verify Redis is running:
redis-cli ping  # Should return PONG
```

#### 5. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your settings:
# - SECRET_KEY: Django secret key (generate one)
# - LLM_API_KEY: Your OpenAI/Anthropic API key
# - Database credentials
# - Redis URL
```

#### 6. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 7. Create Superuser

```bash
python manage.py createsuperuser
# Follow prompts to create an admin user
```

#### 8. Start the Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

#### 9. Start Celery Worker (in a new terminal)

```bash
# Activate virtual environment
source venv/bin/activate

# Start Celery worker
celery -A config worker -l info
```

#### 10. (Optional) Start Celery Beat for Periodic Tasks

```bash
# In another terminal
celery -A config beat -l info
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (get JWT tokens) |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get user profile |
| PUT | `/api/auth/profile/` | Update profile |

### Document Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload/` | Upload document |
| GET | `/api/documents/` | List documents (with filters) |
| GET | `/api/documents/<id>/` | Get document details |
| PUT | `/api/documents/<id>/` | Update document |
| DELETE | `/api/documents/<id>/` | Archive document |
| POST | `/api/documents/<id>/approve/` | Approve/archive document |
| POST | `/api/documents/<id>/new-version/` | Upload new version |
| GET | `/api/documents/versions/<id>/status/` | Check processing status |

### Retrieval (RAG)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/retrieval/query/` | Ask a question |
| GET | `/api/retrieval/queries/` | Get query history |
| GET | `/api/retrieval/queries/<id>/` | Get query details |
| POST | `/api/retrieval/feedback/` | Submit feedback |
| GET | `/api/retrieval/feedback/list/` | List feedback (reviewers) |
| POST | `/api/retrieval/feedback/<id>/review/` | Mark as reviewed |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/stats/` | System statistics |
| GET | `/api/analytics/queries/` | Query analytics |
| GET | `/api/analytics/me/` | User's analytics |

### Audit

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit/logs/` | Audit logs (admin only) |

## 🔑 User Roles

1. **ADMIN**: Full system access
2. **CONTENT_OWNER**: Upload and approve documents
3. **EMPLOYEE**: Query and provide feedback
4. **REVIEWER**: Review feedback and quality

## 📝 Example API Usage

### 1. Register and Login

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@company.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "role": "EMPLOYEE"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'

# Save the access token from response
```

### 2. Upload a Document

```bash
curl -X POST http://localhost:8000/api/documents/upload/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@document.pdf" \
  -F "title=Company Handbook" \
  -F "description=Employee handbook 2024" \
  -F "tags=[\"HR\", \"Policy\"]" \
  -F "department=HR"
```

### 3. Check Processing Status

```bash
curl http://localhost:8000/api/documents/versions/1/status/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Approve Document (Content Owner)

```bash
curl -X POST http://localhost:8000/api/documents/1/approve/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'
```

### 5. Query (Ask a Question)

```bash
curl -X POST http://localhost:8000/api/retrieval/query/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is our remote work policy?",
    "department": "HR"
  }'
```

### 6. Submit Feedback

```bash
curl -X POST http://localhost:8000/api/retrieval/feedback/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query_id": 1,
    "feedback_type": "HELPFUL",
    "rating": 5,
    "comment": "Very helpful answer!"
  }'
```

## 🎓 For Freshers: Understanding the Code

### Key Concepts

1. **Models** (`models.py`): Database tables
   - Define what data we store
   - Relationships between entities

2. **Serializers** (`serializers.py`): Data validation
   - Convert JSON ↔ Python objects
   - Validate incoming data

3. **Views** (`views.py`): Request handlers
   - Process HTTP requests
   - Return responses

4. **Services** (`services.py`): Business logic
   - Document processing
   - LLM calls
   - Vector search

5. **Tasks** (`tasks.py`): Async jobs
   - Background processing
   - Document chunking
   - Embedding generation

### Document Lifecycle

```
1. User uploads → Document created (DRAFT status)
2. Celery task starts → Processing (UPLOADED → PROCESSING)
3. Text extraction → Chunking → Embedding generation
4. Status updated → READY
5. Content owner approves → Document (APPROVED status)
6. Now searchable → Available for queries
```

### Query Flow (RAG)

```
1. User asks question → /api/retrieval/query/
2. Generate question embedding → Vector representation
3. Semantic search → Find similar chunks (cosine similarity)
4. Build context → Top K chunks
5. Call LLM → Generate answer with prompt
6. Save query → Store for analytics
7. Return answer + sources → User sees attribution
```

## 🔧 Configuration

Edit `.env` to configure:

- `LLM_PROVIDER`: `openai` or `anthropic`
- `LLM_MODEL`: Model to use (e.g., `gpt-3.5-turbo`)
- `CHUNK_SIZE`: Characters per chunk (default: 500)
- `TOP_K_RESULTS`: Chunks to retrieve (default: 5)
- `MAX_QUERIES_PER_DAY`: Rate limit per user (default: 100)

## 🐛 Troubleshooting

### Issue: "No module named 'config'"
**Solution**: Make sure you're in the project root and virtual environment is activated.

### Issue: "relation does not exist"
**Solution**: Run migrations: `python manage.py migrate`

### Issue: "pgvector extension not found"
**Solution**: Install pgvector extension in PostgreSQL (see setup steps)

### Issue: "Celery tasks not processing"
**Solution**: Make sure Celery worker is running and Redis is accessible

### Issue: "LLM API errors"
**Solution**: Check your API key in `.env` and verify credits/quota

## 📚 Next Steps

1. **Replace Demo Embeddings**: Update `apps/retrieval/services.py` with real OpenAI/Anthropic API calls
2. **Add Tests**: Write unit tests for critical functions
3. **Production Deployment**: Use Gunicorn, Nginx, Docker
4. **Monitoring**: Add Sentry for error tracking
5. **Scaling**: Consider read replicas, caching strategies

## 🎯 What Makes This Production-Ready?

✅ **Async Processing**: Celery for background tasks
✅ **Permission System**: Role-based access control
✅ **Versioning**: Track document changes
✅ **Source Attribution**: Know where answers come from
✅ **Feedback Loop**: Quality improvement mechanism
✅ **Cost Control**: Token tracking, rate limits
✅ **Audit Logging**: Compliance and security
✅ **Error Handling**: Graceful failures with retry logic
✅ **Analytics**: Usage insights
✅ **Extensible**: Easy to add features

## 📖 Learning Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [pgvector](https://github.com/pgvector/pgvector)

---

**Built with ❤️ for learning and production use**
