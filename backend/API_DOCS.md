# API Documentation

## Base URL
`http://localhost:8000`

## Authentication

All endpoints (except registration and login) require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## 1. Authentication Endpoints

### Register User
**POST** `/api/auth/register/`

Request:
```json
{
  "username": "john_doe",
  "email": "john@company.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "EMPLOYEE"
}
```

Response (201):
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@company.com",
    "role": "EMPLOYEE"
  },
  "tokens": {
    "refresh": "...",
    "access": "..."
  }
}
```

### Login
**POST** `/api/auth/login/`

Request:
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

Response (200):
```json
{
  "refresh": "...",
  "access": "..."
}
```

### Refresh Token
**POST** `/api/auth/refresh/`

Request:
```json
{
  "refresh": "your_refresh_token"
}
```

Response (200):
```json
{
  "access": "new_access_token"
}
```

### Get Profile
**GET** `/api/auth/profile/`

Response (200):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "EMPLOYEE",
  "daily_query_count": 5,
  "total_tokens_used": 1523
}
```

---

## 2. Document Management

### Upload Document
**POST** `/api/documents/upload/`

Content-Type: `multipart/form-data`

Form fields:
- `file`: Document file (PDF/DOCX/TXT)
- `title`: Document title
- `description`: Description (optional)
- `tags`: JSON array of tags (optional)
- `department`: Department name (optional)

Response (201):
```json
{
  "message": "Document uploaded successfully. Processing started.",
  "document": {
    "id": 1,
    "title": "Company Handbook",
    "status": "DRAFT",
    "versions": [
      {
        "id": 1,
        "version_number": 1,
        "processing_status": "UPLOADED",
        "file_type": "pdf"
      }
    ]
  }
}
```

### List Documents
**GET** `/api/documents/`

Query params:
- `status`: DRAFT, APPROVED, ARCHIVED
- `department`: Filter by department
- `tags`: Comma-separated tags
- `search`: Search in title/description

Response (200):
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Company Handbook",
      "description": "Employee handbook 2024",
      "status": "APPROVED",
      "owner_username": "admin",
      "current_version": 2,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Document Details
**GET** `/api/documents/{id}/`

Response (200):
```json
{
  "id": 1,
  "title": "Company Handbook",
  "description": "Employee handbook 2024",
  "status": "APPROVED",
  "owner": 1,
  "owner_username": "admin",
  "tags": ["HR", "Policy"],
  "department": "HR",
  "versions": [
    {
      "id": 2,
      "version_number": 2,
      "processing_status": "READY",
      "total_chunks": 25,
      "created_at": "2024-01-20T14:00:00Z"
    },
    {
      "id": 1,
      "version_number": 1,
      "processing_status": "READY",
      "total_chunks": 23,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Approve Document
**POST** `/api/documents/{id}/approve/`

Request:
```json
{
  "action": "approve"  // or "archive"
}
```

Response (200):
```json
{
  "message": "Document approved successfully",
  "document": { ... }
}
```

### Upload New Version
**POST** `/api/documents/{id}/new-version/`

Content-Type: `multipart/form-data`

Form field:
- `file`: New document file

Response (201):
```json
{
  "message": "Version 3 uploaded successfully. Processing started.",
  "version": {
    "id": 3,
    "version_number": 3,
    "processing_status": "UPLOADED"
  }
}
```

### Check Processing Status
**GET** `/api/documents/versions/{id}/status/`

Response (200):
```json
{
  "version_id": 1,
  "document_id": 1,
  "document_title": "Company Handbook",
  "version_number": 1,
  "processing_status": "READY",
  "total_chunks": 25,
  "error_message": "",
  "created_at": "2024-01-15T10:30:00Z",
  "processed_at": "2024-01-15T10:32:15Z"
}
```

---

## 3. Retrieval (RAG) Endpoints

### Ask Question
**POST** `/api/retrieval/query/`

Request:
```json
{
  "question": "What is our remote work policy?",
  "department": "HR"  // optional
}
```

Response (200):
```json
{
  "query_id": 42,
  "question": "What is our remote work policy?",
  "answer": "According to Source 1, employees can work remotely up to 3 days per week...",
  "sources": [
    {
      "chunk_id": 123,
      "document_title": "Company Handbook",
      "version_number": 2,
      "text": "Remote Work Policy: Employees are allowed...",
      "similarity_score": 0.89,
      "rank": 1,
      "metadata": {"char_start": 1500, "char_end": 2000}
    }
  ],
  "tokens_used": 450,
  "response_time_ms": 1200,
  "num_chunks_retrieved": 3,
  "avg_similarity_score": 0.85
}
```

### Get Query History
**GET** `/api/retrieval/queries/`

Query params:
- `search`: Search in questions/answers

Response (200):
```json
{
  "count": 15,
  "results": [
    {
      "id": 42,
      "question": "What is our remote work policy?",
      "answer": "According to Source 1...",
      "was_successful": true,
      "created_at": "2024-01-20T15:30:00Z",
      "sources": [...]
    }
  ]
}
```

### Get Query Details
**GET** `/api/retrieval/queries/{id}/`

Response (200):
```json
{
  "id": 42,
  "user": 1,
  "user_username": "john_doe",
  "question": "What is our remote work policy?",
  "answer": "According to Source 1...",
  "sources": [...],
  "tokens_used": 450,
  "response_time_ms": 1200,
  "created_at": "2024-01-20T15:30:00Z"
}
```

---

## 4. Feedback Endpoints

### Submit Feedback
**POST** `/api/retrieval/feedback/`

Request:
```json
{
  "query_id": 42,
  "feedback_type": "HELPFUL",  // HELPFUL, NOT_HELPFUL, HALLUCINATION, MISSING_INFO, WRONG_SOURCE
  "rating": 5,  // 1-5, optional
  "comment": "Very helpful answer!",  // optional
  "hallucinated_text": ""  // required for HALLUCINATION type
}
```

Response (201):
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": 1,
    "query": 42,
    "feedback_type": "HELPFUL",
    "rating": 5,
    "created_at": "2024-01-20T15:35:00Z"
  }
}
```

### List Feedback (Reviewers Only)
**GET** `/api/retrieval/feedback/list/`

Query params:
- `feedback_type`: Filter by type
- `is_reviewed`: true/false

Response (200):
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "query": 42,
      "user_username": "john_doe",
      "feedback_type": "HELPFUL",
      "rating": 5,
      "is_reviewed": false,
      "created_at": "2024-01-20T15:35:00Z"
    }
  ]
}
```

### Mark Feedback as Reviewed
**POST** `/api/retrieval/feedback/{id}/review/`

Response (200):
```json
{
  "message": "Feedback marked as reviewed",
  "feedback": {...}
}
```

---

## 5. Analytics Endpoints

### System Statistics (Admin Only)
**GET** `/api/analytics/stats/`

Response (200):
```json
{
  "documents": {
    "total": 50,
    "approved": 45,
    "pending": 5
  },
  "queries": {
    "total": 1234,
    "successful": 1150,
    "failed": 84,
    "success_rate": 93.19
  },
  "tokens": {
    "total_used": 456789
  },
  "users": {
    "total_active": 25
  },
  "feedback": {
    "total": 320,
    "helpful": 280,
    "hallucination_reports": 5
  }
}
```

### Query Analytics (Admin Only)
**GET** `/api/analytics/queries/`

Query params:
- `days`: Number of days (default 30)

Response (200):
```json
{
  "period_days": 30,
  "total_queries": 500,
  "successful_queries": 475,
  "success_rate": 95.0,
  "avg_response_time_ms": 1200.5,
  "avg_tokens_per_query": 450.2,
  "avg_similarity_score": 0.82,
  "top_users": [
    {"user__username": "john_doe", "count": 50},
    {"user__username": "jane_smith", "count": 45}
  ],
  "queries_by_day": [...]
}
```

### User Analytics
**GET** `/api/analytics/me/`

Response (200):
```json
{
  "queries": {
    "total": 50,
    "today": 5,
    "remaining_today": 95
  },
  "tokens_used": 25000,
  "feedback_given": 12,
  "recent_queries": [...]
}
```

---

## 6. Audit Logs (Admin Only)

### List Audit Logs
**GET** `/api/audit/logs/`

Query params:
- `action`: Filter by action type
- `user`: Filter by username
- `resource_type`: Filter by resource type

Response (200):
```json
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "user_username": "admin",
      "action": "DOCUMENT_APPROVE",
      "resource_type": "Document",
      "resource_id": 1,
      "details": {"title": "Company Handbook"},
      "timestamp": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "Invalid input",
  "details": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "AuthenticationError",
  "message": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "PermissionDenied",
  "message": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "error": "NotFound",
  "message": "Resource not found."
}
```

### 429 Too Many Requests
```json
{
  "error": "RateLimitExceeded",
  "message": "Daily query limit exceeded. Please try again tomorrow."
}
```

### 500 Internal Server Error
```json
{
  "error": "ServerError",
  "message": "An error occurred processing your request. Please try again."
}
```
