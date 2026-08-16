import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Username already exists' })
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const user = new User({ username, email, password })
    await user.save()

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        reputationScore: user.reputationScore
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Mock user for testing when MongoDB is not available
    if (email === 'demo@socialhub.com' && password === 'demo123') {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'demo_user',
        email: 'demo@socialhub.com',
        reputationScore: 100
      }

      const token = jwt.sign({ userId: mockUser._id }, JWT_SECRET, { expiresIn: '7d' })

      return res.json({
        token,
        user: mockUser
      })
    }

    // Try to find user in database (will fail if MongoDB is not running)
    try {
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })

      res.json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          reputationScore: user.reputationScore
        }
      })
    } catch (dbError) {
      return res.status(401).json({ message: 'Invalid credentials or database not available' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Return mock user if it's the demo user
    if (req.userId === '507f1f77bcf86cd799439011') {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'demo_user',
        email: 'demo@socialhub.com',
        reputationScore: 100,
        followers: [],
        following: [],
        bio: 'Demo user for testing',
        avatar: ''
      }
      return res.json(mockUser)
    }

    const user = await User.findById(req.userId).select('-password')
    res.json(user)
  } catch (error) {
    // Return mock user if database is not available
    if (req.userId === '507f1f77bcf86cd799439011') {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'demo_user',
        email: 'demo@socialhub.com',
        reputationScore: 100,
        followers: [],
        following: [],
        bio: 'Demo user for testing',
        avatar: ''
      }
      return res.json(mockUser)
    }
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

export default router
