# 01 - Prerequisites & Installation

**Goal**: Install all required software before setting up the project.

**Time**: 30-60 minutes

---

## What You'll Install

1. ✅ Python 3.10 or higher
2. ✅ PostgreSQL 14 or higher
3. ✅ Redis
4. ✅ Git
5. ✅ A code editor (VS Code recommended)
6. ✅ Postman (for testing APIs)

---

## 1️⃣ Install Python 3.10+

### 🪟 Windows

1. **Download Python**
   - Go to https://www.python.org/downloads/
   - Click "Download Python 3.11.x" (latest version)
   - Run the installer

2. **IMPORTANT: Check "Add Python to PATH"**
   - ✅ Check the box that says "Add Python to PATH"
   - Click "Install Now"

3. **Verify Installation**
   ```bash
   # Open Command Prompt (Win + R, type 'cmd', press Enter)
   python --version
   ```
   
   You should see: `Python 3.11.x` or similar

### 🍎 macOS

1. **Install Homebrew** (if not installed)
   ```bash
   # Open Terminal
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Python**
   ```bash
   brew install python@3.11
   ```

3. **Verify Installation**
   ```bash
   python3 --version
   ```

### 🐧 Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip

# Verify
python3 --version
```

---

## 2️⃣ Install PostgreSQL 14+

PostgreSQL is our database. We need the pgvector extension for vector search.

### 🪟 Windows

1. **Download PostgreSQL**
   - Go to https://www.postgresql.org/download/windows/
   - Download the installer (version 14 or higher)
   - Run the installer

2. **During Installation**
   - Set a password for the postgres user (REMEMBER THIS!)
   - Default port: 5432 (leave as is)
   - Install Stack Builder when prompted

3. **Install pgvector**
   - Download from: https://github.com/pgvector/pgvector/releases
   - Or use Docker (easier - see Docker option below)

4. **Verify Installation**
   ```bash
   # Open Command Prompt
   psql --version
   ```

### 🍎 macOS

```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Install pgvector
brew install pgvector

# Verify
psql --version
```

### 🐧 Linux (Ubuntu/Debian)

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update and install
sudo apt update
sudo apt install postgresql-14 postgresql-contrib-14

# Install pgvector
sudo apt install postgresql-14-pgvector

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
psql --version
```

### 🐳 Docker Alternative (Easiest!)

If you find PostgreSQL installation difficult, use Docker:

```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop

# Run PostgreSQL with pgvector
docker run -d \
  --name postgres-pgvector \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=knowledge_platform \
  -p 5432:5432 \
  ankane/pgvector:latest
```

---

## 3️⃣ Install Redis

Redis is needed for Celery (background tasks).

### 🪟 Windows

**Option 1: Using WSL (Recommended)**
```bash
# Install WSL first from Microsoft Store
wsl --install

# Then in WSL:
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

**Option 2: Memurai (Redis alternative for Windows)**
- Download from: https://www.memurai.com/get-memurai
- Install and run

**Option 3: Docker (Easiest)**
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 🍎 macOS

```bash
# Install Redis
brew install redis

# Start Redis
brew services start redis

# Verify
redis-cli ping
# Should return: PONG
```

### 🐧 Linux (Ubuntu/Debian)

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping
# Should return: PONG
```

---

## 4️⃣ Install Git

### 🪟 Windows

1. Download from: https://git-scm.com/download/win
2. Run installer (use default options)
3. Verify:
   ```bash
   git --version
   ```

### 🍎 macOS

```bash
# Usually pre-installed, but to update:
brew install git

# Verify
git --version
```

### 🐧 Linux

```bash
sudo apt install git

# Verify
git --version
```

### Configure Git (All Platforms)

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"
```

---

## 5️⃣ Install VS Code (Recommended Editor)

1. **Download**
   - Go to: https://code.visualstudio.com/
   - Download for your operating system
   - Install

2. **Recommended Extensions**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
   - Install:
     - "Python" by Microsoft
     - "GitLens" by GitKraken
     - "REST Client" (for testing APIs)

---

## 6️⃣ Install Postman (API Testing)

1. **Download**
   - Go to: https://www.postman.com/downloads/
   - Download for your operating system
   - Install

2. **Create Account** (Optional but recommended)
   - Sign up for a free account
   - You can save your API tests

---

## ✅ Verify All Installations

Run these commands to make sure everything is installed:

```bash
# Check Python
python --version          # or python3 --version
# Expected: Python 3.10.x or higher

# Check pip (Python package manager)
pip --version             # or pip3 --version
# Expected: pip 23.x.x

# Check PostgreSQL
psql --version
# Expected: psql (PostgreSQL) 14.x or higher

# Check Redis
redis-cli ping
# Expected: PONG

# Check Git
git --version
# Expected: git version 2.x.x
```

---

## 🎉 All Prerequisites Installed!

If all commands above work, you're ready to proceed!

**Next Step**: [02_PROJECT_SETUP.md](./02_PROJECT_SETUP.md) - Setting up the project and virtual environment

---

## ❌ Troubleshooting

### "Command not found" errors

**Problem**: Terminal doesn't recognize the command

**Solution**:
1. Make sure you installed the software correctly
2. Restart your terminal/command prompt
3. On Windows, make sure "Add to PATH" was checked during installation
4. Try logging out and back in

### PostgreSQL won't start

**Problem**: `systemctl start postgresql` fails

**Solution**:
```bash
# Check status
sudo systemctl status postgresql

# Check logs
sudo journalctl -u postgresql

# Try reinstalling
sudo apt remove postgresql postgresql-contrib
sudo apt install postgresql-14 postgresql-contrib-14
```

### Redis connection refused

**Problem**: `redis-cli ping` doesn't work

**Solution**:
```bash
# Make sure Redis is running
# macOS:
brew services restart redis

# Linux:
sudo systemctl restart redis-server

# Windows (Docker):
docker start redis
```

---

**Having issues?** Check the [main troubleshooting guide](./09_TROUBLESHOOTING.md) or search for your specific error online.
