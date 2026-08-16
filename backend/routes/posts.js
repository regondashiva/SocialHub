import express from 'express'
import mongoose from 'mongoose'
import Post from '../models/Post.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Sample high-quality initial reels and posts for seeding empty database
const INITIAL_SEED_POSTS = [
  {
    caption: 'Big Buck Bunny animation premiere! 🎬 Hope you enjoy this classic 3D reel.',
    mediaType: 'reel',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&h=800&fit=crop',
    duration: 60,
    likes: 42,
    location: 'Open Source Studio'
  },
  {
    caption: 'Elephants Dream cinematic preview 🌌 Stunning visual lighting test.',
    mediaType: 'reel',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=800&fit=crop',
    duration: 90,
    likes: 68,
    location: 'Amsterdam, Netherlands'
  },
  {
    caption: 'For Bigger Blazes 🏎️ High speed drone action shot in 4K.',
    mediaType: 'reel',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=800&fit=crop',
    duration: 45,
    likes: 125,
    location: 'California Coast'
  },
  {
    caption: 'Exploring modern web architecture with React, Express, and AI moderation 💻✨ #SocialHub #Tech',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&h=800&fit=crop',
    likes: 89,
    location: 'San Francisco, CA'
  },
  {
    caption: 'Golden hour in the mountains 🏔️ Never stop wandering.',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&h=800&fit=crop',
    likes: 142,
    location: 'Swiss Alps'
  }
]

// Helper: Seed initial posts into MongoDB if collection is empty
async function autoSeedIfEmpty() {
  try {
    const count = await Post.countDocuments()
    if (count === 0) {
      console.log('🌱 Database has 0 posts. Auto-seeding initial posts and reels...')
      let demoUser = await User.findOne()
      if (!demoUser) {
        demoUser = await User.create({
          username: 'alex_dev',
          email: 'alex_dev@socialhub.com',
          password: 'Password123!',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
          bio: 'Fullstack Engineer & Content Creator 🚀'
        })
      }

      for (const p of INITIAL_SEED_POSTS) {
        await Post.create({
          author: demoUser._id,
          ...p,
          comments: [
            {
              _id: new mongoose.Types.ObjectId(),
              author: demoUser._id,
              text: 'Welcome to SocialHub! Drop your thoughts below 👇',
              toxicityScore: 0,
              createdAt: new Date()
            }
          ]
        })
      }
      console.log('✅ Initial posts and reels seeded successfully!')
    }
  } catch (e) {
    console.warn('Auto-seed check note:', e.message)
  }
}

// GET all posts & reels (dynamic from MongoDB)
router.get('/', async (req, res) => {
  try {
    await autoSeedIfEmpty()

    const posts = await Post.find({ isVisible: { $ne: false } })
      .populate('author', 'username avatar fullName')
      .populate('comments.author', 'username avatar fullName')
      .sort({ createdAt: -1 })
      .lean()

    res.json(posts || [])
  } catch (error) {
    console.error('Error fetching posts:', error)
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message })
  }
})

// GET single post
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username avatar fullName')
      .populate('comments.author', 'username avatar fullName')

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.json(post)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message })
  }
})

// CREATE new post or reel (saves dynamically to MongoDB)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { caption, mediaType, image, video, thumbnail, duration, location, feeling } = req.body

    const post = new Post({
      author: req.userId,
      caption: caption || '',
      mediaType: mediaType || (video ? 'video' : 'image'),
      image: image || '',
      video: video || '',
      thumbnail: thumbnail || (image ? image : ''),
      duration: duration || null,
      location: location || '',
      feeling: feeling || '',
      likes: 0,
      likedBy: [],
      comments: []
    })

    await post.save()
    const populated = await Post.findById(post._id).populate('author', 'username avatar fullName')

    res.status(201).json(populated)
  } catch (error) {
    console.error('Failed to create post:', error)
    res.status(500).json({ message: 'Failed to create post', error: error.message })
  }
})

// UPDATE post (e.g. video URL or caption)
router.put('/:postId', authMiddleware, async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(
      req.params.postId,
      { $set: req.body },
      { new: true }
    ).populate('author', 'username avatar fullName')

    if (!updated) return res.status(404).json({ message: 'Post not found' })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update post', error: error.message })
  }
})

// DELETE post
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    await Post.findByIdAndDelete(req.params.postId)
    res.json({ message: 'Post deleted successfully', postId: req.params.postId })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post', error: error.message })
  }
})

// LIKE post
router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (!post.likedBy.some(id => id.toString() === req.userId.toString())) {
      post.likedBy.push(req.userId)
      post.likes = post.likedBy.length
      await post.save()
    }

    res.json({ likes: post.likes })
  } catch (error) {
    res.status(500).json({ message: 'Failed to like post' })
  }
})

// UNLIKE post
router.post('/:postId/unlike', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    post.likedBy = post.likedBy.filter(id => id.toString() !== req.userId.toString())
    post.likes = post.likedBy.length
    await post.save()

    res.json({ likes: post.likes })
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlike post' })
  }
})

// GET comments for a post
router.get('/:postId/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('comments.author', 'username avatar fullName')
      .select('comments')

    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json(post.comments || [])
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch comments' })
  }
})

// POST new comment with toxicity check
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const { text, toxicityScore, toxicityCategories, detectedKeywords } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' })
    }

    const score = Number(toxicityScore) || 0

    // Block highly toxic comments on server
    if (score >= 0.75) {
      return res.status(400).json({ 
        message: 'Comment blocked: violates community safety guidelines',
        toxicityScore: score,
        isBlocked: true
      })
    }

    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const commentId = new mongoose.Types.ObjectId()
    const user = await User.findById(req.userId)

    const newComment = {
      _id: commentId,
      author: req.userId,
      text: text.trim(),
      toxicityScore: score,
      toxicityCategories: toxicityCategories || {},
      detectedKeywords: detectedKeywords || [],
      createdAt: new Date()
    }

    post.comments.push(newComment)
    await post.save()

    // Return populated comment
    const responseComment = {
      ...newComment,
      author: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar || '',
        fullName: user.fullName || user.username
      }
    }

    res.status(201).json(responseComment)
  } catch (error) {
    console.error('Comment error:', error)
    res.status(500).json({ message: 'Failed to post comment', error: error.message })
  }
})

// DELETE comment
router.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const post = await Post.findById(postId)

    if (!post) return res.status(404).json({ message: 'Post not found' })

    post.comments = post.comments.filter(c => c._id.toString() !== commentId.toString())
    await post.save()

    res.json({ message: 'Comment deleted successfully', commentId })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment', error: error.message })
  }
})

// PUT (Edit) comment
router.put('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const { text, toxicityScore, toxicityCategories } = req.body

    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const comment = post.comments.id(commentId)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    if (text) comment.text = text
    if (typeof toxicityScore === 'number') comment.toxicityScore = toxicityScore
    if (toxicityCategories) comment.toxicityCategories = toxicityCategories

    await post.save()
    res.json(comment)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit comment', error: error.message })
  }
})

export default router
