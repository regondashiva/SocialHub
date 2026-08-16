import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'reel'],
    default: 'image'
  },
  image: {
    type: String,
    default: ''
  },
  video: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: null
  },
  location: {
    type: String,
    default: ''
  },
  feeling: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    _id: mongoose.Schema.Types.ObjectId,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    toxicityScore: Number,
    toxicityCategories: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
  }],
  toxicityScore: {
    type: Number,
    default: 0
  },
  toxicityFlag: {
    type: Boolean,
    default: false
  },
  flaggedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVisible: {
    type: Boolean,
    default: true
  },
  tags: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Post', postSchema)

