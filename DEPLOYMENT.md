# 🚀 SocialHub Deployment Guide

This guide details how to deploy the entire **SocialHub** application (Frontend, Backend, ML Service, and Database) to production.

---

## 📋 Architecture Overview

SocialHub consists of 4 components:
1. **Frontend**: React (Vite, TailwindCSS) Single Page App.
2. **Backend**: Node.js / Express REST API.
3. **ML Service**: Python FastAPI multilingual toxicity moderation microservice.
4. **Database**: MongoDB (Local or MongoDB Atlas).

---

## 🌟 Method 1: Cloud Deployment (Recommended - Free Tier Friendly)

### Step 1: Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. Under **Database Access**, create a user with a secure password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
4. Click **Connect** -> **Connect your application** -> Copy the connection URI:
   ```env
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/socialmedia?retryWrites=true&w=majority
   ```

---

### Step 2: Deploy Backend & ML Service on Render / Railway

#### Option A: Render
1. Go to [Render.com](https://render.com) and link your GitHub repository.
2. Create a **Web Service** for **Backend**:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
     - `JWT_SECRET`: `<Generate a random secure 32+ character string>`
     - `CLIENT_URL`: `https://your-frontend-domain.vercel.app` (or `*`)
     - `ML_API_URL`: `<Your deployed ML service URL, if deployed>`
3. Create a **Web Service** for **ML Service** (Optional / Recommended):
   - **Root Directory**: `ml-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

### Step 3: Deploy Frontend on Vercel / Netlify

#### Deploying on Vercel:
1. Go to [Vercel](https://vercel.com) and click **Add New Project** -> Import your GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
   - `VITE_ML_API_URL`: `https://your-ml-service.onrender.com`
5. Click **Deploy**. Vercel will automatically build the React app and utilize `vercel.json` for client-side routing.

---

## 🐳 Method 2: Single-Server VPS with Docker Compose

Deploy the entire stack with a single command on any VPS (AWS EC2, DigitalOcean Droplet, Hetzner, Linode, Ubuntu):

### 1. Connect to your VPS and install Docker
```bash
sudo apt update && sudo apt install -y docker.io docker-compose git
```

### 2. Clone repository and set up environment
```bash
git clone <your-repo-url>
cd SocialMediaApp
cp .env.production.example .env
```

### 3. Edit `.env` with your secrets & domain
```bash
nano .env
```

### 4. Build and run containers
```bash
docker-compose up -d --build
```

### 5. Check container health
```bash
docker-compose ps
docker-compose logs -f
```

Your app will be accessible at `http://your-server-ip` or your configured domain!

---

## 📱 Mobile Responsiveness Features

The application is built mobile-first and includes:
- **Mobile Navigation**: Fixed blurred top header and bottom navigation bar with active indicators.
- **Stories Bar**: Smooth horizontal touch swipe with full-screen story viewer.
- **Feed & Post Cards**: Responsive card layout with full touch targets and animated interactions.
- **Direct Messages**: Mobile conversation view with back-to-inbox navigation.
- **Profile & Explore**: Responsive 2-column/3-column media grid adapting to any screen size.
- **Admin Dashboard**: Horizontally scrollable moderation tables and touch-friendly quick action buttons.

---

## 🩺 Production Health Checks

- **Backend Health Check**: `GET https://your-backend-api/api/health`
- **Backend Root Status**: `GET https://your-backend-api/`
- **ML Service Health Check**: `GET https://your-ml-service/`
