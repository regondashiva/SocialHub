import express from 'express'
import Notification from '../models/Notification.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET /api/notifications - Get current user notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate('sender', 'username avatar fullName')
      .populate('post', 'caption image video thumbnail')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      read: false
    })

    res.json({
      notifications: notifications || [],
      unreadCount
    })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

// PUT /api/notifications/read - Mark all as read
router.put('/read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { $set: { read: true } }
    )
    res.json({ message: 'Notifications marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notifications read' })
  }
})

export default router
