# Know Your Organization (KYO)

**AI-Powered Internal Knowledge System**

A production-ready RAG (Retrieval-Augmented Generation) platform that enables employees to get instant, accurate answers from your organization's internal documents using AI.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://app.knowyourorg.com)
[![Backend API](https://img.shields.io/badge/api-active-blue)](https://api.knowyourorg.com/api/)
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## What is KYO?

Know Your Organization transforms how employees access internal knowledge. Instead of searching through countless documents, folders, and emails, employees simply ask questions in natural language and get instant, source-backed answers.

**Problem it solves:**
- Hours wasted searching for policy documents
- Repetitive questions to HR, IT, and managers
- Outdated information in shared drives
- Knowledge silos across departments

**Solution:**
- Instant AI-powered answers from approved documents
- Source citations for every response
- Centralized, version-controlled knowledge base
- Role-based access control
- Complete audit trail

---

## Live Demo

- **Frontend:** [https://app.knowyourorg.com](https://app.knowyourorg.com)
- **Backend API:** [https://api.knowyourorg.com/api/](https://api.knowyourorg.com/api/)

### Platform Screenshots

<table>
  <tr>
    <td><img src="./screenshots/homepage.png" alt="Homepage"></td>
    <td><img src="./screenshots/query-page.png" alt="Query Page"></td>
  </tr>
  <tr>
    <td align="center"><b>Landing Page</b></td>
    <td align="center"><b>AI Query Interface</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/documents.png" alt="Documents"></td>
    <td><img src="./screenshots/dark-mode.png" alt="Dark Mode"></td>
  </tr>
  <tr>
    <td align="center"><b>Document Management</b></td>
    <td align="center"><b>Dark Mode Support</b></td>
  </tr>
</table>

---
### Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Employee | `testuser` | `Test123!@#` |
| Content Owner | `contentowner` | `Test123!@#` |
| Reviewer | `reviewer` | `Test123!@#` |
| Administrator | `admin` | `Test123!@#` |

---

## Overview

![KYO Platform Overview](./screenshots/hero-banner.png)

## Key Features

### For Employees
- **Natural Language Search** - Ask questions in plain English
- **Source Citations** - Every answer links to the exact document
- **Query History** - Access your past questions and answers
- **Feedback System** - Rate answers to improve AI quality

### For Content Owners
- **Document Upload** - PDF, DOCX, and TXT support
- **Approval Workflow** - Review before publishing
- **Version Control** - Track document changes over time
- **Organization** - Tag and categorize by department

### For Reviewers
- **Analytics Dashboard** - Track usage and success rates
- **Feedback Monitoring** - Review low-rated answers
- **Gap Identification** - Find missing knowledge areas
- **Quality Metrics** - Monitor AI performance

### For Administrators
- **User Management** - Control access and roles
- **Audit Logs** - Complete activity tracking
- **System Settings** - Configure platform behavior
- **Document Management** - Full CRUD operations

---

## Architecture

### Tech Stack

**Frontend:**
- React 18.3 + Vite
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Material Icons

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL with pgvector extension
- Redis for caching and Celery broker
- Celery for async task processing
- Gunicorn + Nginx for production

**AI/ML:**
- Hugging Face Inference API
- BAAI/bge-base-en-v1.5 (embeddings - 768 dimensions)
- Mistral-7B-Instruct-v0.2 (text generation)
- pgvector for semantic search

**Infrastructure:**
- Frontend: Vercel (CDN + Auto SSL)
- Backend: AWS EC2 (t2.micro)
- Database: PostgreSQL on EC2
- Cache/Queue: Redis on EC2
- SSL: Let's Encrypt (Certbot)

---

## Project Structure

```
know-your-organization/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── api/             # API client (axios)
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context (theme, auth)
│   │   └── utils/           # Helper functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Django backend application
│   ├── apps/
│   │   ├── core/            # User model & authentication
│   │   ├── documents/       # Document management
│   │   ├── retrieval/       # RAG & vector search
│   │   ├── analytics/       # Usage analytics
│   │   └── audit/           # Audit logging
│   ├── config/              # Django settings & URLs
│   ├── media/               # Uploaded documents
│   ├── staticfiles/         # Collected static files
│   └── requirements.txt
│
├── docs/                     # Documentation
│   ├── USER_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── API_REFERENCE.md
│
└── README.md                 # This file
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ with pgvector
- Redis 7+

### Local Development Setup

**1. Clone the repository:**
```bash
git clone https://github.com/yourusername/know-your-organization.git
cd know-your-organization
```

**2. Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

**3. Start Celery (in new terminal):**
```bash
cd backend
source venv/bin/activate
celery -A config worker --loglevel=info
```

**4. Frontend Setup:**
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env with backend API URL

# Start development server
npm run dev
```

**5. Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

---

## Production Deployment

### Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Vercel CDN    │────────▶│   AWS EC2        │
│  (Frontend)     │  HTTPS  │   (Backend)      │
│ app.yourorg.com │         │ api.yourorg.com  │
└─────────────────┘         └──────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
              │ PostgreSQL│   │   Redis   │   │  Celery   │
              │ + pgvector│   │  (Cache)  │   │  Worker   │
              └───────────┘   └───────────┘   └───────────┘
```

### Deployment Steps

See detailed guides:
- [Frontend Deployment](./frontend/README.md#deployment)
- [Backend Deployment](./backend/README.md#deployment)

**Quick Overview:**

1. **Setup Domain:**
   - Point `api.yourdomain.com` to EC2 IP
   - Point `app.yourdomain.com` to Vercel

2. **Backend (AWS EC2):**
   - Install PostgreSQL + pgvector
   - Install Redis
   - Configure Nginx + Gunicorn
   - Setup SSL with Let's Encrypt
   - Configure Celery as systemd service

3. **Frontend (Vercel):**
   - Connect GitHub repository
   - Add custom domain
   - Set environment variables
   - Auto-deploy on push

---

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - 4 permission levels
- **HTTPS Everywhere** - SSL/TLS encryption
- **CORS Protection** - Restricted origins
- **Rate Limiting** - Prevent abuse
- **Audit Logging** - Track all actions
- **SQL Injection Protection** - Django ORM
- **XSS Protection** - Content Security Policy
- **Password Hashing** - Argon2 algorithm

---

## Performance

- **Query Response Time:** < 2 seconds average
- **Document Processing:** ~5-10 seconds per document
- **Vector Search:** < 100ms for 10,000+ chunks
- **Concurrent Users:** 50+ on t2.micro
- **Uptime:** 99.5% (AWS free tier)

---

## Testing

**Backend Tests:**
```bash
cd backend
pytest
pytest --cov=apps  # With coverage
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

**E2E Testing:**
See [Testing Guide](./docs/TESTING.md)

---

## Documentation

- [User Guide](./docs/USER_GUIDE.md) - How to use the platform
- [API Reference](./docs/API_REFERENCE.md) - Backend API endpoints
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production setup
- [Contributing](./CONTRIBUTING.md) - Development guidelines

---

## RAG Pipeline

```
┌──────────────┐
│   Document   │
│   Upload     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Text        │
│  Extraction  │  (PyPDF2, python-docx)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Chunking    │  (500 chars, 50 overlap)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Embeddings  │  (BGE-base-en-v1.5)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Store in    │
│  pgvector    │  (768-dim vectors)
└──────────────┘

Query Flow:
User Query → Embedding → Vector Search → Top-K Chunks → LLM (Mistral-7B) → Answer
```

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Development Workflow:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

## Environment Variables

### Backend (.env)

```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com,localhost

# Database
DB_NAME=knowledge_platform
DB_USER=kyo_user
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://:password@localhost:6379/0

# Hugging Face
HF_EMBEDDING_API_KEY=hf_your_token
HF_LLM_API_KEY=hf_your_token
```

### Frontend (.env)

```bash
VITE_API_URL=https://api.yourdomain.com/api
```

---

## Known Issues & Limitations

- **Free Tier Limitations:**
  - AWS t2.micro: 1GB RAM (may need optimization for large files)
  - Hugging Face API: Rate limits apply
  
- **Supported File Types:**
  - PDF, DOCX, TXT only
  - Max file size: 10MB
  
- **Language Support:**
  - English only (model limitation)

---

## Roadmap

- Multi-language support
- Excel/CSV document support
- Advanced search filters
- Document collaboration features
- Mobile app (React Native)
- Slack/Teams integration
- Admin dashboard enhancements
- AI model fine-tuning

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Authors

**Your Name**
- GitHub: [@hhsksonu](https://github.com/hhsksonu)
- LinkedIn: [Your Profile](https://linkedin.com/in/hhsksonu)

---

## Acknowledgments

- [Hugging Face](https://huggingface.co) for inference API
- [pgvector](https://github.com/pgvector/pgvector) for vector search
- [Django](https://www.djangoproject.com/) & [React](https://react.dev/) communities
- [Vercel](https://vercel.com) for frontend hosting
- [AWS](https://aws.amazon.com) for backend infrastructure

---

## Support

- **Documentation:** [docs.knowyourorg.com](https://docs.knowyourorg.com)
- **Issues:** [GitHub Issues](https://github.com/yourusername/know-your-organization/issues)
- **Email:** support@knowyourorg.com

---

## Star History

If you find this project useful, please consider giving it a star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/know-your-organization&type=Date)](https://star-history.com/#yourusername/know-your-organization&Date)

---

**Built with care by Sonu Kumar**
