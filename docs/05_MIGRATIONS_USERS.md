# 05 - Running Migrations & Creating Users

**Goal**: Create database tables and set up your first admin user.

**Time**: 10 minutes

---

## 🗂️ What are Migrations?

Migrations are Python files that tell PostgreSQL what tables to create. They're generated from your Django models.

**Think of it like:**
- Models = Blueprint of what data looks like
- Migrations = Construction instructions for database
- migrate command = Build the database tables

---

## 📊 Step 1: Create Migration Files

### 1.1 Navigate and Activate Environment

```bash
# Go to backend folder
cd path/to/your-main-project-folder/backend

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Verify you see (venv) in your prompt
```

### 1.2 Make Migrations

This command creates migration files from your models.

```bash
python manage.py makemigrations
```

**Expected output:**
```
Migrations for 'core':
  apps/core/migrations/0001_initial.py
    - Create model User
Migrations for 'documents':
  apps/documents/migrations/0001_initial.py
    - Create model Document
    - Create model DocumentVersion
    - Create model DocumentChunk
Migrations for 'retrieval':
  apps/retrieval/migrations/0001_initial.py
    - Create model Query
    - Create model QuerySource
    - Create model Feedback
Migrations for 'audit':
  apps/audit/migrations/0001_initial.py
    - Create model AuditLog
```

**What just happened?**
- Django looked at all your models
- Created Python files describing how to build database tables
- These files are in `apps/*/migrations/` folders

### 1.3 Check Generated Migrations

```bash
# List migration files
# Windows:
dir apps\core\migrations\

# macOS/Linux:
ls apps/core/migrations/

# You should see:
# 0001_initial.py
# __init__.py
```

---

## 🔨 Step 2: Apply Migrations

Now we actually create the database tables.

### 2.1 Run Migrate Command

```bash
python manage.py migrate
```

**Expected output (this will take 10-30 seconds):**
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, core, documents, retrieval, audit, django_celery_results, django_celery_beat
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0001_initial... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  ...
  Applying core.0001_initial... OK
  Applying documents.0001_initial... OK
  Applying retrieval.0001_initial... OK
  Applying audit.0001_initial... OK
  ...
  Applying sessions.0001_initial... OK

Total: 35 migrations applied
```

**What just happened?**
- Django created all database tables
- Created indexes for faster queries
- Set up relationships between tables
- Enabled vector extension features

### 2.2 Verify Tables Were Created

**Option 1: Using Django Shell**
```bash
python manage.py shell
```

```python
# In the shell:
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname='public'")
tables = cursor.fetchall()
for table in tables:
    print(table[0])
exit()
```

**Expected output:**
```
users
documents
document_versions
document_chunks
queries
query_sources
feedback
audit_logs
...
```

**Option 2: Using psql**
```bash
# Connect to database
psql -U postgres -d knowledge_platform

# List tables
\dt

# You should see all your tables
# Type \q to exit
```

---

## 👤 Step 3: Create Superuser (Admin)

Now let's create your first user - an admin account.

### 3.1 Run createsuperuser Command

```bash
python manage.py createsuperuser
```

### 3.2 Follow the Prompts

```
Username (leave blank to use 'yourname'): admin
Email address: admin@example.com
Password: 
Password (again): 
```

**Tips for password:**
- Must be at least 8 characters
- Can't be too similar to username
- Can't be entirely numeric
- Should be strong for production!

**For testing, you can use something simple like:**
- Username: `admin`
- Email: `admin@test.com`
- Password: `admin123!` (must include special character)

**Expected output:**
```
Superuser created successfully.
```

### 3.3 Verify User Was Created

```bash
python manage.py shell
```

```python
from apps.core.models import User

# Check user exists
user = User.objects.get(username='admin')
print(f"User: {user.username}")
print(f"Email: {user.email}")
print(f"Is superuser: {user.is_superuser}")
print(f"Role: {user.role}")

exit()
```

**Expected output:**
```
User: admin
Email: admin@test.com
Is superuser: True
Role: ADMIN
```

---

## 🔄 Step 4: Create Additional Test Users (Optional)

Let's create different types of users for testing.

### 4.1 Create Users via Django Shell

```bash
python manage.py shell
```

```python
from apps.core.models import User, UserRole

# Create Content Owner
content_owner = User.objects.create_user(
    username='content_owner',
    email='owner@test.com',
    password='owner123!',
    first_name='Content',
    last_name='Owner',
    role=UserRole.CONTENT_OWNER
)
print(f"✅ Created: {content_owner.username}")

# Create Employee
employee = User.objects.create_user(
    username='employee',
    email='employee@test.com',
    password='employee123!',
    first_name='Test',
    last_name='Employee',
    role=UserRole.EMPLOYEE
)
print(f"✅ Created: {employee.username}")

# Create Reviewer
reviewer = User.objects.create_user(
    username='reviewer',
    email='reviewer@test.com',
    password='reviewer123!',
    first_name='Test',
    last_name='Reviewer',
    role=UserRole.REVIEWER
)
print(f"✅ Created: {reviewer.username}")

print("\n📊 Total users:", User.objects.count())

exit()
```

**Expected output:**
```
✅ Created: content_owner
✅ Created: employee
✅ Created: reviewer

📊 Total users: 4
```

---

## 🧪 Step 5: Verify Everything Works

### 5.1 Check Database Schema

```bash
python manage.py showmigrations
```

**Expected output (all should have [X]):**
```
admin
 [X] 0001_initial
 [X] 0002_logentry_remove_auto_add
auth
 [X] 0001_initial
 [X] 0002_alter_permission_name_max_length
...
core
 [X] 0001_initial
documents
 [X] 0001_initial
retrieval
 [X] 0001_initial
audit
 [X] 0001_initial
```

### 5.2 Check pgvector Extension

```bash
python manage.py shell
```

```python
from django.db import connection

with connection.cursor() as cursor:
    # Test vector type
    cursor.execute("SELECT '[1,2,3]'::vector")
    result = cursor.fetchone()
    print("Vector test:", result[0])
    
    # Check extension is installed
    cursor.execute("SELECT extname FROM pg_extension WHERE extname='vector'")
    result = cursor.fetchone()
    print("pgvector installed:", result is not None)

exit()
```

**Expected output:**
```
Vector test: [1,2,3]
pgvector installed: True
```

---

## 📝 Step 6: Understand the Database Structure

### 6.1 Key Tables Created

**User Management:**
- `users` - User accounts with roles and quotas

**Document Management:**
- `documents` - Main document entities
- `document_versions` - Version tracking
- `document_chunks` - Text chunks with embeddings (vectors)

**RAG System:**
- `queries` - User questions and answers
- `query_sources` - Links queries to document chunks
- `feedback` - User feedback on answers

**Monitoring:**
- `audit_logs` - Action tracking

### 6.2 View Table Structure

```bash
python manage.py dbshell
```

```sql
-- Describe users table
\d users

-- Describe document_chunks table (with vectors)
\d document_chunks

-- Count records
SELECT COUNT(*) FROM users;

-- Exit
\q
```

---

## ✅ Verification Checklist

- [ ] Migrations created (`makemigrations` succeeded)
- [ ] All migrations applied (`migrate` succeeded)
- [ ] All tables exist in database
- [ ] pgvector extension working
- [ ] Superuser created (admin account)
- [ ] Can log into Django shell
- [ ] No error messages

---

## 🎉 Database is Ready!

Your database now has:
- ✅ All tables created
- ✅ Indexes for performance
- ✅ Vector capabilities enabled
- ✅ Admin user created
- ✅ Ready for data!

**Next Step**: [06_STARTING_SERVER.md](./06_STARTING_SERVER.md) - Start Django and Celery servers

---

## 🔧 Troubleshooting

### Issue: "No such table: users"

This means migrations weren't applied.

**Solution:**
```bash
# Check which migrations need to run
python manage.py showmigrations

# If you see [ ] (empty), run:
python manage.py migrate
```

### Issue: "relation 'users' already exists"

You're trying to run migrations twice.

**Solution:**
```bash
# Mark migrations as applied
python manage.py migrate --fake

# Or drop and recreate database:
# WARNING: This deletes all data!
psql -U postgres
DROP DATABASE knowledge_platform;
CREATE DATABASE knowledge_platform;
\c knowledge_platform
CREATE EXTENSION vector;
\q

# Then run migrations again
python manage.py migrate
```

### Issue: "could not create extension 'vector'"

pgvector not installed properly.

**Solution:**
```bash
# macOS:
brew install pgvector
brew services restart postgresql@14

# Linux:
sudo apt install postgresql-14-pgvector
sudo systemctl restart postgresql

# Then:
psql -U postgres -d knowledge_platform
CREATE EXTENSION vector;
\q
```

### Issue: "django.db.utils.OperationalError: FATAL: role 'postgres' does not exist"

PostgreSQL user not set up.

**Solution:**
```bash
# Create postgres user
sudo -u postgres createuser --superuser postgres
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'your_password';
\q

# Update .env with correct password
```

### Issue: "This password is too common"

Django password validation is strict.

**Solutions:**
```bash
# Option 1: Use a stronger password
# Include: uppercase, lowercase, numbers, special chars
# Example: Admin@2024!

# Option 2: Skip validation (TESTING ONLY)
python manage.py createsuperuser --skip-checks
```

### Issue: Migrations out of sync

**Solution:**
```bash
# Check current state
python manage.py showmigrations

# If migrations show as applied but tables don't exist:
# Reset migrations (WARNING: Deletes all data)
python manage.py migrate --fake core zero
python manage.py migrate core

# Repeat for other apps if needed
```

---

**Database ready with users?** Let's start the servers! → [06_STARTING_SERVER.md](./06_STARTING_SERVER.md)
