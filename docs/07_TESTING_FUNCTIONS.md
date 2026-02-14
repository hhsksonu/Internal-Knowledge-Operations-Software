# 07 - Testing All Functions

**Goal**: Test every major feature of the backend to ensure everything works.

**Time**: 1-2 hours

---

## 🧪 Testing Strategy

We'll test in this order:
1. ✅ Authentication (register, login)
2. ✅ Document upload and processing
3. ✅ Document approval
4. ✅ Query (RAG) system
5. ✅ Feedback submission
6. ✅ Analytics
7. ✅ Audit logs

---

## 🛠️ Testing Tools

We'll use **cURL** (command line) and **Postman** (GUI). Choose what you're comfortable with!

### Option 1: cURL (Command Line)
Already installed on macOS/Linux. For Windows:
- Comes with Windows 10+ by default
- Or use Git Bash
- Or use PowerShell

### Option 2: Postman (Recommended for Beginners)
1. Download from https://www.postman.com/downloads/
2. Install and open
3. Create a new collection called "Knowledge Platform"

---

## 🔐 Test 1: Authentication

### Test 1.1: Register a New User

**cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#",
    "password_confirm": "Test123!@#",
    "first_name": "Test",
    "last_name": "User",
    "role": "EMPLOYEE"
  }'
```

**Postman:**
1. Method: `POST`
2. URL: `http://localhost:8000/api/auth/register/`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!@#",
  "password_confirm": "Test123!@#",
  "first_name": "Test",
  "last_name": "User",
  "role": "EMPLOYEE"
}
```
5. Click **Send**

**Expected Response (201 Created):**
```json
{
  "user": {
    "id": 2,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "role": "EMPLOYEE",
    "daily_query_count": 0,
    "total_tokens_used": 0
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "User registered successfully"
}
```

**✅ Success Criteria:**
- Status code: 201
- Returns user object
- Returns JWT tokens
- User ID is assigned

**❌ Common Errors:**
```json
// Username already exists
{"username": ["A user with that username already exists."]}

// Weak password
{"password": ["This password is too common."]}

// Passwords don't match
{"password": ["Passwords do not match."]}
```

### Test 1.2: Login

**Save the access token from registration, or log in:**

**cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

**Postman:**
- Method: `POST`
- URL: `http://localhost:8000/api/auth/login/`
- Body:
```json
{
  "username": "testuser",
  "password": "Test123!@#"
}
```

**Expected Response (200 OK):**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**📝 IMPORTANT: Copy the access token!**
You'll need this for all subsequent requests.

**In Postman:** 
1. Copy the `access` token
2. Go to Authorization tab
3. Type: Bearer Token
4. Paste the token
5. Save this for the collection (so it applies to all requests)

**In cURL:**
```bash
# Save token as variable (bash/Linux/macOS)
export TOKEN="your-access-token-here"

# PowerShell (Windows)
$TOKEN = "your-access-token-here"
```

### Test 1.3: Get Profile

**cURL:**
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer $TOKEN"
```

**Postman:**
- Method: `GET`
- URL: `http://localhost:8000/api/auth/profile/`
- Authorization: Bearer Token (should be set from above)

**Expected Response (200 OK):**
```json
{
  "id": 2,
  "username": "testuser",
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "role": "EMPLOYEE",
  "daily_query_count": 0,
  "total_tokens_used": 0,
  "is_active": true,
  "date_joined": "2024-01-20T10:30:00Z"
}
```

---

## 📄 Test 2: Document Upload

### Test 2.1: Create a Test Document

First, create a simple test PDF:

**Create test.txt:**
```bash
# Create a test document
echo "Remote Work Policy

Employees are allowed to work remotely up to 3 days per week. 
Remote work must be approved by your manager.
Employees must be available during core hours: 10 AM - 3 PM EST.
All remote workers must have a secure internet connection.

Benefits of Remote Work:
- Improved work-life balance
- Reduced commuting time
- Increased productivity
- Lower office costs

Requirements:
1. Submit remote work request form
2. Manager approval required
3. IT setup for VPN access
4. Regular check-ins via video call" > test.txt
```

Or create a file manually with any content.

### Test 2.2: Upload Document

**cURL:**
```bash
curl -X POST http://localhost:8000/api/documents/upload/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "title=Remote Work Policy" \
  -F "description=Company remote work guidelines" \
  -F "tags=[\"HR\", \"Policy\"]" \
  -F "department=HR"
```

**Postman:**
1. Method: `POST`
2. URL: `http://localhost:8000/api/documents/upload/`
3. Authorization: Bearer Token
4. Body: form-data
   - `file`: Select your test.txt file
   - `title`: Remote Work Policy
   - `description`: Company remote work guidelines
   - `tags`: ["HR", "Policy"]
   - `department`: HR
5. Send

**Expected Response (201 Created):**
```json
{
  "message": "Document uploaded successfully. Processing started.",
  "document": {
    "id": 1,
    "title": "Remote Work Policy",
    "description": "Company remote work guidelines",
    "status": "DRAFT",
    "owner": 2,
    "owner_username": "testuser",
    "tags": ["HR", "Policy"],
    "department": "HR",
    "versions": [
      {
        "id": 1,
        "version_number": 1,
        "processing_status": "UPLOADED",
        "file_type": "txt",
        "total_chunks": 0
      }
    ]
  }
}
```

**✅ Success Criteria:**
- Status: 201
- Document created with ID
- Processing status: UPLOADED (will change to PROCESSING then READY)
- Version 1 created

**📝 Note:** Processing happens in background! Save the document ID.

### Test 2.3: Check Processing Status

Wait 10-30 seconds, then check if processing completed.

**cURL:**
```bash
curl -X GET http://localhost:8000/api/documents/versions/1/status/ \
  -H "Authorization: Bearer $TOKEN"
```

**Postman:**
- Method: `GET`
- URL: `http://localhost:8000/api/documents/versions/1/status/`

**Expected Response (after processing):**
```json
{
  "version_id": 1,
  "document_id": 1,
  "document_title": "Remote Work Policy",
  "version_number": 1,
  "processing_status": "READY",
  "total_chunks": 4,
  "error_message": "",
  "created_at": "2024-01-20T10:30:00Z",
  "processed_at": "2024-01-20T10:30:25Z"
}
```

**Processing States:**
- `UPLOADED` → Just uploaded
- `PROCESSING` → Currently processing
- `READY` → ✅ Ready to use!
- `FAILED` → ❌ Error (check error_message)

**If FAILED:**
- Check Celery worker is running
- Check error_message field
- Check Celery logs

### Test 2.4: List Documents

**cURL:**
```bash
curl -X GET http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Remote Work Policy",
      "status": "DRAFT",
      "current_version": 1,
      "created_at": "2024-01-20T10:30:00Z"
    }
  ]
}
```

---

## ✅ Test 3: Document Approval

Documents must be APPROVED before they can be queried.

**⚠️ Note:** Only users with ADMIN or CONTENT_OWNER role can approve.

### Test 3.1: Login as Admin

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123!"
  }'
```

**Save the new admin token:**
```bash
export ADMIN_TOKEN="admin-access-token-here"
```

### Test 3.2: Approve Document

**cURL:**
```bash
curl -X POST http://localhost:8000/api/documents/1/approve/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'
```

**Postman:**
- Method: `POST`
- URL: `http://localhost:8000/api/documents/1/approve/`
- Authorization: Bearer Token (use admin token)
- Body:
```json
{
  "action": "approve"
}
```

**Expected Response:**
```json
{
  "message": "Document approved successfully",
  "document": {
    "id": 1,
    "title": "Remote Work Policy",
    "status": "APPROVED",
    "approved_at": "2024-01-20T11:00:00Z",
    "approved_by_username": "admin"
  }
}
```

**✅ Success:** Document status changed to APPROVED!

---

## 🔍 Test 4: Query (RAG) System

Now the exciting part - asking questions!

### Test 4.1: Ask a Question

**cURL:**
```bash
curl -X POST http://localhost:8000/api/retrieval/query/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How many days per week can employees work remotely?",
    "department": "HR"
  }'
```

**Postman:**
- Method: `POST`
- URL: `http://localhost:8000/api/retrieval/query/`
- Body:
```json
{
  "question": "How many days per week can employees work remotely?",
  "department": "HR"
}
```

**Expected Response (200 OK):**
```json
{
  "query_id": 1,
  "question": "How many days per week can employees work remotely?",
  "answer": "Based on the provided sources, employees are allowed to work remotely up to 3 days per week. This must be approved by your manager.",
  "sources": [
    {
      "chunk_id": 1,
      "document_title": "Remote Work Policy",
      "version_number": 1,
      "text": "Employees are allowed to work remotely up to 3 days per week. Remote work must be approved by your manager.",
      "similarity_score": 0.92,
      "rank": 1
    }
  ],
  "tokens_used": 245,
  "response_time_ms": 1200,
  "num_chunks_retrieved": 3,
  "avg_similarity_score": 0.87
}
```

**✅ Success Criteria:**
- Got an answer
- Sources included with text snippets
- Similarity scores shown
- Answer references the source

**📝 Note:** 
- Answer quality depends on LLM_API_KEY configuration
- With demo key, you'll get placeholder responses
- With real OpenAI key, you'll get actual LLM answers

### Test 4.2: Query History

**cURL:**
```bash
curl -X GET http://localhost:8000/api/retrieval/queries/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "question": "How many days per week can employees work remotely?",
      "answer": "Based on the provided sources...",
      "was_successful": true,
      "created_at": "2024-01-20T11:05:00Z"
    }
  ]
}
```

### Test 4.3: Test No Results Scenario

Ask a question not in documents:

```bash
curl -X POST http://localhost:8000/api/retrieval/query/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the company vacation policy?"
  }'
```

**Expected Response:**
```json
{
  "query_id": 2,
  "question": "What is the company vacation policy?",
  "answer": "I don't have enough information to answer this question based on the available documents.",
  "sources": [],
  "tokens_used": 0,
  "message": "No relevant documents found. Consider uploading documents related to your question."
}
```

---

## 📊 Test 5: Feedback System

### Test 5.1: Submit Positive Feedback

**cURL:**
```bash
curl -X POST http://localhost:8000/api/retrieval/feedback/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query_id": 1,
    "feedback_type": "HELPFUL",
    "rating": 5,
    "comment": "Very helpful answer!"
  }'
```

**Postman:**
```json
{
  "query_id": 1,
  "feedback_type": "HELPFUL",
  "rating": 5,
  "comment": "Very helpful answer!"
}
```

**Expected Response (201):**
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": 1,
    "query": 1,
    "feedback_type": "HELPFUL",
    "rating": 5,
    "comment": "Very helpful answer!",
    "created_at": "2024-01-20T11:10:00Z"
  }
}
```

### Test 5.2: Report Hallucination

```bash
curl -X POST http://localhost:8000/api/retrieval/feedback/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query_id": 1,
    "feedback_type": "HALLUCINATION",
    "comment": "The answer included information not in the document",
    "hallucinated_text": "specific text that was hallucinated"
  }'
```

### Test 5.3: List Feedback (Admin/Reviewer Only)

```bash
curl -X GET http://localhost:8000/api/retrieval/feedback/list/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📈 Test 6: Analytics

### Test 6.1: User Analytics

**cURL:**
```bash
curl -X GET http://localhost:8000/api/analytics/me/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "queries": {
    "total": 2,
    "today": 2,
    "remaining_today": 98
  },
  "tokens_used": 245,
  "feedback_given": 2,
  "recent_queries": [...]
}
```

### Test 6.2: System Stats (Admin Only)

```bash
curl -X GET http://localhost:8000/api/analytics/stats/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "documents": {
    "total": 1,
    "approved": 1,
    "pending": 0
  },
  "queries": {
    "total": 2,
    "successful": 1,
    "failed": 1,
    "success_rate": 50.0
  },
  "tokens": {
    "total_used": 245
  },
  "users": {
    "total_active": 2
  }
}
```

---

## 🔍 Test 7: Audit Logs (Admin Only)

```bash
curl -X GET http://localhost:8000/api/audit/logs/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": 10,
      "user_username": "testuser",
      "action": "FEEDBACK_SUBMITTED",
      "resource_type": "Feedback",
      "resource_id": 2,
      "timestamp": "2024-01-20T11:10:00Z"
    },
    {
      "id": 9,
      "user_username": "testuser",
      "action": "QUERY_EXECUTED",
      "resource_type": "Query",
      "resource_id": 2,
      "details": {
        "question_preview": "What is the company vacation policy?",
        "tokens_used": 0
      },
      "timestamp": "2024-01-20T11:07:00Z"
    }
  ]
}
```

---

## ✅ Complete Test Checklist

Mark each as complete:

**Authentication:**
- [ ] Register new user (201 response)
- [ ] Login (get JWT token)
- [ ] Get profile (user data returned)

**Documents:**
- [ ] Upload document (201 response)
- [ ] Check processing status (READY)
- [ ] Approve document (status → APPROVED)
- [ ] List documents

**Queries:**
- [ ] Ask question with results (sources returned)
- [ ] Ask question without results (no docs message)
- [ ] View query history

**Feedback:**
- [ ] Submit helpful feedback
- [ ] Submit hallucination report
- [ ] View feedback list (admin)

**Analytics:**
- [ ] View user analytics
- [ ] View system stats (admin)

**Audit:**
- [ ] View audit logs (admin)

---

## 🎉 All Tests Passing?

If you completed all tests successfully:
- ✅ Backend is fully functional!
- ✅ All core features working
- ✅ Ready for real use or frontend development

**Next Step**: [08_GITHUB_UPLOAD.md](./08_GITHUB_UPLOAD.md) - Upload to GitHub

---

## 🐛 Common Issues

See [09_TROUBLESHOOTING.md](./09_TROUBLESHOOTING.md) for detailed solutions.

**Quick fixes:**
- 401 Unauthorized → Check Bearer token is correct
- 403 Forbidden → User doesn't have permission (check role)
- 500 Server Error → Check Django logs, Celery worker
- Processing stuck → Restart Celery worker
