import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const cleanUsername = username.trim().toLowerCase()
    const cleanEmail = email.trim().toLowerCase()

    if (await User.findOne({ username: cleanUsername })) {
      return res.status(400).json({ message: 'Username already exists' })
    }

    if (await User.findOne({ email: cleanEmail })) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const user = new User({ 
      username: cleanUsername, 
      email: cleanEmail, 
      password 
    })
    await user.save()

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
        bio: user.bio || '',
        reputationScore: user.reputationScore || 100
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Registration failed', error: error.message })
  }
})

// Login user (supports email or username)
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body
    const identifier = (email || username || '').trim().toLowerCase()

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required' })
    }

    // Try to find user in MongoDB
    try {
      const user = await User.findOne({
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      })

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials. User not found.' })
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' })
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })

      return res.json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || '',
          bio: user.bio || '',
          reputationScore: user.reputationScore || 100
        }
      })
    } catch (dbError) {
      console.error('DB query error during login:', dbError)
      return res.status(500).json({ message: 'Database error during login', error: dbError.message })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

// Current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message })
  }
})

export default router
