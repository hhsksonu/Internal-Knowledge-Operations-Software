# 03 - Database Configuration (PostgreSQL)

**Goal**: Create and configure the PostgreSQL database with pgvector extension.

**Time**: 15-20 minutes

---

## 🗄️ What We'll Do

1. Access PostgreSQL
2. Create database
3. Create user (if needed)
4. Enable pgvector extension
5. Verify connection from Django

---

## 📍 Step 1: Access PostgreSQL

### 🪟 Windows

**Option 1: Using pgAdmin (GUI)**
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to local server (password: what you set during installation)
3. Skip to Step 2

**Option 2: Using psql (Command Line)**
```bash
# Open Command Prompt as Administrator
# Find psql in: C:\Program Files\PostgreSQL\14\bin\

# Add to PATH or navigate there
cd "C:\Program Files\PostgreSQL\14\bin"

# Connect to PostgreSQL
psql -U postgres

# Enter your postgres password when prompted
```

### 🍎 macOS

```bash
# Connect to PostgreSQL
psql postgres

# Or if you need to specify user:
psql -U postgres
```

### 🐧 Linux

```bash
# Switch to postgres user
sudo -u postgres psql

# Or connect directly
psql -U postgres
```

**You should see:**
```
psql (14.x)
Type "help" for help.

postgres=#
```

---

## 🏗️ Step 2: Create Database

Now you're in the PostgreSQL shell. Let's create the database.

### 2.1 Create the Database

```sql
-- Create database
CREATE DATABASE knowledge_platform;

-- Verify it was created
\l

-- You should see knowledge_platform in the list
```

**Expected output:**
```
                                  List of databases
        Name         |  Owner   | Encoding |   Collate   |    Ctype    
---------------------+----------+----------+-------------+-------------
 knowledge_platform  | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8
 postgres            | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8
```

### 2.2 Connect to the Database

```sql
-- Connect to your new database
\c knowledge_platform

-- You should see:
-- You are now connected to database "knowledge_platform" as user "postgres".
```

---

## 🔌 Step 3: Enable pgvector Extension

This extension allows us to store and search vectors (embeddings).

### 3.1 Create the Extension

```sql
-- Create pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify it was created
\dx

-- You should see 'vector' in the list
```

**Expected output:**
```
                                     List of installed extensions
  Name   | Version |   Schema   |                         Description
---------+---------+------------+-------------------------------------------------------------
 plpgsql | 1.0     | pg_catalog | PL/pgSQL procedural language
 vector  | 0.5.1   | public     | vector data type and ivfflat and hnsw access methods
```

### 3.2 Test Vector Extension

```sql
-- Test creating a vector
SELECT '[1,2,3]'::vector;

-- Should return: [1,2,3]
-- If this works, pgvector is installed correctly!
```

---

## 👤 Step 4: Create Database User (Optional)

If you want a dedicated user instead of using 'postgres':

```sql
-- Create user
CREATE USER django_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE knowledge_platform TO django_user;

-- Connect to database
\c knowledge_platform

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO django_user;

-- Grant table privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO django_user;
```

**Note:** For local development, using 'postgres' user is fine.

---

## 🧪 Step 5: Verify Database Configuration

### 5.1 Check Database Settings

```sql
-- Show database encoding
SHOW SERVER_ENCODING;
-- Should be: UTF8

-- Show timezone
SHOW TIMEZONE;
-- Should be: UTC or your timezone

-- List all databases
\l

-- Exit psql
\q
```

---

## 🔗 Step 6: Test Connection from Django

Now let's make sure Django can connect to the database.

### 6.1 Navigate to Backend Folder

```bash
# Make sure you're in backend folder
cd path/to/your-main-project-folder/backend

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

### 6.2 Create .env File (Temporarily)

We'll do this properly in the next guide, but let's test the connection first.

**Create a file named `.env` in the `backend/` folder:**

```bash
# Database Configuration
DB_NAME=knowledge_platform
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_HOST=localhost
DB_PORT=5432

# Django
SECRET_KEY=temporary-secret-key-for-testing
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Redis
REDIS_URL=redis://localhost:6379/0

# LLM (we'll configure this later)
LLM_API_KEY=dummy-key-for-now
```

**⚠️ IMPORTANT:** Replace `your_postgres_password_here` with your actual postgres password!

### 6.3 Test Database Connection

```bash
# Try connecting to the database through Django
python manage.py shell
```

If it works, you'll see:
```
Python 3.11.x (...)
Type "help", "copyright", "credits" or "license" for more information.
(InteractiveConsole)
>>>
```

**In the shell, type:**
```python
from django.db import connection
connection.ensure_connection()
print("✅ Database connection successful!")
exit()
```

**Expected output:**
```
✅ Database connection successful!
```

### 6.4 Check for Errors

**If you see an error:**

```
django.db.utils.OperationalError: could not connect to server
```

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   # Windows (Services):
   # Open Services (Win+R → services.msc)
   # Find "postgresql-x64-14" and make sure it's "Running"
   
   # macOS:
   brew services list
   # Should show postgresql@14 as "started"
   
   # Linux:
   sudo systemctl status postgresql
   # Should show "active (running)"
   ```

2. **Verify database credentials in .env:**
   - Check DB_NAME, DB_USER, DB_PASSWORD
   - Make sure password has no special characters that need escaping

3. **Check PostgreSQL is listening:**
   ```bash
   # Try connecting directly
   psql -U postgres -d knowledge_platform -h localhost
   ```

---

## 🐳 Alternative: Using Docker

If you're having trouble with local PostgreSQL, use Docker instead:

### Docker Setup (Easier!)

```bash
# Make sure Docker is installed and running
docker --version

# Start PostgreSQL with pgvector
docker run -d \
  --name postgres-knowledge \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=knowledge_platform \
  -p 5432:5432 \
  ankane/pgvector:latest

# Wait 10 seconds for it to start
# Test connection
docker exec -it postgres-knowledge psql -U postgres -d knowledge_platform

# You should see PostgreSQL prompt
# Type \q to exit
```

**Then in your .env:**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=knowledge_platform
DB_USER=postgres
DB_PASSWORD=postgres
```

---

## ✅ Verification Checklist

Before proceeding, verify:

- [ ] PostgreSQL is installed and running
- [ ] Database `knowledge_platform` exists
- [ ] pgvector extension is enabled (test: `SELECT '[1,2,3]'::vector;`)
- [ ] `.env` file created with correct database credentials
- [ ] Django can connect to database (python manage.py shell works)
- [ ] No connection errors

---

## 📊 Quick Reference: Database Info

**Save this information - you'll need it!**

```
Database Name: knowledge_platform
Username: postgres (or your custom user)
Password: [your password]
Host: localhost
Port: 5432
```

---

## 🎉 Database Setup Complete!

Your PostgreSQL database is ready with pgvector extension!

**Next Step**: [04_ENVIRONMENT_CONFIG.md](./04_ENVIRONMENT_CONFIG.md) - Properly configure environment variables

---

## 🔧 Troubleshooting

### Issue: "psql: command not found"

**Windows:**
```bash
# Add PostgreSQL bin to PATH
# Go to: System Properties → Environment Variables → Path
# Add: C:\Program Files\PostgreSQL\14\bin
```

**macOS:**
```bash
# Add to ~/.zshrc or ~/.bash_profile
export PATH="/usr/local/opt/postgresql@14/bin:$PATH"
source ~/.zshrc
```

**Linux:**
```bash
sudo apt install postgresql-client
```

### Issue: "FATAL: password authentication failed"

**Solution:**
```bash
# Reset postgres password
sudo -u postgres psql

# In psql:
ALTER USER postgres WITH PASSWORD 'new_password';
\q

# Update .env with new password
```

### Issue: "extension "vector" does not exist"

**Solution:**
```bash
# Reinstall pgvector

# macOS:
brew install pgvector

# Linux:
sudo apt install postgresql-14-pgvector

# Then reconnect and try:
CREATE EXTENSION vector;
```

### Issue: "could not connect to server: Connection refused"

**Solution:**
```bash
# Start PostgreSQL

# Windows:
# Services → postgresql-x64-14 → Start

# macOS:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Issue: "peer authentication failed"

**Solution:**
Edit `pg_hba.conf`:

```bash
# Find the file:
# Windows: C:\Program Files\PostgreSQL\14\data\pg_hba.conf
# macOS: /usr/local/var/postgresql@14/pg_hba.conf
# Linux: /etc/postgresql/14/main/pg_hba.conf

# Change this line:
# local   all   postgres   peer
# To:
local   all   postgres   md5

# Restart PostgreSQL
```

---

**Database ready?** Let's configure the environment! → [04_ENVIRONMENT_CONFIG.md](./04_ENVIRONMENT_CONFIG.md)
