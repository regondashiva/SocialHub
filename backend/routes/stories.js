import express from 'express'
import Story from '../models/Story.js'
import { authMiddleware } from '../middleware/auth.js'
import mongoose from 'mongoose'

const router = express.Router()

// GET /api/stories - Fetch active stories grouped by user
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })

    // Group stories by author username
    const groupedMap = {}

    stories.forEach(story => {
      if (!story.author) return
      const authorId = story.author._id.toString()

      if (!groupedMap[authorId]) {
        groupedMap[authorId] = {
          id: authorId,
          username: story.author.username,
          avatar: story.author.avatar || '',
          hasStory: true,
          viewed: false,
          content: []
        }
      }

      groupedMap[authorId].content.push({
        id: story._id,
        type: story.mediaType || 'image',
        url: story.url,
        duration: story.duration || 5000,
        createdAt: story.createdAt
      })
    })

    const result = Object.values(groupedMap)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stories', error: error.message })
  }
})

// POST /api/stories - Upload new story
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { mediaType, url, duration } = req.body

    if (!url) {
      return res.status(400).json({ message: 'Media URL or data URI is required' })
    }

    const story = new Story({
      author: req.userId,
      mediaType: mediaType || 'image',
      url,
      duration: duration || 5000
    })

    await story.save()
    await story.populate('author', 'username avatar')

    res.status(201).json(story)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create story', error: error.message })
  }
})

// DELETE /api/stories/:storyId - Delete own story
router.delete('/:storyId', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId)
    if (!story) return res.status(404).json({ message: 'Story not found' })

    if (story.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this story' })
    }

    await Story.findByIdAndDelete(req.params.storyId)
    res.json({ message: 'Story deleted successfully', storyId: req.params.storyId })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete story' })
  }
})

export default router
