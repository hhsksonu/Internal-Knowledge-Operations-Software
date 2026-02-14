# System Architecture Documentation

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend (Phase 2)                         │
│                    React + TypeScript                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST + JWT
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                             │
│                  Django REST Framework                           │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ Auth         │ Documents    │ Retrieval    │ Analytics    │ │
│  │ /api/auth/*  │ /api/docs/*  │ /api/query/* │ /api/stats/* │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                                 │
│  ┌──────────────────────┬────────────────────┬────────────────┐ │
│  │ DocumentProcessing   │ VectorSearch       │ LLMService     │ │
│  │ Service              │ Service            │ (Abstracted)   │ │
│  └──────────────────────┴────────────────────┴────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────┬──────────────────┬──────────────────────────┐
│  Async Workers   │  LLM Providers   │   Vector Storage         │
│    (Celery)      │  OpenAI/Anthropic│   pgvector/FAISS         │
│  - Extract Text  │  - Embeddings    │  - Cosine Similarity     │
│  - Chunk Docs    │  - Generation    │  - Metadata Filter       │
│  - Generate      │  - Token Count   │  - Permission Aware      │
│    Embeddings    │                  │                          │
└──────────────────┴──────────────────┴──────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Data Layer (PostgreSQL)                        │
│  ┌────────────┬────────────┬────────────┬────────────┐         │
│  │ Users      │ Documents  │ Queries    │ Feedback   │         │
│  │ Roles      │ Versions   │ Sources    │ Audit Logs │         │
│  │ Quotas     │ Chunks     │ Analytics  │            │         │
│  └────────────┴────────────┴────────────┴────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Module Structure

### 1. Core App (`apps/core/`)
**Purpose**: Authentication, authorization, user management

**Models**:
- `User`: Extended Django user with roles and quotas
  - Fields: username, email, role, daily_query_count, total_tokens_used
  - Methods: can_query(), increment_query_count(), add_token_usage()

**Key Components**:
- JWT authentication (Simple JWT)
- Role-based permissions (Admin, ContentOwner, Employee, Reviewer)
- Rate limiting logic
- Custom exception handlers

**APIs**:
- Register, Login, Refresh tokens
- Profile management
- Password change

---

### 2. Documents App (`apps/documents/`)
**Purpose**: Document management and asynchronous processing

**Models**:
- `Document`: Main document entity
  - Statuses: DRAFT → APPROVED → ARCHIVED
  - Relationships: owner, versions, approver
  
- `DocumentVersion`: Version tracking
  - Processing states: UPLOADED → PROCESSING → READY/FAILED
  - Fields: file, file_size, total_chunks, error_message
  
- `DocumentChunk`: Text chunks with embeddings
  - Fields: text, embedding (vector), chunk_index, metadata
  - Used for: Retrieval and source attribution

**Services**:
- `DocumentProcessingService`: Text extraction, chunking
  - Supports: PDF, DOCX, TXT
  - Chunking strategy: Overlapping chunks with sentence boundaries
  
**Celery Tasks**:
- `process_document_task`: Main orchestration
- `extract_and_chunk_task`: Text extraction
- `generate_embeddings_task`: Embedding generation
- `cleanup_failed_uploads`: Periodic cleanup

**APIs**:
- Upload, List, Detail, Update, Delete
- Approve/Archive
- Version management
- Processing status check

---

### 3. Retrieval App (`apps/retrieval/`)
**Purpose**: RAG (Retrieval-Augmented Generation) system

**Models**:
- `Query`: User questions and LLM responses
  - Fields: question, answer, context_used, tokens_used
  - Analytics: response_time_ms, similarity_score, was_successful
  
- `QuerySource`: Source attribution (many-to-many)
  - Links queries to document chunks
  - Tracks: similarity_score, rank
  
- `Feedback`: Human-in-the-loop quality control
  - Types: HELPFUL, NOT_HELPFUL, HALLUCINATION, MISSING_INFO
  - Fields: rating, comment, hallucinated_text
  - Review workflow: is_reviewed, reviewed_by, reviewed_at

**Services**:
- `EmbeddingService`: Generate embeddings
  - Abstracted for multiple providers
  - Batch processing support
  
- `LLMService`: Answer generation
  - Prompt engineering with strict rules
  - Token counting
  - Provider abstraction (OpenAI, Anthropic)
  
- `VectorSearchService`: Semantic similarity search
  - pgvector cosine similarity
  - Permission-aware filtering
  - Configurable top-K and threshold

**RAG Pipeline**:
```
1. User Question
   ↓
2. Generate Question Embedding
   ↓
3. Vector Similarity Search (pgvector)
   - Cosine distance calculation
   - Filter by permissions (approved docs only)
   - Filter by department (optional)
   ↓
4. Retrieve Top-K Chunks
   - Default: Top 5 chunks above 0.7 similarity
   ↓
5. Build Context Prompt
   - Strict instructions: "Answer only from sources"
   - Format sources with attribution
   ↓
6. Call LLM
   - Generate answer
   - Count tokens
   ↓
7. Save Query + Sources
   - Store for analytics
   - Update user quotas
   ↓
8. Return Answer with Sources
```

**APIs**:
- Query execution
- Query history
- Feedback submission
- Feedback review (reviewers only)

---

### 4. Analytics App (`apps/analytics/`)
**Purpose**: System usage insights and monitoring

**Views**:
- System stats (admin only)
  - Document counts, query success rates
  - Token usage, user activity
  - Feedback statistics
  
- Query analytics (admin only)
  - Time-series analysis
  - Top users, average metrics
  - Performance monitoring
  
- User analytics
  - Personal usage stats
  - Remaining quotas

---

### 5. Audit App (`apps/audit/`)
**Purpose**: Compliance and security logging

**Model**:
- `AuditLog`: Comprehensive action tracking
  - Who: user
  - What: action type
  - When: timestamp
  - Where: IP address, user agent
  - Details: JSON metadata

**Logged Actions**:
- DOCUMENT_UPLOAD, DOCUMENT_APPROVE, DOCUMENT_DELETE
- QUERY_EXECUTED
- FEEDBACK_SUBMITTED
- USER_CREATED, PERMISSION_CHANGED

**Service**:
- `AuditService.log_action()`: Centralized logging

---

## 🔄 Key Data Flows

### Document Upload Flow

```
1. User uploads file → POST /api/documents/upload/
   ↓
2. API validates file (size, type)
   ↓
3. Create Document (status=DRAFT) + DocumentVersion (status=UPLOADED)
   ↓
4. Trigger Celery task (process_document_task.delay())
   ↓
5. Return immediately to user (async processing)
   
   [Background Processing]
6. Celery worker picks up task
   ↓
7. Extract text from file (PDF/DOCX/TXT)
   ↓
8. Chunk text (500 chars, 50 char overlap)
   ↓
9. Generate embeddings for each chunk (LLM API call)
   ↓
10. Save chunks to database (bulk_create)
   ↓
11. Update version status → READY
   ↓
12. Ready for approval
```

### Query (RAG) Flow

```
1. User asks question → POST /api/retrieval/query/
   ↓
2. Check rate limit (daily_query_count < MAX)
   ↓
3. Generate question embedding
   ↓
4. Vector search (pgvector cosine similarity)
   - Query: SELECT * FROM chunks ORDER BY embedding <=> question_embedding LIMIT 5
   - Filter: Only APPROVED documents, READY versions
   ↓
5. Get top 5 chunks (similarity > 0.7)
   ↓
6. Build prompt:
   """
   Answer ONLY from these sources:
   [Source 1: Company Handbook]
   Remote work policy text...
   
   Question: What is our remote work policy?
   """
   ↓
7. Call LLM API (OpenAI/Anthropic)
   ↓
8. Get answer + token count
   ↓
9. Save Query record
   ↓
10. Create QuerySource links (5 records)
   ↓
11. Increment user.daily_query_count
   ↓
12. Add to user.total_tokens_used
   ↓
13. Log audit trail
   ↓
14. Return response with sources
```

---

## 🔐 Security Architecture

### Authentication
- JWT tokens (access + refresh)
- Access token: 60 min lifetime
- Refresh token: 7 days lifetime
- Token rotation on refresh

### Authorization
- Role-based access control (RBAC)
- 4 roles: Admin, ContentOwner, Employee, Reviewer
- Permission classes at view level
- Object-level permissions for documents

### Rate Limiting
- Per-user daily query limits
- Token usage tracking
- Configurable thresholds

### Data Security
- Password hashing (Django's PBKDF2)
- SQL injection protection (Django ORM)
- CORS configuration
- Environment-based secrets

---

## 📊 Database Schema

### Key Relationships

```
User (1) ─┬─ owns ──→ (N) Documents
          ├─ executes ──→ (N) Queries
          ├─ gives ──→ (N) Feedback
          └─ creates ──→ (N) AuditLogs

Document (1) ──→ (N) DocumentVersions
DocumentVersion (1) ──→ (N) DocumentChunks

Query (1) ──→ (N) QuerySources
QuerySource (N) ──→ (1) DocumentChunk

Query (1) ──→ (N) Feedback
```

### Indexes

**Performance-critical indexes**:
- `users.email` (login lookups)
- `users.role` (permission checks)
- `documents.status` (listing approved docs)
- `document_chunks.embedding` (vector search - IVFFlat/HNSW)
- `queries.user, queries.created_at` (user history)
- `audit_logs.timestamp` (log queries)

### Vector Index (pgvector)

```sql
-- IVFFlat index for approximate nearest neighbor search
CREATE INDEX ON document_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

---

## ⚡ Performance Considerations

### Caching Strategy
- Redis for Celery results
- Django cache for frequently accessed data
- Consider: Query result caching (with TTL)

### Database Optimization
- Connection pooling
- Read replicas for analytics queries
- Partitioning audit_logs by date

### Async Processing
- Celery worker scaling (horizontal)
- Task priorities (high: queries, low: analytics)
- Task retries with exponential backoff

### LLM API Optimization
- Batch embedding generation
- Prompt caching (provider-dependent)
- Token usage monitoring

---

## 🚀 Deployment Architecture

### Production Components

```
┌─────────────────┐
│   Load Balancer │
│     (Nginx)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│  Web  │ │  Web  │  (Gunicorn workers)
│Server1│ │Server2│
└───┬───┘ └──┬────┘
    │        │
    └────┬───┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│  (with pgvector)│
└─────────────────┘

┌─────────────────┐
│      Redis      │
│   (Celery + Cache)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Celery │ │Celery │  (Background workers)
│Worker1│ │Worker2│
└───────┘ └───────┘
```

### Environment Variables

**Critical for deployment**:
- `SECRET_KEY`: Django secret (generate secure)
- `DEBUG`: False in production
- `ALLOWED_HOSTS`: Your domain names
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `LLM_API_KEY`: Provider API key

---

## 🔍 Monitoring & Observability

### Metrics to Track
1. **System Health**
   - API response times
   - Database query times
   - Celery queue length
   
2. **Business Metrics**
   - Daily active users
   - Query success rate
   - Average similarity scores
   - Token usage per user
   
3. **Quality Metrics**
   - Feedback ratios (helpful vs not helpful)
   - Hallucination reports
   - Failed query patterns

### Logging
- Application logs: `/app/logs/django.log`
- Celery logs: Worker output
- Access logs: Nginx/Gunicorn
- Structured logging with context

### Alerts
- High error rate (>5%)
- Slow response times (>3s)
- Celery queue backup (>100 tasks)
- Database connection issues
- LLM API failures

---

## 🛠️ Trade-offs & Limitations

### Current Implementation

**Pros**:
✅ Simple to understand and maintain
✅ Suitable for 100s-1000s of documents
✅ Cost-effective for small teams
✅ Fast iteration and deployment

**Cons**:
❌ Single pgvector instance limits scale
❌ No distributed caching
❌ Basic prompt engineering
❌ Simple role system (not fine-grained)

### Scaling Considerations

**When to upgrade**:
- 10,000+ documents → Consider dedicated vector DB (Pinecone, Weaviate)
- 1000+ concurrent users → Add read replicas, load balancer
- Complex permissions → Implement ABAC (Attribute-Based Access Control)
- Multi-tenancy → Add tenant isolation, separate databases

---

## 📚 For Freshers: Key Takeaways

1. **Separation of Concerns**: Models ≠ Business Logic ≠ API
   - Models: What data we store
   - Services: How we process it
   - Views: How we expose it

2. **Async is Essential**: Never block HTTP requests
   - File processing takes seconds/minutes
   - Use Celery for background work
   - Return immediately to user

3. **Vector Search ≠ Full-Text Search**
   - Vector: Semantic similarity ("remote work" ≈ "work from home")
   - Full-text: Keyword matching
   - Use embeddings for better retrieval

4. **RAG Pipeline**: Context + Prompt + LLM = Answer
   - Quality depends on ALL three
   - Garbage in → Garbage out
   - Source attribution prevents hallucinations

5. **Production ≠ Demo**:
   - Error handling, retries, logging
   - Rate limits, cost tracking
   - Audit trails, permissions
   - Analytics, monitoring

---

This architecture is designed to be:
- **Educational**: Clear concepts for learning
- **Production-ready**: Real-world features
- **Scalable**: Can grow with needs
- **Maintainable**: Clean code, good practices
