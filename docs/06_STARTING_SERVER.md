# 06 - Starting the Server

**Goal**: Start Django development server and Celery worker.

**Time**: 10 minutes

---

## 🖥️ What We'll Start

You need **THREE** running processes:
1. **Django Server** - Handles API requests
2. **Celery Worker** - Processes documents in background
3. **Redis** - Message broker (should already be running)

---

## 🔧 Step 1: Verify Prerequisites

### 1.1 Check Redis is Running

**macOS/Linux:**
```bash
redis-cli ping

# Should return: PONG
```

**Windows (if using Docker):**
```bash
docker ps | grep redis

# Should show running redis container
```

**If Redis isn't running:**

```bash
# macOS:
brew services start redis

# Linux:
sudo systemctl start redis-server

# Windows (Docker):
docker start redis
```

### 1.2 Verify Database is Ready

```bash
# Make sure you're in backend folder
cd path/to/your-main-project-folder/backend

# Activate venv
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows

# Test database connection
python manage.py check --database default

# Should show: System check identified no issues (0 silenced).
```

---

## 🚀 Step 2: Start Django Development Server

### 2.1 Open First Terminal

```bash
# Navigate to backend
cd path/to/your-main-project-folder/backend

# Activate virtual environment
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows

# You should see (venv) in your prompt
```

### 2.2 Start Django Server

```bash
python manage.py runserver
```

**Expected output:**
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
February 10, 2026 - 10:30:00
Django version 4.2.9, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

**✅ Success indicators:**
- "Starting development server at http://127.0.0.1:8000/"
- No error messages
- Server is running (terminal is blocked waiting)

### 2.3 Test Server is Running

**Open a browser and go to:**
```
http://localhost:8000/admin/
```

**You should see:** Django admin login page

**If you see an error page with Django branding** - that's actually good! It means Django is running but you're hitting a route that doesn't exist.

---

## ⚙️ Step 3: Start Celery Worker

### 3.1 Open SECOND Terminal

**Important:** Keep the Django server running! Open a NEW terminal.

```bash
# Navigate to backend
cd path/to/your-main-project-folder/backend

# Activate virtual environment
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows
```

### 3.2 Start Celery Worker

**macOS/Linux:**
```bash
celery -A config worker -l info
```

**Windows:**
```bash
# Windows requires this special flag:
celery -A config worker -l info --pool=solo
```

**Expected output:**
```
 -------------- celery@hostname v5.3.6 (emerald-rush)
--- ***** ----- 
-- ******* ---- Linux-5.15.0-x86_64-with-glibc2.35 2024-02-10 10:35:00
- *** --- * --- 
- ** ---------- [config]
- ** ---------- .> app:         knowledge_platform:0x...
- ** ---------- .> transport:   redis://localhost:6379/0
- ** ---------- .> results:     django-db
- *** --- * --- .> concurrency: 8 (prefork)
-- ******* ---- .> task events: OFF
--- ***** ----- 
 -------------- [queues]
                .> celery           exchange=celery(direct) key=celery

[tasks]
  . apps.documents.tasks.process_document_task
  . apps.documents.tasks.cleanup_failed_uploads

[2024-02-10 10:35:00,000: INFO/MainProcess] Connected to redis://localhost:6379/0
[2024-02-10 10:35:00,000: INFO/MainProcess] mingle: searching for neighbors
[2024-02-10 10:35:01,000: INFO/MainProcess] mingle: all alone
[2024-02-10 10:35:01,000: INFO/MainProcess] celery@hostname ready.
```

**✅ Success indicators:**
- "celery@hostname ready."
- Lists your tasks under [tasks]
- "Connected to redis://..."
- No error messages

---

## 🎯 Step 4: Verify Everything is Running

### 4.1 Check All Processes

You should now have **3 terminals open:**

**Terminal 1:** Django server
```
Starting development server at http://127.0.0.1:8000/
```

**Terminal 2:** Celery worker
```
celery@hostname ready.
```

**Terminal 3:** Free terminal for commands/testing

### 4.2 Quick Health Check

In your **third terminal**:

```bash
# Activate venv
source venv/bin/activate

# Test Django
curl http://localhost:8000/api/auth/profile/
# Should return: {"detail":"Authentication credentials were not provided."}
# This is GOOD - it means the API is working!

# Test Redis
redis-cli ping
# Should return: PONG

# Test Celery
python manage.py shell
```

In the shell:
```python
from apps.documents.tasks import process_document_task
# If no error, Celery tasks are loaded
print("✅ All systems operational!")
exit()
```

---

## 🔄 Step 5: Understanding the Workflow

### 5.1 Request Flow

```
User uploads document via API
    ↓
Django receives request (Terminal 1)
    ↓
Creates document in database
    ↓
Sends task to Redis queue
    ↓
Celery worker picks up task (Terminal 2)
    ↓
Processes document in background
    ↓
Updates database when done
    ↓
User can query the document
```

### 5.2 What Each Component Does

**Django Server (Port 8000):**
- Handles HTTP requests
- Manages database operations
- Serves API endpoints
- Returns responses to users

**Celery Worker:**
- Processes background tasks
- Text extraction from files
- Chunking and embedding
- Retries failed tasks

**Redis:**
- Message queue
- Stores pending tasks
- Coordinates between Django and Celery

---

## 🛑 Step 6: Stopping the Servers

### 6.1 Stop Django Server

In Terminal 1 (Django):
```
Press: Ctrl + C
```

**Expected output:**
```
^C
Quit the server with CONTROL-C.
```

### 6.2 Stop Celery Worker

In Terminal 2 (Celery):
```
Press: Ctrl + C
```

**Expected output:**
```
^C
worker: Warm shutdown (MainProcess)
```

### 6.3 Clean Shutdown

**Always stop gracefully:**
1. Ctrl+C in Django terminal
2. Ctrl+C in Celery terminal
3. Wait for "shutdown" messages

**Never:** Kill terminal windows without stopping servers!

---

## 🔁 Step 7: Restarting Servers

### 7.1 Quick Restart Script

**Create a file:** `start.sh` (macOS/Linux) or `start.bat` (Windows)

**start.sh:**
```bash
#!/bin/bash
source venv/bin/activate
python manage.py runserver
```

**start_celery.sh:**
```bash
#!/bin/bash
source venv/bin/activate
celery -A config worker -l info
```

**Make executable:**
```bash
chmod +x start.sh start_celery.sh
```

**Usage:**
```bash
# Terminal 1
./start.sh

# Terminal 2
./start_celery.sh
```

### 7.2 VS Code Multi-Terminal Setup

If using VS Code:

1. Open integrated terminal (Ctrl+`)
2. Click the split terminal icon (`+` with split)
3. Now you have multiple terminals in one window!
4. Run Django in terminal 1, Celery in terminal 2

---

## 📊 Step 8: Monitoring Logs

### 8.1 Django Logs

Watch Django terminal for:
```
[10/Feb/2026 10:45:00] "POST /api/auth/login/ HTTP/1.1" 200 512
[10/Feb/2026 10:45:15] "GET /api/documents/ HTTP/1.1" 200 1024
[10/Feb/2026 10:45:30] "POST /api/documents/upload/ HTTP/1.1" 201 2048
```

**What to look for:**
- Status codes (200 = OK, 201 = Created, 401 = Unauthorized, 500 = Error)
- Request path
- Response time

### 8.2 Celery Logs

Watch Celery terminal for:
```
[2024-02-10 10:45:05,000: INFO/MainProcess] Task apps.documents.tasks.process_document_task[abc-123] received
[2024-02-10 10:45:10,000: INFO/ForkPoolWorker-1] Task apps.documents.tasks.process_document_task[abc-123] succeeded in 5.2s
```

**What to look for:**
- "received" = Task started
- "succeeded" = Task completed
- "failed" = Task error (check full logs)

---

## 🚀 Production Deployment (Future)

**For production, you'll use:**

Instead of `runserver`:
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

Instead of development Celery:
```bash
celery -A config worker -l info --concurrency=4 --max-tasks-per-child=1000
```

Plus:
- Nginx (reverse proxy)
- Supervisor (process manager)
- Docker (containerization)

---

## ✅ Verification Checklist

- [ ] Redis is running (ping returns PONG)
- [ ] Django server started (Terminal 1)
- [ ] Server accessible at http://localhost:8000
- [ ] Celery worker started (Terminal 2)
- [ ] Celery shows "ready"
- [ ] No error messages in either terminal
- [ ] Can make API requests

---

## 🎉 Servers Running!

Your backend is now fully operational!

**You can now:**
- Make API requests
- Upload documents
- Process documents asynchronously
- Query with RAG
- Test all features

**Next Step**: [07_TESTING_FUNCTIONS.md](./07_TESTING_FUNCTIONS.md) - Test all API endpoints

---

## 🐛 Troubleshooting

### Issue: "Port already in use"

```
Error: That port is already in use.
```

**Solution:**

```bash
# Find what's using port 8000
# macOS/Linux:
lsof -i :8000

# Windows:
netstat -ano | findstr :8000

# Kill the process or use different port:
python manage.py runserver 8001
```

### Issue: Celery can't connect to Redis

```
Error: Error 111 connecting to localhost:6379. Connection refused.
```

**Solution:**
```bash
# Make sure Redis is running
redis-cli ping

# If not, start it:
# macOS:
brew services start redis

# Linux:
sudo systemctl start redis-server

# Windows (Docker):
docker start redis
```

### Issue: "No module named 'config'"

**Solution:**
```bash
# Make sure you're in the backend directory
pwd                    # Should show: .../backend

# Make sure venv is activated
# You should see (venv) in prompt

# If not:
source venv/bin/activate    # macOS/Linux
venv\Scripts\activate       # Windows
```

### Issue: Database connection error

```
django.db.utils.OperationalError: could not connect to server
```

**Solution:**
```bash
# Check PostgreSQL is running
# macOS:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# Check .env has correct credentials
cat .env | grep DB_

# Test connection manually:
psql -U postgres -d knowledge_platform
```

### Issue: Celery task errors

**Check Celery logs carefully:**
```
[ERROR/ForkPoolWorker-1] Task failed: ...
```

**Common fixes:**
1. Restart Celery worker
2. Check file paths in uploaded documents
3. Verify LLM API key if using real embeddings
4. Check Celery log files in backend/logs/

---

**Servers running smoothly?** Time to test! → [07_TESTING_FUNCTIONS.md](./07_TESTING_FUNCTIONS.md)
