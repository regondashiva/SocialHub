import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import storyRoutes from './routes/stories.js'
import userRoutes from './routes/users.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Determine allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : []),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : [])
]

// CORS middleware configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true)
    
    // In development or if wildcard is enabled
    if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true)
    }

    // Check if origin matches allowed list or vercel/netlify/render subdomains
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*' || origin === allowed) return true
      try {
        const allowedHost = new URL(allowed).hostname
        const originHost = new URL(origin).hostname
        return originHost === allowedHost || originHost.endsWith('.vercel.app') || originHost.endsWith('.netlify.app') || originHost.endsWith('.onrender.com')
      } catch (e) {
        return false
      }
    })

    if (isAllowed) {
      return callback(null, true)
    }
    return callback(null, true) // Permissive fallback for seamless deployment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialmedia'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    console.warn('⚠️ Please check your MONGODB_URI in production environment settings.')
  })

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)

// Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'SocialHub API Server is running',
    version: '1.0.0',
    status: 'online',
    endpoints: ['/api/auth', '/api/posts', '/api/stories', '/api/users', '/api/admin', '/api/health']
  })
})

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbState] || 'unknown'

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  })
})

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server ready and listening on port ${PORT}`)
})
