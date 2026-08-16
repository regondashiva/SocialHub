# 🚀 Installation Guide - SocialHub

## Step-by-Step Setup Instructions

### Prerequisites Checklist
- [ ] Node.js 16+ installed
- [ ] Python 3.9+ installed
- [ ] MongoDB installed and running
- [ ] Git installed

## Method 1: Local Development Setup

### Step 1: Install MongoDB

**Mac (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Run installer and follow setup wizard
- MongoDB will run as a service

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 3: Backend Setup

In a new terminal:

```bash
cd backend

# Install dependencies
npm install

# Create .env file with MongoDB connection
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REDIS_URL=redis://localhost:6379
EOF

# Start backend server
npm run dev
```

**Expected Output:**
```
Backend running on http://localhost:5000
MongoDB connected
```

### Step 4: ML Service Setup

**Windows (PowerShell / CMD):**
```powershell
cd ml-service

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
python -m pip install -r requirements.txt

# Start ML service
python main.py
```

**macOS / Linux:**
```bash
cd ml-service

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start ML service
python main.py
```

**Expected Output:**
```
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Step 5: Test the Application

Open browser and navigate to:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/health
- ML Service: http://localhost:8000/health

## Method 2: Docker Compose Setup (Recommended)

### Prerequisites
- Docker installed
- Docker Compose installed

### Single Command Deployment

```bash
# From project root directory
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services Started:**
- MongoDB on port 27017
- Redis on port 6379
- Backend on port 5000
- Frontend on port 5173
- ML Service on port 8000

### Verify Installation

```bash
# Check all containers running
docker ps

# Expected output should show 5 containers:
# - socialmedia_db
# - socialmedia_redis
# - socialmedia_backend
# - socialmedia_ml
# - socialmedia_frontend
```

## Common Issues & Solutions

### Issue 1: MongoDB Connection Error

**Error:**
```
MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongodb

# Windows:
# Check Services and ensure MongoDB is running
```

### Issue 2: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

### Issue 3: Python Virtual Environment Issues

**Error:**
```
Command 'python' not found or wrong version
```

**Solution:**
```bash
# Use python3 explicitly
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
```

### Issue 4: Module Not Found (Frontend)

**Error:**
```
Error: Cannot find module 'react'
```

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Database Initialization

### Create Test Users

```javascript
// In MongoDB shell
use socialmedia

db.users.insertMany([
  {
    username: "testuser1",
    email: "test1@example.com",
    password: "$2a$10$..." // bcrypt hashed
  },
  {
    username: "testuser2",
    email: "test2@example.com",
    password: "$2a$10$..."
  }
])
```

## Configuration Files

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
ADMIN_EMAIL=admin@socialhub.com
TOXICITY_THRESHOLD_WARNING=0.5
TOXICITY_THRESHOLD_BLOCK=0.75
```

## Verification Checklist

After setup, verify all systems are working:

### Frontend Check
```bash
curl http://localhost:5173
# Should return HTML page
```

### Backend Check
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"Backend is running"}
```

### ML Service Check
```bash
curl http://localhost:8000/health
# Should return: {"status":"ML service is running"}
```

### Database Check
```bash
mongosh
> db.version()
# Should show MongoDB version
```

## Development Workflow

### Running All Services

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - ML Service:**
```bash
cd ml-service
source venv/bin/activate
python main.py
```

## Useful Commands

### Backend Development
```bash
# Run with auto-reload
npm run dev

# Run tests
npm run test

# Check for errors
npm run lint
```

### Frontend Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

### ML Service
```bash
# Run with auto-reload
python main.py

# Run with specific port
uvicorn main:app --reload --port 8001

# View API docs
# Visit: http://localhost:8000/docs
```

## Production Deployment

### Environment Variables (Production)

```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-secret-key
REDIS_URL=your-production-redis-uri

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

### Build Commands

```bash
# Frontend build
cd frontend
npm run build
# Output: dist/

# Backend is ready as-is
# ML Service: docker build -t socialhub-ml .
```

## Troubleshooting Logs

### View Backend Logs
```bash
# If using npm
npm run dev 2>&1 | tee backend.log

# If using Docker
docker logs -f socialmedia_backend
```

### View Frontend Logs
```bash
# Open browser DevTools (F12)
# Check Console tab for errors
```

### View ML Service Logs
```bash
# Terminal output
python main.py

# Or with Docker
docker logs -f socialmedia_ml
```

## Next Steps

1. ✅ All services running
2. 📝 Create user account at http://localhost:5173/register
3. 📸 Create your first post
4. 💬 Add comments and test toxicity detection
5. 🔍 Explore other users
6. 👥 Follow users
7. 📊 Check admin dashboard

## Support Resources

- **MongoDB Docs:** https://docs.mongodb.com/
- **Express Docs:** https://expressjs.com/
- **React Docs:** https://react.dev/
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Transformers Docs:** https://huggingface.co/docs/transformers/

---

**Happy Development! 🎉**
