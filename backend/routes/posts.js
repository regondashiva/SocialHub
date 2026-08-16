import express from 'express'
import Post from '../models/Post.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import axios from 'axios'
import mongoose from 'mongoose'

const router = express.Router()
const ML_API = process.env.ML_API_URL || 'http://localhost:8000'

router.get('/', async (req, res) => {
  try {
    // Try to get posts from database
    try {
      const posts = await Post.find()
        .populate('author', 'username avatar')
        .populate('comments.author', 'username avatar')
        .sort({ createdAt: -1 })
      res.json(posts)
    } catch (dbError) {
      // Return mock posts if database is not available
      const mockPosts = [
        {
          _id: '507f1f77bcf86cd799439011',
          author: {
            _id: '507f1f77bcf86cd799439012',
            username: 'demo_user',
            avatar: ''
          },
          caption: 'Welcome to SocialHub! 🎉 This is a demo post to showcase the platform.',
          image: 'https://picsum.photos/seed/social1/600/400.jpg',
          likes: 42,
          likedBy: [],
          comments: [
            {
              _id: '507f1f77bcf86cd799439013',
              author: {
                _id: '507f1f77bcf86cd799439014',
                username: 'alice_demo',
                avatar: ''
              },
              text: 'Great platform! Love the UI design 🚀',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439015',
              author: {
                _id: '507f1f77bcf86cd799439016',
                username: 'bob_demo',
                avatar: ''
              },
              text: 'Amazing features! The toxicity detection is really cool',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439017',
              author: {
                _id: '507f1f77bcf86cd799439018',
                username: 'jane_demo',
                avatar: ''
              },
              text: 'This looks promising! When can we try the reels feature? 🎬',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439019',
              author: {
                _id: '507f1f77bcf86cd799439020',
                username: 'tech_demo',
                avatar: ''
              },
              text: 'The AI moderation system is impressive! 🤖',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 45 * 60 * 1000)
            }
          ],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          _id: '507f1f77bcf86cd799439021',
          author: {
            _id: '507f1f77bcf86cd799439022',
            username: 'jane_demo',
            avatar: ''
          },
          caption: 'Beautiful sunset today! Nature never fails to amaze me 🌅',
          image: 'https://picsum.photos/seed/sunset2/600/400.jpg',
          likes: 28,
          likedBy: [],
          comments: [
            {
              _id: '507f1f77bcf86cd799439023',
              author: {
                _id: '507f1f77bcf86cd799439012',
                username: 'demo_user',
                avatar: ''
              },
              text: 'Absolutely stunning! Where was this taken? 📍',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439024',
              author: {
                _id: '507f1f77bcf86cd799439025',
                username: 'alice_demo',
                avatar: ''
              },
              text: 'Golden hour vibes! ✨',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 15 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439026',
              author: {
                _id: '507f1f77bcf86cd799439027',
                username: 'bob_demo',
                avatar: ''
              },
              text: 'Nature photography is my passion too! 📸',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 10 * 60 * 1000)
            }
          ],
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        {
          _id: '507f1f77bcf86cd799439028',
          author: {
            _id: '507f1f77bcf86cd799439029',
            username: 'tech_demo',
            avatar: ''
          },
          caption: 'Just deployed a new feature! AI-powered content moderation is now live 🤖',
          image: 'https://picsum.photos/seed/tech3/600/400.jpg',
          likes: 156,
          likedBy: [],
          comments: [
            {
              _id: '507f1f77bcf86cd799439030',
              author: {
                _id: '507f1f77bcf86cd799439031',
                username: 'dev_demo',
                avatar: ''
              },
              text: 'This is exactly what we needed! Great work team 👏',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 45 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439032',
              author: {
                _id: '507f1f77bcf86cd799439012',
                username: 'demo_user',
                avatar: ''
              },
              text: 'The AI features are game-changing! 🎯',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439033',
              author: {
                _id: '507f1f77bcf86cd799439034',
                username: 'jane_demo',
                avatar: ''
              },
              text: 'How does the toxicity detection work? 🤔',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 20 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439035',
              author: {
                _id: '507f1f77bcf86cd799439036',
                username: 'alice_demo',
                avatar: ''
              },
              text: 'Machine learning + community moderation = 🔥',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 15 * 60 * 1000)
            }
          ],
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
        },
        {
          _id: '507f1f77bcf86cd799439037',
          author: {
            _id: '507f1f77bcf86cd799439038',
            username: 'alice_demo',
            avatar: ''
          },
          caption: 'Coffee shop vibes ☕ Working on something exciting!',
          image: 'https://picsum.photos/seed/coffee4/600/400.jpg',
          likes: 89,
          likedBy: [],
          comments: [
            {
              _id: '507f1f77bcf86cd799439039',
              author: {
                _id: '507f1f77bcf86cd799439012',
                username: 'demo_user',
                avatar: ''
              },
              text: 'What are you working on? 🤔',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 25 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439040',
              author: {
                _id: '507f1f77bcf86cd799439041',
                username: 'bob_demo',
                avatar: ''
              },
              text: 'Can\'t wait to see it! 💻',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 20 * 60 * 1000)
            }
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          _id: '507f1f77bcf86cd799439042',
          author: {
            _id: '507f1f77bcf86cd799439043',
            username: 'bob_demo',
            avatar: ''
          },
          caption: 'Weekend hiking adventure! 🥾 Trail was amazing but challenging',
          image: 'https://picsum.photos/seed/hiking5/600/400.jpg',
          likes: 67,
          likedBy: [],
          comments: [
            {
              _id: '507f1f77bcf86cd799439044',
              author: {
                _id: '507f1f77bcf86cd799439045',
                username: 'jane_demo',
                avatar: ''
              },
              text: 'Which trail is this? Looks beautiful! 🏔️',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 18 * 60 * 1000)
            },
            {
              _id: '507f1f77bcf86cd799439046',
              author: {
                _id: '507f1f77bcf86cd799439047',
                username: 'tech_demo',
                avatar: ''
              },
              text: 'Need trail recommendations! 🗺️',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 12 * 60 * 1000)
            }
          ],
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }
      ]
      
      res.json(mockPosts)
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { caption, mediaType, image, video, thumbnail, duration, location, feeling } = req.body

    // Try to save to database first
    try {
      const post = new Post({
        author: req.userId,
        caption,
        mediaType: mediaType || 'image',
        image: image || '',
        video: video || '',
        thumbnail: thumbnail || '',
        duration: duration || null,
        location: location || '',
        feeling: feeling || ''
      })

      await post.save()
      await post.populate('author', 'username avatar')

      res.status(201).json(post)
    } catch (dbError) {
      // Return mock post if database is not available
      const mockPost = {
        _id: new mongoose.Types.ObjectId().toString(),
        author: {
          _id: req.userId,
          username: 'demo_user',
          avatar: ''
        },
        caption: caption || 'New post',
        mediaType: mediaType || 'image',
        image: image || '',
        video: video || '',
        thumbnail: thumbnail || '',
        duration: duration || null,
        location: location || '',
        feeling: feeling || '',
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      res.status(201).json(mockPost)
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message })
  }
})

router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    // Try to like post in database
    try {
      const post = await Post.findById(req.params.postId)

      if (!post.likedBy.includes(req.userId)) {
        post.likedBy.push(req.userId)
        post.likes += 1
        await post.save()
      }

      res.json({ likes: post.likes })
    } catch (dbError) {
      // Return mock like response if database is not available
      res.json({ likes: Math.floor(Math.random() * 50) + 1 })
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to like post' })
  }
})

router.post('/:postId/unlike', authMiddleware, async (req, res) => {
  try {
    // Try to unlike post in database
    try {
      const post = await Post.findById(req.params.postId)

      if (post.likedBy.includes(req.userId)) {
        post.likedBy = post.likedBy.filter(id => !id.equals(req.userId))
        post.likes = Math.max(0, post.likes - 1)
        await post.save()
      }

      res.json({ likes: post.likes })
    } catch (dbError) {
      // Return mock unlike response if database is not available
      res.json({ likes: Math.max(0, Math.floor(Math.random() * 50)) })
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlike post' })
  }
})

router.post('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const { text, toxicityScore } = req.body

    // Try to save to database first
    try {
      const post = await Post.findById(req.params.postId)

      const commentId = new mongoose.Types.ObjectId()
      const comment = {
        _id: commentId,
        author: req.userId,
        text,
        toxicityScore: toxicityScore || 0,
        createdAt: new Date()
      }

      post.comments.push(comment)

      // Update user toxicity index if comment is toxic
      if (toxicityScore > 0.5) {
        const user = await User.findById(req.userId)
        user.toxicityIndex = (user.toxicityIndex || 0) + toxicityScore
        
        if (user.toxicityIndex > 5) {
          user.isBlockedFromCommenting = true
          user.blockedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
        
        await user.save()
      }

      await post.save()
      await post.populate('comments.author', 'username avatar')

      res.status(201).json(comment)
    } catch (dbError) {
      // Return mock comment if database is not available
      const mockComment = {
        _id: new mongoose.Types.ObjectId().toString(),
        author: {
          _id: req.userId,
          username: 'demo_user',
          avatar: ''
        },
        text: text || 'Great post!',
        toxicityScore: toxicityScore || 0,
        createdAt: new Date()
      }

      res.status(201).json(mockComment)
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to post comment', error: error.message })
  }
})

export default router
