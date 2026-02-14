# 08 - GitHub Upload Guide

**Goal**: Upload your project to GitHub for version control and collaboration.

**Time**: 20-30 minutes

---

## 📚 What is GitHub?

GitHub is a platform for:
- 📦 **Version Control** - Track changes to your code
- 👥 **Collaboration** - Work with others
- 💾 **Backup** - Keep your code safe in the cloud
- 📖 **Portfolio** - Show your work to employers

---

## 🚀 Step 1: Create GitHub Account

### 1.1 Sign Up

1. Go to https://github.com/
2. Click "Sign up"
3. Follow the steps:
   - Enter email
   - Create password
   - Choose username
   - Verify account

### 1.2 Verify Email

- Check your email inbox
- Click verification link
- Return to GitHub

---

## 📁 Step 2: Create New Repository

### 2.1 Create Repository on GitHub

1. Log in to GitHub
2. Click the `+` icon (top right)
3. Select "New repository"

### 2.2 Repository Settings

Fill in:
- **Repository name**: `knowledge-platform-backend`
- **Description**: "Internal Knowledge Operations Platform - AI-powered document management and RAG system"
- **Visibility**: 
  - ✅ **Public** (anyone can see)
  - ⬜ Private (only you can see)
- ❌ **DON'T check** "Add README" (we already have one)
- ❌ **DON'T check** "Add .gitignore" (we have this too)
- ❌ **DON'T check** "Choose a license" (optional for now)

3. Click **"Create repository"**

### 2.3 Save Repository URL

You'll see a URL like:
```
https://github.com/YOUR_USERNAME/knowledge-platform-backend.git
```

**Copy this** - you'll need it soon!

---

## 🔧 Step 3: Initialize Git in Your Project

### 3.1 Navigate to Your Backend Folder

```bash
# Go to your backend directory
cd path/to/your-main-project-folder/backend

# Verify you're in the right place
# You should see manage.py, config/, apps/, etc.
ls          # macOS/Linux
dir         # Windows
```

### 3.2 Initialize Git

```bash
# Initialize git repository
git init

# You should see:
# Initialized empty Git repository in /path/to/backend/.git/
```

**What happened?**
- Created a hidden `.git/` folder
- This tracks all changes to your code

### 3.3 Verify .gitignore Exists

```bash
# Check .gitignore exists
cat .gitignore          # macOS/Linux
type .gitignore         # Windows

# Should see content like:
# venv/
# .env
# __pycache__/
# etc.
```

**Why is this important?**
- `.gitignore` tells Git which files to IGNORE
- We don't want to upload:
  - `venv/` (too large, not needed)
  - `.env` (contains secrets!)
  - `__pycache__/` (auto-generated)

---

## 📝 Step 4: Stage Your Files

### 4.1 Check Status

```bash
git status
```

**You'll see:**
```
On branch main
No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        README.md
        manage.py
        config/
        apps/
        ...
```

**Red files** = Not tracked by Git yet

### 4.2 Add All Files

```bash
# Add all files to staging area
git add .

# The dot (.) means "everything in this directory"
```

### 4.3 Verify Files Are Staged

```bash
git status
```

**Now you should see:**
```
On branch main
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   .gitignore
        new file:   README.md
        new file:   manage.py
        ...
```

**Green files** = Ready to be committed!

**⚠️ Make sure you DON'T see:**
```
new file:   .env              ← Should be ignored!
new file:   venv/             ← Should be ignored!
```

If you do see these, stop and check your `.gitignore`!

---

## 💾 Step 5: Make Your First Commit

### 5.1 Create Commit

```bash
git commit -m "Initial commit: Knowledge Platform backend with RAG system"
```

**What's a commit?**
- A "snapshot" of your code at this moment
- Includes a message describing what changed
- Can be reverted to later if needed

**Expected output:**
```
[main (root-commit) abc1234] Initial commit: Knowledge Platform backend with RAG system
 53 files changed, 8000 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md
 ...
```

### 5.2 Verify Commit

```bash
git log --oneline

# You should see:
# abc1234 (HEAD -> main) Initial commit: Knowledge Platform backend with RAG system
```

---

## 🔗 Step 6: Connect to GitHub

### 6.1 Add Remote Repository

```bash
# Add GitHub as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/knowledge-platform-backend.git

# Example:
# git remote add origin https://github.com/johnsmith/knowledge-platform-backend.git
```

### 6.2 Verify Remote

```bash
git remote -v

# You should see:
# origin  https://github.com/YOUR_USERNAME/knowledge-platform-backend.git (fetch)
# origin  https://github.com/YOUR_USERNAME/knowledge-platform-backend.git (push)
```

### 6.3 Rename Branch (if needed)

GitHub uses `main` as default, but Git might use `master`:

```bash
# Check current branch name
git branch

# If it says "master", rename to "main":
git branch -M main
```

---

## ⬆️ Step 7: Push to GitHub

### 7.1 Push Your Code

```bash
git push -u origin main
```

**What's happening:**
- `push` = Upload to GitHub
- `-u origin main` = Set `main` branch as default
- First time only - future pushes can just use `git push`

### 7.2 Enter Credentials

**You'll be prompted:**

**Username:** Your GitHub username

**Password:** ⚠️ NOT your GitHub password!

**Use a Personal Access Token instead:**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Knowledge Platform Uploads"
4. Check scopes:
   - ✅ repo
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. Paste as password

**Expected output:**
```
Enumerating objects: 100, done.
Counting objects: 100% (100/100), done.
Delta compression using up to 8 threads
Compressing objects: 100% (95/95), done.
Writing objects: 100% (100/100), 50.00 KiB | 5.00 MiB/s, done.
Total 100 (delta 20), reused 0 (delta 0)
To https://github.com/YOUR_USERNAME/knowledge-platform-backend.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 7.3 Verify on GitHub

1. Go to your repository URL
2. Refresh the page
3. You should see all your files!

🎉 **Success! Your code is on GitHub!**

---

## 📄 Step 8: Create a Great README

Your repository needs a good README so others understand it.

### 8.1 Create README.md

The backend already has a README.md, but let's make sure it's good!

**Check if README.md exists:**
```bash
cat README.md | head -20      # First 20 lines
```

### 8.2 Key Sections to Include

Your README should have:
1. **Title & Description**
2. **Features**
3. **Tech Stack**
4. **Installation**
5. **Usage**
6. **API Documentation**
7. **License**

**Example README structure:**

```markdown
# Knowledge Platform Backend

AI-powered internal knowledge management system with RAG (Retrieval-Augmented Generation).

## Features

- 🔐 JWT Authentication with role-based access
- 📄 Document management (PDF, DOCX, TXT)
- 🔍 Semantic search with pgvector
- 🤖 AI-powered Q&A with source attribution
- 📊 Analytics and monitoring
- ✅ Human feedback loop
- 📝 Audit logging

## Tech Stack

- Python 3.11 + Django 4.2
- PostgreSQL with pgvector
- Celery + Redis
- Django REST Framework
- OpenAI / Anthropic LLM

## Quick Start

See [Setup Guide](./SETUP_GUIDE_MASTER.md) for detailed instructions.

## License

MIT License
```

---

## 🔄 Step 9: Making Changes Later

After you've made changes to your code:

### 9.1 Check What Changed

```bash
git status

# Shows modified files
```

### 9.2 Stage Changes

```bash
# Add specific file
git add filename.py

# Or add all changes
git add .
```

### 9.3 Commit Changes

```bash
git commit -m "Add user authentication feature"
```

### 9.4 Push to GitHub

```bash
git push

# That's it! Changes are uploaded
```

---

## 🌿 Step 10: Branching (Advanced)

For working on new features without breaking main code:

### 10.1 Create New Branch

```bash
# Create and switch to new branch
git checkout -b feature/add-notifications

# Make your changes...
```

### 10.2 Commit on Branch

```bash
git add .
git commit -m "Add email notifications"
```

### 10.3 Push Branch

```bash
git push -u origin feature/add-notifications
```

### 10.4 Create Pull Request

1. Go to GitHub repository
2. Click "Pull requests"
3. Click "New pull request"
4. Select your branch
5. Click "Create pull request"
6. Merge when ready!

---

## 📚 Git Cheat Sheet

**Common Commands:**

```bash
# Check status
git status

# Add files
git add filename.py           # Specific file
git add .                     # All files

# Commit
git commit -m "Your message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View history
git log

# Create branch
git checkout -b branch-name

# Switch branches
git checkout main

# See differences
git diff
```

---

## ✅ Checklist

- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Git initialized in backend folder
- [ ] .gitignore in place (NOT uploading .env or venv/)
- [ ] Files added and committed
- [ ] Remote repository connected
- [ ] Code pushed to GitHub
- [ ] Repository visible on GitHub
- [ ] README looks good

---

## 🎉 Congratulations!

Your project is now on GitHub! 

**Benefits you now have:**
- ✅ Code backed up in cloud
- ✅ Version history preserved
- ✅ Can collaborate with others
- ✅ Portfolio piece for job applications
- ✅ Can share with anyone via link

---

## 🐛 Troubleshooting

### Issue: "Permission denied (publickey)"

**Solution: Use HTTPS, not SSH**
```bash
# Make sure your remote URL uses HTTPS:
git remote -v

# If it shows git@github.com, change to HTTPS:
git remote set-url origin https://github.com/YOUR_USERNAME/repo.git
```

### Issue: "fatal: remote origin already exists"

```bash
# Remove existing remote
git remote remove origin

# Add new one
git remote add origin https://github.com/YOUR_USERNAME/repo.git
```

### Issue: "Updates were rejected because the tip of your current branch is behind"

```bash
# Pull latest changes first
git pull origin main

# Then push
git push
```

### Issue: "Support for password authentication was removed"

**Solution:** Use Personal Access Token (not password)
1. Go to https://github.com/settings/tokens
2. Generate new token
3. Use token as password when pushing

### Issue: Accidentally committed .env file

**FIX IMMEDIATELY:**

```bash
# Remove from Git (but keep local file)
git rm --cached .env

# Add to .gitignore if not already there
echo ".env" >> .gitignore

# Commit the removal
git add .gitignore
git commit -m "Remove .env from version control"
git push

# Go to GitHub → Settings → Secrets
# Rotate any exposed API keys/passwords!
```

---

## 📖 Learn More

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Interactive Git Tutorial](https://learngitbranching.js.org/)

---

**Project uploaded?** You're done with the backend setup! 🎉

**Next:** Start building features or proceed to frontend development!
