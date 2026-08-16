import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// In-memory storage
let users = []
let posts = []
let comments = []
let likes = []
let userIdCounter = 1
let postIdCounter = 1
let commentIdCounter = 1

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Helper functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' })
}

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    req.userId = decoded.userId
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
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = {
      id: userIdCounter++,
      username,
      email,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      followers: [],
      following: [],
      createdAt: new Date()
    }
    
    users.push(user)
    
    const token = generateToken(user.id)
    
    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
      token
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    
    const token = generateToken(user.id)
    
    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
      token
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/auth/me', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  
  res.json({
    user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar }
  })
})

// Post Routes
app.get('/api/posts', (req, res) => {
  const postsWithUsers = posts.map(post => {
    const user = users.find(u => u.id === post.userId)
    return {
      ...post,
      author: user ? { id: user.id, username: user.username, avatar: user.avatar } : null,
      likes: likes.filter(l => l.postId === post.id).length,
      comments: comments.filter(c => c.postId === post.id).length,
      isLiked: false // Would need auth middleware to check actual like status
    }
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  res.json(postsWithUsers)
})

app.post('/api/posts', verifyToken, (req, res) => {
  const { caption, image, video, mediaType, duration } = req.body
  
  const post = {
    id: postIdCounter++,
    userId: req.userId,
    caption,
    mediaType: mediaType || 'image', // 'image', 'video', 'reel'
    image: image || (mediaType !== 'video' && mediaType !== 'reel' ? `https://picsum.photos/seed/${postIdCounter}/400/400.jpg` : null),
    video: video || null,
    thumbnail: (mediaType === 'video' || mediaType === 'reel') ? `https://picsum.photos/seed/thumb${postIdCounter}/400/400.jpg` : null,
    duration: duration || null,
    createdAt: new Date()
  }
  
  posts.push(post)
  res.json(post)
})

// Get comments for a post
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id)
  const postComments = comments.filter(c => c.postId === postId)
  
  const commentsWithUsers = postComments.map(comment => {
    const user = users.find(u => u.id === comment.userId)
    return {
      ...comment,
      author: user ? { username: user.username, avatar: user.avatar } : { username: 'Unknown', avatar: 'https://ui-avatars.com/api/?name=unknown&background=random' }
    }
  }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  
  res.json(commentsWithUsers)
})

app.post('/api/posts/:id/like', verifyToken, (req, res) => {
  const postId = parseInt(req.params.id)
  const existingLike = likes.find(l => l.postId === postId && l.userId === req.userId)
  
  if (existingLike) {
    likes = likes.filter(l => !(l.postId === postId && l.userId === req.userId))
    res.json({ liked: false })
  } else {
    likes.push({ postId, userId: req.userId, createdAt: new Date() })
    res.json({ liked: true })
  }
})

app.post('/api/posts/:id/comments', verifyToken, async (req, res) => {
  const postId = parseInt(req.params.id)
  const { text } = req.body
  
  // Check toxicity with ML service
  try {
    const mlResponse = await fetch('http://localhost:8000/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: 'auto' })
    })
    
    const toxicityResult = await mlResponse.json()
    
    if (toxicityResult.is_toxic) {
      return res.status(400).json({ 
        error: 'Comment contains toxic content',
        toxicity_score: toxicityResult.toxicity_score
      })
    }
  } catch (error) {
    console.log('ML service unavailable, allowing comment')
  }
  
  const comment = {
    id: commentIdCounter++,
    postId,
    userId: req.userId,
    text,
    createdAt: new Date()
  }
  
  comments.push(comment)
  
  const user = users.find(u => u.id === req.userId)
  res.json({
    ...comment,
    user: { id: user.id, username: user.username, avatar: user.avatar }
  })
})

// User Routes
app.get('/api/users', (req, res) => {
  const userList = users.map(user => ({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    followers: user.followers.length,
    following: user.following.length
  }))
  res.json(userList)
})

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id))
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  
  const userPosts = posts.filter(p => p.userId === user.id)
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    followers: user.followers.length,
    following: user.following.length,
    posts: userPosts.length,
    posts: userPosts.map(post => ({
      ...post,
      likes: likes.filter(l => l.postId === post.id).length,
      comments: comments.filter(c => c.postId === post.id).length
    }))
  })
})

app.post('/api/users/:id/follow', verifyToken, (req, res) => {
  const targetUserId = parseInt(req.params.id)
  const currentUserId = req.userId
  
  if (targetUserId === currentUserId) {
    return res.status(400).json({ error: 'Cannot follow yourself' })
  }
  
  const targetUser = users.find(u => u.id === targetUserId)
  const currentUser = users.find(u => u.id === currentUserId)
  
  if (!targetUser || !currentUser) {
    return res.status(404).json({ error: 'User not found' })
  }
  
  if (currentUser.following.includes(targetUserId)) {
    // Unfollow
    currentUser.following = currentUser.following.filter(id => id !== targetUserId)
    targetUser.followers = targetUser.followers.filter(id => id !== currentUserId)
    res.json({ following: false })
  } else {
    // Follow
    currentUser.following.push(targetUserId)
    targetUser.followers.push(currentUserId)
    res.json({ following: true })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running (in-memory mode)' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT} (in-memory mode)`)
  console.log('Note: Using in-memory storage. Data will be lost on restart.')
})
