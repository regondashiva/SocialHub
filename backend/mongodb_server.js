const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
require('dotenv').config()
const User = require('./models/User')
const Post = require('./models/Post')

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this'

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas')
}).catch((error) => {
  console.error('MongoDB connection error:', error)
  console.log('Falling back to in-memory mode...')
  
  // Fallback to in-memory mode if MongoDB fails
  const simpleServer = require('./simple_server')
  console.log('Starting in in-memory mode...')
})

// JWT Middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    const user = new User({ username, email, password })
    await user.save()
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Post Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
    
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/posts', verifyToken, async (req, res) => {
  try {
    const { caption, image, video, mediaType, duration } = req.body
    
    const post = new Post({
      author: req.userId,
      caption,
      image: image || (mediaType !== 'video' && mediaType !== 'reel' ? `https://picsum.photos/seed/${Date.now()}/400/400.jpg` : null),
      video: video || null,
      mediaType: mediaType || 'image',
      duration: duration || null,
      thumbnail: (mediaType === 'video' || mediaType === 'reel') ? `https://picsum.photos/seed/thumb${Date.now()}/400/400.jpg` : null
    })
    
    await post.save()
    await post.populate('author', 'username avatar')
    
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Comments Routes
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    
    // Get comments from the post's comments array
    const comments = post.comments || []
    res.json(comments)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/posts/:id/comments', verifyToken, async (req, res) => {
  try {
    const { text } = req.body
    
    // Check toxicity with ML service
    let toxicityScore = 0
    let toxicityCategories = {}
    
    try {
      const mlResponse = await fetch('http://localhost:8000/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'auto' })
      })
      
      const toxicityResult = await mlResponse.json()
      toxicityScore = toxicityResult.toxicity_score || 0
      toxicityCategories = toxicityResult.categories || {}
    } catch (error) {
      console.error('ML service error:', error)
    }
    
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    
    const user = await User.findById(req.userId)
    
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      author: {
        username: user.username,
        avatar: user.avatar
      },
      text,
      toxicityScore,
      toxicityCategories,
      createdAt: new Date()
    }
    
    post.comments.push(newComment)
    await post.save()
    
    res.status(201).json(newComment)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Like Routes
app.post('/api/posts/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    
    const userId = req.userId
    const isLiked = post.likedBy.includes(userId)
    
    if (isLiked) {
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString())
      post.likes = Math.max(0, post.likes - 1)
    } else {
      post.likedBy.push(userId)
      post.likes += 1
    }
    
    await post.save()
    res.json({ liked: !isLiked, likes: post.likes })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Users Route
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('username avatar followers following')
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running (MongoDB mode)' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log('Connected to MongoDB Atlas database')
})
