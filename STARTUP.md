# 🚀 GSUNET Startup Guide

Quick reference for starting the GSUNET application on Windows or WSL.

---

## 📋 Prerequisites Check

Before starting, make sure you have:
- **Docker Desktop** (running)
- **Python 3.10+** (for backend)
- **Node.js 20+** (for frontend)

### Check Versions

```bash
# Check all versions
docker --version
python --version  # or python3 --version
node --version
npm --version
```

> **Note**: If Node.js is below v20, upgrade it first (see Troubleshooting section)

---

## 🐧 Starting on WSL (Ubuntu/Linux)

### One-Time Setup (First Run Only)

```bash
cd /mnt/d/Six_Seven

# Start Docker containers
docker-compose up -d

# Setup Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup Frontend
cd ../frontend
npm install
```

### Daily Startup (Every Time)

Open **3 terminals**:

**Terminal 1 - Docker:**
```bash
cd /mnt/d/Six_Seven
docker-compose up -d
```

**Terminal 2 - Backend:**
```bash
cd /mnt/d/Six_Seven/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd /mnt/d/Six_Seven/frontend
npm run dev
```

### Quick Start (All in One Terminal)

```bash
cd /mnt/d/Six_Seven
docker-compose up -d && \
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
cd ../frontend && npm run dev
```

---

## 🪟 Starting on Windows (Native)

### One-Time Setup (First Run Only)

Open **PowerShell** as Administrator:

```powershell
cd D:\Six_Seven

# Start Docker containers
docker-compose up -d

# Setup Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Setup Frontend
cd ..\frontend
npm install
```

### Daily Startup (Every Time)

Open **3 PowerShell windows**:

**PowerShell 1 - Docker:**
```powershell
cd D:\Six_Seven
docker-compose up -d
```

**PowerShell 2 - Backend:**
```powershell
cd D:\Six_Seven\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**PowerShell 3 - Frontend:**
```powershell
cd D:\Six_Seven\frontend
npm run dev
```

### Alternative: Using Command Prompt (cmd)

**Backend:**
```cmd
cd D:\Six_Seven\backend
venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```cmd
cd D:\Six_Seven\frontend
npm run dev
```

---

## 🌐 Access URLs

Once everything is running, open these in your browser:

| Service | URL | Credentials (if needed) |
|---------|-----|-------------------------|
| **🎨 Frontend (App)** | http://localhost:5173 | - |
| **⚡ Backend API** | http://localhost:8000 | - |
| **📚 API Docs (Swagger)** | http://localhost:8000/docs | - |
| **📖 API Docs (ReDoc)** | http://localhost:8000/redoc | - |
| **🗄️ PgAdmin (Database)** | http://localhost:5050 | Email: admin@gsunet.com<br>Password: admin |

---

## 🛑 Shutting Down

### Stop Everything

**WSL/Linux:**
```bash
# Stop backend: Ctrl+C in backend terminal
# Stop frontend: Ctrl+C in frontend terminal
# Stop Docker:
cd /mnt/d/Six_Seven
docker-compose down
```

**Windows:**
```powershell
# Stop backend: Ctrl+C in backend PowerShell
# Stop frontend: Ctrl+C in frontend PowerShell
# Stop Docker:
cd D:\Six_Seven
docker-compose down
```

### Stop and Clean Docker (removes all data)

```bash
docker-compose down -v
```

---

## 🔧 Troubleshooting

### Issue 1: Node.js Version Too Old

**Error:** `You are using Node.js X.X.X. Vite requires Node.js version 20.19+ or 22.12+`

**Fix (WSL/Linux):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verify it's v20+
```

**Fix (Windows):**
1. Download Node.js 20+ from https://nodejs.org/
2. Run installer
3. Restart PowerShell
4. Verify: `node --version`

### Issue 2: Port Already in Use

**Backend (Port 8000):**

**WSL/Linux:**
```bash
lsof -i :8000
kill -9 <PID>
```

**Windows:**
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend (Port 5173):**
Vite automatically uses next available port (5174, 5175, etc.)

### Issue 3: Docker Containers Not Starting

```bash
# Stop everything
docker-compose down

# Clean and restart
docker-compose down -v
docker-compose up -d

# Check if running
docker ps
```

### Issue 4: Tailwind CSS PostCSS Error

**Error:** `[postcss] It looks like you're trying to use tailwindcss directly...`

**Fix:**
```bash
cd frontend
npm install --save-dev @tailwindcss/postcss
npm run dev
```

### Issue 5: Python Virtual Environment Issues

**WSL/Linux:**
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Windows:**
```powershell
cd backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue 6: npm/frontend Dependencies Issues

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue 7: Database Connection Error

**Check if PostgreSQL is running:**
```bash
docker ps | grep postgres
```

**If not running:**
```bash
docker-compose up -d
```

**Connection String (if needed):**
```
postgresql://gsu_user:gsu_password@localhost:5432/gsunet_db
```

---

## 📝 Quick Commands Reference

### Docker
```bash
docker-compose up -d          # Start containers
docker-compose down           # Stop containers
docker-compose down -v        # Stop and remove volumes
docker ps                     # List running containers
docker logs <container_name>  # View container logs
```

### Git
```bash
git status                    # Check changes
git pull                      # Get latest code
git add .                     # Stage changes
git commit -m "message"       # Commit changes
git push                      # Push to remote
```

### Python (Backend)
```bash
# WSL/Linux
source venv/bin/activate      # Activate virtual env
deactivate                    # Deactivate virtual env
pip list                      # List installed packages
pip install <package>         # Install package

# Windows
.\venv\Scripts\Activate.ps1   # Activate virtual env
deactivate                    # Deactivate virtual env
```

### npm (Frontend)
```bash
npm install                   # Install dependencies
npm run dev                   # Start dev server
npm run build                 # Build for production
npm run preview               # Preview production build
npm list                      # List installed packages
npm install <package>         # Install package
```

---

## 🎯 First Time User Journey

1. **Clone the repo**
2. **Run Docker**: `docker-compose up -d`
3. **Setup Backend**: Create venv, install deps
4. **Setup Frontend**: Run `npm install`
5. **Start Backend**: Run uvicorn
6. **Start Frontend**: Run `npm run dev`
7. **Open browser**: Go to http://localhost:5173
8. **Register**: Create an account
9. **Login**: Sign in
10. **Explore**: Check events, clubs, etc.

---

## 💡 Tips

- Keep Docker running in the background
- Use separate terminals for backend/frontend so you can see logs
- Check http://localhost:8000/docs for API testing
- Press `Ctrl+C` to stop servers (not close terminal)
- Backend auto-reloads on file changes (FastAPI --reload)
- Frontend auto-reloads on file changes (Vite HMR)

---

## 🆘 Need Help?

1. Check this STARTUP.md file
2. Check PROJECT_GUIDE.md for detailed documentation
3. Check backend/README.md for backend-specific info
4. Check frontend/README.md for frontend-specific info
5. Check API docs at http://localhost:8000/docs

---

**Last Updated**: 2025-12-12
**GSUNET Version**: 1.0.0
