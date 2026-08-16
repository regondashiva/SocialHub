# ⚡ Quick Start Guide

## 5-Minute Setup (Local Development)

### 1. Prerequisites
- Node.js 16+ 
- Python 3.9+
- MongoDB running locally

### 2. Setup Commands

#### Terminal 1 - Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Terminal 2 - Backend
```bash
cd backend
npm install
npm run dev
```

#### Terminal 3 - ML Service

**Windows (PowerShell):**
```powershell
cd ml-service
venv\Scripts\activate
python -m pip install -r requirements.txt
python main.py
```

**macOS / Linux:**
```bash
cd ml-service
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 3. Access Application
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **ML Service:** http://localhost:8000

## 2-Minute Setup (Docker)

```bash
# One command to start everything
docker-compose up -d

# View logs
docker-compose logs -f
```

Access: http://localhost:5173

## First Time Users

1. **Register Account**
   - Go to http://localhost:5173/register
   - Create username, email, password

2. **Login**
   - Use your credentials
   - Redirects to Feed

3. **Create First Post**
   - Click "What's on your mind?"
   - Add caption and image
   - Click Post

4. **Add Comment**
   - Click on a post
   - Type comment
   - Watch toxicity detection in action!

5. **Explore Features**
   - Like posts
   - Visit profiles
   - Follow users
   - Check Explore page

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### MongoDB Not Connecting
```bash
# Start MongoDB
mongod

# Or verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/socialmedia
```

### ML Service Not Loading
```bash
# Make sure Python 3.9+ installed
python --version

# Try specific Python version
python3 main.py
```

## Default Test Credentials

For testing, register with:
- Email: test@example.com
- Username: testuser
- Password: Test@123

## Next: Production Deployment

See `README.md` and `INSTALLATION.md` for detailed guides.

---

**All systems running? Start building! 🚀**
