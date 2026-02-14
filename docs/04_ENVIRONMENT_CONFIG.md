# 04 - Environment Variables Configuration

**Goal**: Properly configure all environment variables for the application.

**Time**: 10-15 minutes

---

## 🔐 What are Environment Variables?

Environment variables store configuration that:
- ❌ Should NOT be in code (like passwords, API keys)
- ✅ Changes between environments (development vs production)
- 🔒 Needs to be kept secret

We use a `.env` file to store these.

---

## 📝 Step 1: Create .env File

### 1.1 Copy the Template

```bash
# Make sure you're in the backend folder
cd path/to/your-main-project-folder/backend

# Make sure venv is activated
# You should see (venv) in your prompt

# Copy the example file
# Windows:
copy .env.example .env

# macOS/Linux:
cp .env.example .env
```

### 1.2 Open .env in Your Editor

**Using VS Code:**
```bash
code .env
```

**Or open manually:**
- Navigate to `backend/` folder
- Open `.env` file in any text editor

---

## ⚙️ Step 2: Configure Each Setting

### 2.1 Django Settings

```env
# Django Secret Key
# Generate a new one: https://djecrety.ir/
SECRET_KEY=django-insecure-REPLACE-THIS-WITH-RANDOM-STRING

# Debug Mode (True for development, False for production)
DEBUG=True

# Allowed Hosts (domains that can access your API)
ALLOWED_HOSTS=localhost,127.0.0.1
```

**🔑 Generate a Secret Key:**

Option 1 - Online:
- Go to https://djecrety.ir/
- Copy the generated key
- Paste it in `.env`

Option 2 - Command Line:
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Example:**
```env
SECRET_KEY=django-insecure-x7#8k$2m9@vn!3h&p5w^q*r$t6y+u-a=b%c#d

$e%f*g@h
```

### 2.2 Database Configuration

```env
# Database Settings
DB_NAME=knowledge_platform
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
DB_HOST=localhost
DB_PORT=5432
```

**⚠️ IMPORTANT:** Replace `YOUR_POSTGRES_PASSWORD_HERE` with your actual PostgreSQL password!

**Examples:**
```env
# If you're using postgres user:
DB_USER=postgres
DB_PASSWORD=postgres123

# If you created a custom user:
DB_USER=django_user
DB_PASSWORD=mySecurePassword2024

# If using Docker:
DB_PASSWORD=postgres
```

### 2.3 Redis Configuration

```env
# Redis URL
REDIS_URL=redis://localhost:6379/0
```

**Different configurations:**

```env
# Local Redis (default):
REDIS_URL=redis://localhost:6379/0

# Docker Redis:
REDIS_URL=redis://localhost:6379/0

# Remote Redis (if using cloud service):
REDIS_URL=redis://username:password@hostname:6379/0

# Windows (Memurai):
REDIS_URL=redis://localhost:6379/0
```

### 2.4 LLM Service Configuration

```env
# LLM Provider (openai or anthropic)
LLM_PROVIDER=openai

# API Key - GET THIS FROM YOUR PROVIDER
LLM_API_KEY=sk-your-api-key-here

# Models to use
LLM_MODEL=gpt-3.5-turbo
LLM_EMBEDDING_MODEL=text-embedding-3-small

# Embedding dimension (depends on model)
# OpenAI ada-002: 1536
# OpenAI text-embedding-3-small: 1536
# OpenAI text-embedding-3-large: 3072
EMBEDDING_DIMENSION=1536
```

**🔑 Getting LLM API Keys:**

**For OpenAI:**
1. Go to https://platform.openai.com/
2. Sign up / Log in
3. Go to API Keys section
4. Create new secret key
5. Copy and paste into `.env`

**For Anthropic:**
1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Get API key from settings
4. Update `.env`:
   ```env
   LLM_PROVIDER=anthropic
   LLM_API_KEY=sk-ant-your-key-here
   LLM_MODEL=claude-3-sonnet-20240229
   ```

**⚠️ For Testing Without API Key:**
```env
# You can use demo mode (won't make real API calls)
LLM_API_KEY=demo-key-testing-only

# NOTE: You'll get placeholder responses, but the system will work
```

### 2.5 Document Processing Settings

```env
# Maximum file size in MB
MAX_FILE_SIZE_MB=10

# Allowed file types (comma-separated)
ALLOWED_FILE_TYPES=pdf,docx,txt

# Text chunking settings
CHUNK_SIZE=500
CHUNK_OVERLAP=50
```

**What these mean:**

- `MAX_FILE_SIZE_MB`: Files larger than this will be rejected
- `ALLOWED_FILE_TYPES`: Only these file types can be uploaded
- `CHUNK_SIZE`: How many characters per chunk (affects retrieval quality)
- `CHUNK_OVERLAP`: Overlap between chunks (prevents splitting sentences)

**Recommended values:**
```env
# For general documents:
CHUNK_SIZE=500
CHUNK_OVERLAP=50

# For technical docs with lots of code:
CHUNK_SIZE=800
CHUNK_OVERLAP=100

# For short documents/FAQs:
CHUNK_SIZE=300
CHUNK_OVERLAP=30
```

### 2.6 Vector Search Settings

```env
# Number of chunks to retrieve
TOP_K_RESULTS=5

# Minimum similarity score (0.0 to 1.0)
SIMILARITY_THRESHOLD=0.7
```

**What these mean:**

- `TOP_K_RESULTS`: How many similar chunks to find (more = slower but more comprehensive)
- `SIMILARITY_THRESHOLD`: Minimum similarity to include (higher = stricter matching)

**Recommended values:**
```env
# For high precision (strict matching):
TOP_K_RESULTS=3
SIMILARITY_THRESHOLD=0.8

# For high recall (catch more potential matches):
TOP_K_RESULTS=10
SIMILARITY_THRESHOLD=0.6

# Balanced (recommended):
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.7
```

### 2.7 Rate Limiting

```env
# Maximum queries per user per day
MAX_QUERIES_PER_DAY=100

# Maximum tokens per query (prevents abuse)
MAX_TOKENS_PER_QUERY=2000
```

**Adjust based on your needs:**
```env
# For testing/development:
MAX_QUERIES_PER_DAY=1000

# For small team:
MAX_QUERIES_PER_DAY=50

# For large organization:
MAX_QUERIES_PER_DAY=200
```

### 2.8 JWT Token Settings

```env
# Access token lifetime in minutes
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60

# Refresh token lifetime in days
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

**Security considerations:**
```env
# High security:
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=1

# Balanced (recommended):
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Convenience (less secure):
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=480  # 8 hours
JWT_REFRESH_TOKEN_LIFETIME_DAYS=30
```

---

## 📋 Step 3: Complete .env Example

Here's a complete `.env` file with all settings:

```env
# ===== Django Settings =====
SECRET_KEY=django-insecure-x7#8k$2m9@vn!3h&p5w^q*r$t6y+u-a=b%c#d$e%f*g@h
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# ===== Database Configuration =====
DB_NAME=knowledge_platform
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=localhost
DB_PORT=5432

# ===== Redis Configuration =====
REDIS_URL=redis://localhost:6379/0

# ===== LLM Service Configuration =====
LLM_PROVIDER=openai
LLM_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
LLM_MODEL=gpt-3.5-turbo
LLM_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# ===== Document Processing =====
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=pdf,docx,txt
CHUNK_SIZE=500
CHUNK_OVERLAP=50

# ===== Vector Search =====
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.7

# ===== Rate Limiting =====
MAX_QUERIES_PER_DAY=100
MAX_TOKENS_PER_QUERY=2000

# ===== JWT Configuration =====
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

---

## ✅ Step 4: Verify Configuration

### 4.1 Check .env File Exists

```bash
# Windows:
dir .env

# macOS/Linux:
ls -la .env
```

You should see the file listed.

### 4.2 Test Configuration Loading

```bash
# Make sure venv is activated
python manage.py shell
```

**In the shell:**
```python
from django.conf import settings

# Test database config
print("Database:", settings.DATABASES['default']['NAME'])

# Test LLM config
print("LLM Provider:", settings.LLM_CONFIG['PROVIDER'])

# Test document config
print("Max file size:", settings.DOCUMENT_CONFIG['MAX_FILE_SIZE_MB'])

# If these print correctly, configuration is loaded!
exit()
```

### 4.3 Common Issues

**Issue: Settings not loading**
```python
# If you see default values instead of your .env values:
# 1. Check .env file is in the correct location (backend/.env)
# 2. Make sure there are no spaces around = signs
#    WRONG: SECRET_KEY = abc123
#    RIGHT: SECRET_KEY=abc123
# 3. Restart your terminal and reactivate venv
```

---

## 🔒 Step 5: Security Best Practices

### 5.1 Never Commit .env to Git

**.env is already in .gitignore**, but verify:

```bash
# Check .gitignore includes .env
cat .gitignore | grep .env      # macOS/Linux
findstr .env .gitignore          # Windows

# Should show: .env
```

### 5.2 Use Different .env for Production

**For production:**
1. Create `.env.production`
2. Set `DEBUG=False`
3. Use strong passwords
4. Use real domain in `ALLOWED_HOSTS`
5. Store secrets securely (AWS Secrets Manager, Azure Key Vault, etc.)

### 5.3 Environment-Specific Values

```env
# Development (.env)
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
SECRET_KEY=simple-key-for-development

# Production (.env.production)
DEBUG=False
ALLOWED_HOSTS=api.yourcompany.com,yourcompany.com
SECRET_KEY=very-long-secure-random-key-here
```

---

## 📝 Quick Reference

**Must configure before running:**
- [ ] SECRET_KEY (generate new one)
- [ ] DB_PASSWORD (your postgres password)
- [ ] LLM_API_KEY (get from OpenAI/Anthropic)

**Optional (can keep defaults):**
- CHUNK_SIZE
- TOP_K_RESULTS  
- MAX_QUERIES_PER_DAY

**For production only:**
- DEBUG=False
- Real domain in ALLOWED_HOSTS
- Strong SECRET_KEY

---

## ✅ Verification Checklist

- [ ] `.env` file created in `backend/` folder
- [ ] SECRET_KEY generated and set
- [ ] Database credentials correct
- [ ] Redis URL configured
- [ ] LLM API key added (or using demo mode)
- [ ] Configuration loads correctly (`python manage.py shell` test passed)
- [ ] `.env` is in `.gitignore`

---

## 🎉 Configuration Complete!

Your environment is now properly configured!

**Next Step**: [05_MIGRATIONS_USERS.md](./05_MIGRATIONS_USERS.md) - Create database tables and admin user

---

## 🔧 Troubleshooting

### Issue: "No module named 'decouple'"

```bash
# Install python-decouple
pip install python-decouple
```

### Issue: Settings not loading from .env

**Check for common mistakes:**
```env
# ❌ WRONG (spaces around =)
SECRET_KEY = abc123

# ✅ RIGHT (no spaces)
SECRET_KEY=abc123

# ❌ WRONG (quotes not needed)
DB_PASSWORD="postgres123"

# ✅ RIGHT (no quotes)
DB_PASSWORD=postgres123

# ❌ WRONG (empty value)
LLM_API_KEY=

# ✅ RIGHT (actual value or demo)
LLM_API_KEY=demo-key-for-testing
```

### Issue: "SECRET_KEY must not be empty"

```bash
# Generate a secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Copy output to .env SECRET_KEY=
```

---

**Configuration ready?** Let's create the database tables! → [05_MIGRATIONS_USERS.md](./05_MIGRATIONS_USERS.md)
