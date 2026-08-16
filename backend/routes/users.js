import express from 'express'
import User from '../models/User.js'
import Post from '../models/Post.js'
import Notification from '../models/Notification.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET /api/users - List users
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    res.json(users || [])
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// PUT /api/users/profile - Update current user profile & DP (avatar, bio, username, fullName)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, fullName, bio, avatar, website } = req.body
    const userId = req.userId

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase()
      const existing = await User.findOne({ username: cleanUsername })
      if (existing && existing._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: 'Username is already taken' })
      }
      user.username = cleanUsername
    }

    if (fullName !== undefined) user.fullName = fullName.trim()
    if (bio !== undefined) user.bio = bio.trim()
    if (avatar !== undefined) user.avatar = avatar
    if (website !== undefined) user.website = website.trim()

    await user.save()

    const updatedUser = await User.findById(userId).select('-password')
    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ message: 'Failed to update profile', error: error.message })
  }
})

// GET /api/users/:userId - Get full profile + user posts
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId).select('-password').lean()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Fetch posts created by this user
    const posts = await Post.find({ author: userId })
      .populate('author', 'username avatar fullName')
      .populate('comments.author', 'username avatar fullName')
      .sort({ createdAt: -1 })
      .lean()

    // Fetch saved posts if any
    let savedPosts = []
    if (user.savedPosts && user.savedPosts.length > 0) {
      savedPosts = await Post.find({ _id: { $in: user.savedPosts } })
        .populate('author', 'username avatar fullName')
        .lean()
    }

    res.json({
      ...user,
      posts: posts || [],
      savedPosts: savedPosts || []
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

// POST /api/users/:userId/follow - Follow user (Dynamic MongoDB)
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const currentUserId = req.userId

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' })
    }

    const targetUser = await User.findById(targetUserId)
    const currentUser = await User.findById(currentUserId)

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!targetUser.followers.some(id => id.toString() === currentUserId.toString())) {
      targetUser.followers.push(currentUserId)
      await targetUser.save()
    }

    if (!currentUser.following.some(id => id.toString() === targetUserId.toString())) {
      currentUser.following.push(targetUserId)
      await currentUser.save()

      // Notify target user
      try {
        await Notification.create({
          recipient: targetUserId,
          sender: currentUserId,
          type: 'follow'
        })
      } catch (notifErr) {
        console.warn('Follow notification note:', notifErr.message)
      }
    }

    res.json({
      message: 'Followed successfully',
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    })
  } catch (error) {
    console.error('Follow error:', error)
    res.status(500).json({ message: 'Failed to follow user' })
  }
})

// POST /api/users/:userId/unfollow - Unfollow user (Dynamic MongoDB)
router.post('/:userId/unfollow', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const currentUserId = req.userId

    const targetUser = await User.findById(targetUserId)
    const currentUser = await User.findById(currentUserId)

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString())
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString())

    await targetUser.save()
    await currentUser.save()

    res.json({
      message: 'Unfollowed successfully',
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    })
  } catch (error) {
    console.error('Unfollow error:', error)
    res.status(500).json({ message: 'Failed to unfollow user' })
  }
})

// POST /api/users/saved/:postId - Save/Unsave post bookmark (Dynamic MongoDB)
router.post('/saved/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params
    const user = await User.findById(req.userId)

    if (!user) return res.status(404).json({ message: 'User not found' })

    const isAlreadySaved = user.savedPosts.some(id => id.toString() === postId.toString())

    if (isAlreadySaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId.toString())
      await user.save()
      return res.json({ message: 'Post unsaved', isSaved: false })
    } else {
      user.savedPosts.push(postId)
      await user.save()
      return res.json({ message: 'Post saved', isSaved: true })
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to save post' })
  }
})

export default router
