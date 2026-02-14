# 02 - Project Setup & Virtual Environment

**Goal**: Set up your project folder structure and create a Python virtual environment.

**Time**: 15-20 minutes

---

## 📁 Step 1: Organize Your Project Folder

### 1.1 Navigate to Your Main Project Folder

```bash
# Open Terminal (macOS/Linux) or Command Prompt (Windows)

# Navigate to your main project folder
# Replace 'your-main-project-folder' with your actual folder name
cd path/to/your-main-project-folder

# For example:
# cd C:\Users\YourName\Projects\knowledge-platform    (Windows)
# cd ~/Projects/knowledge-platform                     (macOS/Linux)
```

### 1.2 Create Backend Folder (if not already created)

```bash
# Create backend folder
mkdir backend

# Navigate into it
cd backend

# Verify you're in the right place
pwd                    # macOS/Linux
cd                     # Windows

# You should see: .../your-main-project-folder/backend
```

### 1.3 Extract Backend Files

**If you have the tar.gz file:**

```bash
# Extract the backend files
tar -xzf knowledge_platform_backend.tar.gz

# Move contents to current directory
mv knowledge_platform_backend/* .
mv knowledge_platform_backend/.* . 2>/dev/null || true

# Remove the now-empty folder
rm -rf knowledge_platform_backend
```

**If you have individual files:**
- Copy all backend files into the `backend/` folder
- Your structure should look like this:

```
backend/
├── config/
├── apps/
├── requirements.txt
├── manage.py
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🐍 Step 2: Create Virtual Environment

A virtual environment keeps your project's Python packages separate from your system Python.

### 2.1 Create the Virtual Environment

**🪟 Windows:**
```bash
# Make sure you're in the backend folder
cd path\to\your-main-project-folder\backend

# Create virtual environment
python -m venv venv
```

**🍎 macOS / 🐧 Linux:**
```bash
# Make sure you're in the backend folder
cd path/to/your-main-project-folder/backend

# Create virtual environment
python3 -m venv venv
```

**What just happened?**
- A new folder called `venv` was created
- This folder contains a separate Python installation for this project
- You'll see: `backend/venv/`

### 2.2 Activate the Virtual Environment

**This is VERY IMPORTANT!** You need to activate the virtual environment before installing packages.

**🪟 Windows (Command Prompt):**
```bash
venv\Scripts\activate
```

**🪟 Windows (PowerShell):**
```bash
venv\Scripts\Activate.ps1

# If you get an error about execution policies, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then try activating again
```

**🍎 macOS / 🐧 Linux:**
```bash
source venv/bin/activate
```

**How do I know it worked?**
- You should see `(venv)` at the beginning of your command prompt:
  ```
  (venv) C:\Users\YourName\backend>           # Windows
  (venv) yourname@computer:~/backend$         # macOS/Linux
  ```

### 2.3 Upgrade pip (Package Manager)

```bash
# Windows
python -m pip install --upgrade pip

# macOS/Linux
python3 -m pip install --upgrade pip
```

---

## 📦 Step 3: Install Dependencies

Now we'll install all the Python packages needed for the project.

### 3.1 Verify requirements.txt Exists

```bash
# Check if the file exists
ls requirements.txt        # macOS/Linux
dir requirements.txt       # Windows

# You should see: requirements.txt
```

### 3.2 Install All Packages

```bash
# This will take 2-5 minutes
pip install -r requirements.txt
```

**What's being installed?**
- Django (web framework)
- Django REST Framework (API building)
- PostgreSQL driver (database connection)
- Celery (async tasks)
- Redis driver
- And 20+ other packages

**Expected output:**
```
Collecting Django==4.2.9
  Downloading Django-4.2.9-py3-none-any.whl (8.0 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 8.0/8.0 MB 5.0 MB/s eta 0:00:00
...
Successfully installed Django-4.2.9 djangorestframework-3.14.0 ...
```

### 3.3 Verify Installation

```bash
# Check Django is installed
python -m django --version

# Should show: 4.2.9 or similar
```

---

## 📝 Step 4: Create .gitignore File

This tells Git which files NOT to upload to GitHub.

### 4.1 Check if .gitignore Exists

```bash
# macOS/Linux
ls -la | grep gitignore

# Windows
dir .gitignore
```

### 4.2 If It Doesn't Exist, Create It

**Create a file named `.gitignore` in the `backend/` folder with this content:**

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal
media/
staticfiles/

# Environment
.env

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Testing
.pytest_cache/
.coverage
htmlcov/

# Celery
celerybeat-schedule
celerybeat.pid
```

**How to create it:**

**Using VS Code:**
1. Open VS Code
2. File → New File
3. Save as `.gitignore` in the `backend/` folder
4. Paste the content above
5. Save

**Using Terminal/Command Prompt:**

**🪟 Windows:**
```bash
notepad .gitignore
# Paste the content, save and close
```

**🍎 macOS / 🐧 Linux:**
```bash
nano .gitignore
# Paste the content
# Press Ctrl+X, then Y, then Enter to save
```

---

## 🔍 Step 5: Verify Your Setup

### 5.1 Check Your Folder Structure

```bash
# List all folders and files
ls -la              # macOS/Linux
dir /a              # Windows
```

**You should see:**
```
backend/
├── venv/                    ← Virtual environment (folder)
├── config/                  ← Django config
├── apps/                    ← Your apps
├── requirements.txt         ← Dependencies
├── manage.py                ← Django management
├── .env.example             ← Environment template
├── .gitignore               ← Git ignore file
└── README.md                ← Documentation
```

### 5.2 Verify Virtual Environment is Active

```bash
# Check that venv is active
which python         # macOS/Linux
where python         # Windows

# Should show path inside venv folder:
# .../backend/venv/bin/python        (macOS/Linux)
# ...\backend\venv\Scripts\python    (Windows)
```

### 5.3 Test Django Installation

```bash
# Try running Django management command
python manage.py --help

# You should see Django's help text (no errors)
```

---

## ✅ Checklist

Before moving to the next step, verify:

- [ ] You're in the `backend/` folder
- [ ] Virtual environment is created (`venv/` folder exists)
- [ ] Virtual environment is **activated** (you see `(venv)` in prompt)
- [ ] All packages are installed (no errors during `pip install`)
- [ ] `.gitignore` file exists
- [ ] Django is working (`python manage.py --help` works)

---

## 🎉 Setup Complete!

Your project structure is ready, and all Python packages are installed!

**Next Step**: [03_DATABASE_SETUP.md](./03_DATABASE_SETUP.md) - Setting up PostgreSQL database

---

## ⚠️ Common Issues

### Issue: "python: command not found"

**Solution:**
```bash
# Try python3 instead
python3 --version

# If that works, use python3 throughout this guide
```

### Issue: Virtual environment won't activate

**Windows PowerShell Error:**
```
Solution: Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**macOS/Linux Permission Error:**
```bash
# Make the activate script executable
chmod +x venv/bin/activate
source venv/bin/activate
```

### Issue: pip install fails with "permission denied"

**Solution:**
```bash
# Make sure venv is activated (you should see (venv) in prompt)
# If still failing, try:
pip install --user -r requirements.txt
```

### Issue: Some packages fail to install

**Common causes:**
1. **Missing C compiler** (for packages like psycopg2)
   
   **Windows:** Install Visual Studio Build Tools
   - https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++"
   
   **macOS:** Install Xcode Command Line Tools
   ```bash
   xcode-select --install
   ```
   
   **Linux:**
   ```bash
   sudo apt install build-essential python3-dev
   ```

2. **Use binary packages:**
   ```bash
   # Instead of psycopg2, use binary version:
   pip install psycopg2-binary
   ```

---

## 💡 Pro Tips

1. **Always activate venv** before working:
   ```bash
   # Windows
   cd backend
   venv\Scripts\activate
   
   # macOS/Linux
   cd backend
   source venv/bin/activate
   ```

2. **Deactivate when done:**
   ```bash
   deactivate
   ```

3. **VS Code auto-activation:**
   - Open VS Code in the backend folder
   - Select Python interpreter (Ctrl+Shift+P → "Python: Select Interpreter")
   - Choose the one in `./venv/`
   - VS Code will auto-activate venv in its terminal!

---

**Ready?** Let's set up the database! → [03_DATABASE_SETUP.md](./03_DATABASE_SETUP.md)
