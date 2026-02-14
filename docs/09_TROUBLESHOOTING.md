# 09 - Troubleshooting Common Issues

**Goal**: Solve common problems you might encounter.

**Use this guide when**: Something isn't working and you don't know why.

---

## 🔍 How to Use This Guide

1. Find your problem category below
2. Try the solutions in order
3. Check if the issue is resolved
4. If not, move to next solution

---

## 📋 Table of Contents

1. [Installation Issues](#installation-issues)
2. [Database Problems](#database-problems)
3. [Server Won't Start](#server-wont-start)
4. [API Errors](#api-errors)
5. [Document Processing Issues](#document-processing-issues)
6. [Authentication Problems](#authentication-problems)
7. [Celery/Redis Issues](#celeryredis-issues)
8. [Git/GitHub Problems](#gitgithub-problems)
9. [Performance Issues](#performance-issues)
10. [General Debugging Tips](#general-debugging-tips)

---

## 🔧 Installation Issues

### Problem: `pip install` fails

**Error:**
```
ERROR: Could not install packages due to an OSError
```

**Solutions:**

1. **Check you're in venv:**
   ```bash
   # You should see (venv) in prompt
   # If not:
   source venv/bin/activate    # macOS/Linux
   venv\Scripts\activate       # Windows
   ```

2. **Upgrade pip:**
   ```bash
   python -m pip install --upgrade pip
   ```

3. **Install with --user flag:**
   ```bash
   pip install --user -r requirements.txt
   ```

4. **Missing compiler (for psycopg2):**
   ```bash
   # Windows: Install Visual C++ Build Tools
   # https://visualstudio.microsoft.com/downloads/
   
   # macOS:
   xcode-select --install
   
   # Linux:
   sudo apt-get install build-essential python3-dev libpq-dev
   
   # Or use binary version:
   pip install psycopg2-binary
   ```

### Problem: Python version too old

**Error:**
```
Python 3.9 is required, but you have Python 3.7
```

**Solution:**
```bash
# Check current version
python --version

# Install newer Python
# macOS:
brew install python@3.11

# Linux:
sudo apt install python3.11 python3.11-venv

# Windows: Download from python.org

# Create venv with specific version:
python3.11 -m venv venv
```

### Problem: Command not found

**Error:**
```
bash: python: command not found
```

**Solutions:**
```bash
# Try python3 instead
python3 --version

# macOS - Add to PATH:
echo 'export PATH="/usr/local/opt/python/libexec/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Windows - Reinstall Python with "Add to PATH" checked
```

---

## 🗄️ Database Problems

### Problem: Can't connect to PostgreSQL

**Error:**
```
django.db.utils.OperationalError: could not connect to server
```

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   # macOS:
   brew services list | grep postgresql
   # Should show "started"
   
   # Linux:
   sudo systemctl status postgresql
   # Should show "active (running)"
   
   # Windows: Check Services
   # Win+R → services.msc → find postgresql
   ```

2. **Start PostgreSQL:**
   ```bash
   # macOS:
   brew services start postgresql@14
   
   # Linux:
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Windows: Start from Services
   ```

3. **Check connection details in .env:**
   ```bash
   cat .env | grep DB_
   
   # Verify:
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_USER=postgres
   # DB_PASSWORD=your_password
   ```

4. **Test connection manually:**
   ```bash
   psql -U postgres -h localhost -d knowledge_platform
   # If this fails, issue is with PostgreSQL, not Django
   ```

### Problem: pgvector extension missing

**Error:**
```
django.db.utils.ProgrammingError: type "vector" does not exist
```

**Solution:**
```bash
# Connect to database
psql -U postgres -d knowledge_platform

# Create extension
CREATE EXTENSION IF NOT EXISTS vector;

# Verify
\dx
# Should show "vector" in list

\q

# Retry migrations
python manage.py migrate
```

### Problem: Database exists but tables missing

**Error:**
```
relation "users" does not exist
```

**Solution:**
```bash
# Run migrations
python manage.py migrate

# If that fails, check migration status
python manage.py showmigrations

# If migrations show [ ] (unapplied):
python manage.py migrate

# If migrations show [X] but tables still missing:
# Drop and recreate database (WARNING: loses data!)
psql -U postgres
DROP DATABASE knowledge_platform;
CREATE DATABASE knowledge_platform;
\c knowledge_platform
CREATE EXTENSION vector;
\q

python manage.py migrate
```

### Problem: Authentication failed for user

**Error:**
```
FATAL: password authentication failed for user "postgres"
```

**Solutions:**

1. **Reset postgres password:**
   ```bash
   sudo -u postgres psql
   ALTER USER postgres WITH PASSWORD 'newpassword';
   \q
   
   # Update .env
   DB_PASSWORD=newpassword
   ```

2. **Check pg_hba.conf:**
   ```bash
   # Find the file:
   # macOS: /usr/local/var/postgresql@14/pg_hba.conf
   # Linux: /etc/postgresql/14/main/pg_hba.conf
   # Windows: C:\Program Files\PostgreSQL\14\data\pg_hba.conf
   
   # Change:
   # local   all   postgres   peer
   # To:
   local   all   postgres   md5
   
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

---

## 🚀 Server Won't Start

### Problem: Port already in use

**Error:**
```
Error: That port is already in use.
```

**Solutions:**

1. **Find what's using the port:**
   ```bash
   # macOS/Linux:
   lsof -i :8000
   # Shows PID (process ID)
   
   # Kill that process:
   kill -9 PID
   
   # Windows:
   netstat -ano | findstr :8000
   # Shows PID in last column
   
   # Kill:
   taskkill /PID PID /F
   ```

2. **Use different port:**
   ```bash
   python manage.py runserver 8001
   ```

3. **Stop existing Django server:**
   ```bash
   # Find Django processes
   ps aux | grep manage.py
   # Kill them
   kill -9 PID
   ```

### Problem: Module not found

**Error:**
```
ModuleNotFoundError: No module named 'rest_framework'
```

**Solutions:**

1. **Activate venv:**
   ```bash
   source venv/bin/activate
   # Make sure you see (venv)
   ```

2. **Reinstall packages:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Check Python interpreter:**
   ```bash
   which python    # macOS/Linux
   where python    # Windows
   
   # Should show path in venv/
   # If not, venv isn't activated
   ```

### Problem: SECRET_KEY error

**Error:**
```
django.core.exceptions.ImproperlyConfigured: The SECRET_KEY setting must not be empty.
```

**Solution:**
```bash
# Generate a secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Copy output to .env
# SECRET_KEY=the-generated-key-here
```

---

## 🔌 API Errors

### Problem: 401 Unauthorized

**Error:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Solutions:**

1. **Check Authorization header:**
   ```bash
   # cURL: Make sure you include:
   -H "Authorization: Bearer YOUR_TOKEN"
   
   # Postman: Check Authorization tab
   # Type: Bearer Token
   # Token: [paste your access token]
   ```

2. **Get fresh token:**
   ```bash
   # Login again
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "password"}'
   ```

3. **Check token isn't expired:**
   ```bash
   # Access tokens expire (default: 60 minutes)
   # Use refresh token to get new access token
   ```

### Problem: 403 Forbidden

**Error:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Solutions:**

1. **Check user role:**
   ```python
   python manage.py shell
   from apps.core.models import User
   user = User.objects.get(username='youruser')
   print(user.role)
   # Should be ADMIN for admin actions
   exit()
   ```

2. **Login with correct user:**
   ```bash
   # For admin actions, use admin account
   # For document approval, use CONTENT_OWNER or ADMIN
   ```

### Problem: 500 Internal Server Error

**Error:**
```json
{
  "error": "Internal Server Error"
}
```

**Solutions:**

1. **Check Django logs:**
   ```bash
   # Look at terminal where Django is running
   # Will show full error traceback
   ```

2. **Check logs file:**
   ```bash
   tail -50 logs/django.log
   ```

3. **Common causes:**
   - Database connection lost
   - Missing required field in request
   - Bug in code

---

## 📄 Document Processing Issues

### Problem: Document stuck in PROCESSING

**Symptom:** Document status never changes from PROCESSING to READY

**Solutions:**

1. **Check Celery worker is running:**
   ```bash
   # Should have terminal with Celery running
   # Look for "celery@hostname ready"
   ```

2. **Restart Celery:**
   ```bash
   # Stop Celery (Ctrl+C)
   # Start again:
   celery -A config worker -l info
   ```

3. **Check Celery logs:**
   ```bash
   # Look for errors in Celery terminal
   # Common issues:
   # - File not found
   # - Permission denied
   # - Embedding generation failed
   ```

4. **Check document status:**
   ```bash
   python manage.py shell
   from apps.documents.models import DocumentVersion
   v = DocumentVersion.objects.get(id=1)
   print(v.processing_status)
   print(v.error_message)
   exit()
   ```

5. **Manually trigger processing:**
   ```python
   python manage.py shell
   from apps.documents.tasks import process_document_task
   process_document_task.delay(1)  # Replace 1 with version_id
   exit()
   ```

### Problem: File upload fails

**Error:**
```json
{
  "file": ["File size exceeds 10MB limit."]
}
```

**Solutions:**

1. **Check file size:**
   ```bash
   # Increase limit in .env
   MAX_FILE_SIZE_MB=20
   ```

2. **Check file type:**
   ```bash
   # Only pdf, docx, txt allowed by default
   # Add more in .env:
   ALLOWED_FILE_TYPES=pdf,docx,txt,md
   ```

3. **Check file isn't corrupted:**
   ```bash
   # Try opening the file manually
   # If it won't open, Django can't process it either
   ```

### Problem: Text extraction fails

**Error in Celery logs:**
```
Error extracting text: Could not read PDF
```

**Solutions:**

1. **Check file format:**
   ```bash
   file your_document.pdf
   # Should say "PDF document"
   ```

2. **Try simpler document:**
   ```bash
   # Create test.txt with plain text
   # Upload that to verify system works
   ```

3. **Install missing dependencies:**
   ```bash
   pip install PyPDF2 python-docx python-magic
   ```

---

## 🔐 Authentication Problems

### Problem: Can't create superuser

**Error:**
```
This password is too common.
```

**Solutions:**

1. **Use stronger password:**
   ```bash
   # Include: uppercase, lowercase, numbers, special chars
   # Example: Admin@2024!Secure
   ```

2. **Skip validation (TESTING ONLY):**
   ```bash
   python manage.py createsuperuser --skip-checks
   ```

### Problem: Forgot admin password

**Solution:**
```bash
python manage.py shell

from apps.core.models import User
user = User.objects.get(username='admin')
user.set_password('NewPassword123!')
user.save()
print("Password updated!")
exit()
```

### Problem: Token refresh fails

**Error:**
```json
{
  "detail": "Token is invalid or expired"
}
```

**Solution:**
```bash
# Login again to get new tokens
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'
```

---

## ⚙️ Celery/Redis Issues

### Problem: Celery can't connect to Redis

**Error:**
```
Error 111 connecting to localhost:6379. Connection refused.
```

**Solutions:**

1. **Start Redis:**
   ```bash
   # macOS:
   brew services start redis
   
   # Linux:
   sudo systemctl start redis-server
   
   # Windows (Docker):
   docker start redis
   ```

2. **Test Redis:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

3. **Check REDIS_URL in .env:**
   ```bash
   cat .env | grep REDIS
   # Should be: redis://localhost:6379/0
   ```

### Problem: Tasks not being processed

**Symptom:** Documents stay in UPLOADED status forever

**Solutions:**

1. **Check Celery is running:**
   ```bash
   # Look for terminal with:
   # "celery@hostname ready."
   ```

2. **Check task is registered:**
   ```bash
   celery -A config inspect registered
   # Should show your tasks
   ```

3. **Flush Redis queue:**
   ```bash
   redis-cli
   FLUSHDB
   exit
   
   # Restart Celery
   ```

---

## 📚 Git/GitHub Problems

### Problem: Can't push to GitHub

**Error:**
```
Permission denied (publickey).
```

**Solution:**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/USERNAME/repo.git

# Or generate SSH key:
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add to GitHub: Settings → SSH Keys
```

### Problem: Accidentally committed .env

**URGENT FIX:**
```bash
# Remove from Git
git rm --cached .env

# Make sure it's in .gitignore
echo ".env" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "Remove .env from version control"
git push

# IMPORTANT: Rotate exposed secrets!
# - Generate new SECRET_KEY
# - Get new LLM API_KEY
# - Change database password
```

---

## ⚡ Performance Issues

### Problem: API responses very slow

**Solutions:**

1. **Check database indexes:**
   ```sql
   psql -U postgres -d knowledge_platform
   \d users
   # Should show indexes
   ```

2. **Enable query logging:**
   ```python
   # In settings.py, add:
   LOGGING['loggers']['django.db.backends'] = {
       'level': 'DEBUG'
   }
   # Check for slow queries
   ```

3. **Add database connection pooling:**
   ```bash
   pip install psycopg2-pool
   ```

### Problem: Celery tasks timing out

**Solution:**
```python
# In config/celery.py:
app.conf.task_time_limit = 30 * 60  # 30 minutes
```

---

## 🔍 General Debugging Tips

### Step 1: Read the Error Message

**Most errors tell you exactly what's wrong:**
```
AttributeError: 'NoneType' object has no attribute 'name'
  File "views.py", line 42, in get
    user.name
```

This tells you:
- What: AttributeError
- Where: views.py, line 42
- Why: user is None

### Step 2: Check Logs

**Django logs:**
- Terminal where Django is running
- `logs/django.log`

**Celery logs:**
- Terminal where Celery is running

**PostgreSQL logs:**
```bash
# macOS:
tail -f /usr/local/var/log/postgresql@14.log

# Linux:
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Step 3: Use Django Shell

```bash
python manage.py shell
```

```python
# Test imports
from apps.core.models import User

# Query database
User.objects.all()

# Test functions
from apps.documents.services import DocumentProcessingService
processor = DocumentProcessingService()
# Try methods...
```

### Step 4: Enable DEBUG mode

In `.env`:
```
DEBUG=True
```

**Restart server** - now you get detailed error pages!

### Step 5: Google the Error

**Tips:**
- Copy exact error message
- Include framework name: "django" or "celery"
- Check Stack Overflow
- Check GitHub issues

**Example search:**
```
django.db.utils.OperationalError could not connect to server postgresql
```

---

## 📞 Getting More Help

### Check Documentation

- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- Celery: https://docs.celeryproject.org/
- PostgreSQL: https://www.postgresql.org/docs/

### Community Resources

- Stack Overflow: https://stackoverflow.com/questions/tagged/django
- Django Forum: https://forum.djangoproject.com/
- Reddit: r/django

### Debug Checklist

Before asking for help, collect:
- [ ] Full error message
- [ ] What you were trying to do
- [ ] Steps to reproduce
- [ ] Django version (`python manage.py version`)
- [ ] Python version (`python --version`)
- [ ] Operating system
- [ ] Relevant code snippets
- [ ] Log files

---

## ✅ Still Stuck?

If you've tried everything:

1. **Restart everything:**
   ```bash
   # Stop Django (Ctrl+C)
   # Stop Celery (Ctrl+C)
   # Stop Redis
   # Stop PostgreSQL
   
   # Wait 10 seconds
   
   # Start PostgreSQL
   # Start Redis
   # Start Django
   # Start Celery
   ```

2. **Check requirements:**
   ```bash
   pip install -r requirements.txt --upgrade
   ```

3. **Fresh start (last resort):**
   ```bash
   # Backup your .env file!
   cp .env .env.backup
   
   # Recreate venv
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Recreate database
   # (See database troubleshooting section)
   ```

---

**Remember:** Most issues have been solved before. Read error messages carefully, search online, and don't give up! 🚀
