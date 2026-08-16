# 🌟 SocialHub - AI-Powered Social Media Platform

A full-stack Instagram-like social media application with advanced AI-powered multilingual toxicity detection system.

## ✨ Features

### 🎯 Core Features
- **User Authentication** - Secure JWT-based authentication
- **Feed System** - Real-time feed with posts and interactions
- **Post Creation** - Upload images with captions
- **Comments & Likes** - Interactive engagement system
- **User Profiles** - Customizable profile pages
- **Follow/Unfollow** - Build your network
- **Explore Page** - Discover new users

### 🧠 AI Toxicity Detection
- **Multilingual Support** - English, Hindi, Telugu, Hinglish, Mixed scripts
- **Real-time Detection** - Comment validation before posting
- **Smart Warnings** - Gradient-based alerts (Warning → Block)
- **AI Suggestions** - Rewrite toxic comments politely
- **Harassment Patterns** - Track repeated negative behavior
- **Self-Learning** - Improve with community feedback
- **Cultural Intelligence** - Regional slang detection

## 🏗 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Zustand (State Management)
- Framer Motion (Animations)
- Axios (API Calls)

### Backend
- Node.js + Express
- MongoDB
- JWT Authentication
- Redis (Caching)

### ML Service
- FastAPI (Python)
- Transformers (Hugging Face)
- PyTorch
- XLM-RoBERTa (Multilingual)

## 📦 Project Structure

```
SocialMediaApp/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand stores
│   │   ├── services/        # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/                  # Express server
│   ├── routes/              # API routes
│   ├── models/              # MongoDB schemas
│   ├── middleware/          # Auth & validation
│   ├── server.js
│   └── package.json
├── ml-service/              # FastAPI ML service
│   ├── main.py
│   ├── requirements.txt
│   └── models/              # Trained models
├── .env.example
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.9+
- MongoDB
- Redis (optional)

### 1. Clone & Setup

```bash
cd SocialMediaApp
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

### 3. Backend Setup

```bash
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:5000

### 4. ML Service Setup

**Windows (PowerShell / CMD):**
```powershell
cd ml-service
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python main.py
```

**macOS / Linux:**
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
ML Service runs on: http://localhost:8000

### 5. Database Setup

```bash
# MongoDB should be running on localhost:27017
# Create .env file with:
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your-secret-key
```

## 📝 API Documentation

### Auth Endpoints
```
POST /api/auth/register   - Register new user
POST /api/auth/login      - Login user
GET  /api/auth/me         - Get current user
```

### Post Endpoints
```
GET  /api/posts           - Get all posts
POST /api/posts           - Create post
POST /api/posts/:id/like  - Like post
POST /api/posts/:id/unlike - Unlike post
POST /api/posts/:id/comments - Add comment
```

### User Endpoints
```
GET  /api/users           - Get all users
GET  /api/users/:id       - Get user profile
POST /api/users/:id/follow   - Follow user
POST /api/users/:id/unfollow - Unfollow user
```

### Toxicity Detection
```
POST /detect              - Detect toxicity
POST /suggest-rewrite     - Get rewrite suggestion
```

## 🤖 AI Features Explained

### Toxicity Detection Pipeline

1. **Keyword Matching (30% weight)**
   - Multilingual slang dictionary
   - Regional abusive terms
   - Aggressive emoji patterns

2. **Deep Learning Model (70% weight)**
   - XLM-RoBERTa transformer
   - Multi-label classification
   - Categories: Toxic, Severe Toxic, Obscene, Threat, Identity Hate, Harassment

3. **Final Score Calculation**
   ```
   Score = (Keyword_Score × 0.3) + (Model_Score × 0.7)
   ```

### Warning System

- **Score 0.0 - 0.5**: ✅ Safe - Post directly
- **Score 0.5 - 0.75**: ⚠️ Warning - Show popup, allow edit
- **Score 0.75 - 1.0**: ❌ Blocked - Prevent post, suggest rewrite

### Harassment Detection

- Tracks repeated negative comments on same profile
- Monitors pattern frequency
- Auto-restricts commenting if suspicious activity detected

### Self-Learning

- Admin dashboard reviews flagged comments
- Mark false positives
- Model retrains monthly with feedback
- Community rating improves accuracy

## 🛠 Admin Dashboard Features

```
GET  /api/admin/flagged-comments - View flagged comments
GET  /api/admin/toxicity-stats   - View moderation stats
POST /api/admin/remove-comment   - Remove inappropriate comment
POST /api/admin/retrain          - Trigger model retraining
```

## 📊 Sample Response

```json
{
  "toxicity_score": 0.82,
  "is_toxic": true,
  "categories": {
    "toxic": 0.91,
    "severe_toxic": 0.45,
    "obscene": 0.88,
    "threat": 0.10,
    "identity_hate": 0.20,
    "harassment": 0.75
  },
  "language": "en"
}
```

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcryptjs
- CORS protection
- Input validation
- Rate limiting ready
- XSS protection with React

## 📱 UI Components

- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Eye-friendly interface
- **Animations** - Smooth Framer Motion transitions
- **Toast Notifications** - User feedback system
- **Loading States** - Skeleton screens & spinners

## 🌍 Multilingual Support

- **English** - Full support
- **Hindi** - Devanagari script
- **Telugu** - Regional language
- **Hinglish** - Code-mixed text
- **Mixed Scripts** - Automatic detection

## 📈 Scalability

- Horizontal scaling ready
- Redis caching for toxicity scores
- Database indexing for fast queries
- Async comment processing
- CDN-ready image handling

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

Creates containers for:
- Frontend (Nginx)
- Backend (Node)
- ML Service (Python)
- MongoDB
- Redis

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test

# ML Service tests
cd ml-service
pytest
```

## 📚 Key Libraries

| Library | Purpose |
|---------|---------|
| transformers | Pre-trained NLP models |
| FastAPI | ML service framework |
| Zustand | Lightweight state management |
| Framer Motion | Production animations |
| Axios | HTTP client |
| JWT | Authentication |

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Check if MongoDB is running:
mongod --version
```

### ML Service Port Conflict
```
Change port in ml-service/main.py:
uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Token Expiration
```
Token expires in 7 days by default
Set new token on login
```

## 📖 Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Backend
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your-super-secret-key
PORT=5000

# Frontend
VITE_API_URL=http://localhost:5000/api

# ML Service
ML_API_URL=http://localhost:8000
```

## 🎯 Future Enhancements

- [ ] Video uploads
- [ ] Direct messaging
- [ ] Story features
- [ ] Hashtag system
- [ ] Search functionality
- [ ] Notifications websocket
- [ ] Image filters
- [ ] Live streaming
- [ ] AI content recommendations
- [ ] Advanced analytics

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify all services running

## 📄 License

MIT License - Feel free to use this project!

## 🙏 Contributors

Built with ❤️ for the community

---

**Happy Coding! 🚀**
"# social_toxic_detection_media" 
