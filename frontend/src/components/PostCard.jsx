import React, { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import CommentSection from './CommentSectionEnhanced'
import { usePostStore } from '../store/postStore'
import { toxicityService } from '../services/toxicityService'
import { API_URL } from '../config/api'
import toast from 'react-hot-toast'

const workingVideos = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4',
  'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4'
]

function PostCard({ post }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [doubleLiked, setDoubleLiked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [likes, setLikes] = useState(post.likes || 0)
  const [toxicityAlert, setToxicityAlert] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const videoRef = useRef(null)
  const { likePost, unlikePost, createComment } = usePostStore()

  const getVideoUrl = (post) => {
    if (post.video) return post.video
    if (post.mediaType === 'video' || post.mediaType === 'reel') {
      if (post.image && (post.image.startsWith('data:video') || post.image.endsWith('.mp4'))) return post.image
      const fallbackIndex = Math.abs((post.id || post._id || '1').toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % workingVideos.length
      return workingVideos[fallbackIndex]
    }
    return null
  }

  // Toxicity detection debounce
  useEffect(() => {
    if (!commentText.trim()) {
      setToxicityAlert(null)
      setSuggestion(null)
      return
    }
    const timeoutId = setTimeout(async () => {
      setIsDetecting(true)
      try {
        const result = await toxicityService.detectToxicity(commentText)
        if (result.toxicity_score > 0.75) {
          setToxicityAlert({ level: 'BLOCKED', score: result.toxicity_score })
          const rewrite = await toxicityService.suggestRewrite(commentText)
          if (rewrite) setSuggestion(rewrite)
        } else if (result.toxicity_score > 0.5) {
          setToxicityAlert({ level: 'WARNING', score: result.toxicity_score })
        } else {
          setToxicityAlert(null)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsDetecting(false)
      }
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [commentText])

  const handleImageDoubleClick = () => {
    if (!liked) {
      setLiked(true)
      setLikes(prev => prev + 1)
      likePost(post.id || post._id)
    }
    setDoubleLiked(true)
    setTimeout(() => setDoubleLiked(false), 900)
  }

  const handleLikeToggle = async () => {
    if (liked) {
      setLiked(false)
      setLikes(prev => Math.max(0, prev - 1))
      await unlikePost(post.id || post._id)
    } else {
      setLiked(true)
      setLikes(prev => prev + 1)
      await likePost(post.id || post._id)
    }
  }

  const handleSaveToggle = async () => {
    const targetId = post.id || post._id
    if (!targetId) return
    const nextSaved = !saved
    setSaved(nextSaved)
    try {
      await axios.post(`${API_URL}/users/saved/${targetId}`)
      toast.success(nextSaved ? 'Saved to profile' : 'Removed from saved')
    } catch (err) {
      setSaved(!nextSaved)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    if (toxicityAlert?.level === 'BLOCKED') {
      toast.error('Comment violates community guidelines')
      return
    }

    try {
      await createComment(post.id || post._id, commentText)
      setCommentText('')
      setToxicityAlert(null)
      toast.success('Comment posted!')
    } catch (err) {
      toast.error('Failed to post comment')
    }
  }

  const formatTimeAgo = (date) => {
    if (!date) return '1h'
    const diff = Math.floor((new Date() - new Date(date)) / 1000)
    if (diff < 60) return '1m'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  const togglePostVideo = (e) => {
    e.stopPropagation()
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  return (
    <article className="bg-black border border-[#262626] rounded-lg overflow-hidden mb-5 max-w-ig-feed mx-auto text-[#F5F5F5]">
      {/* Instagram Post Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#262626]">
        <div className="flex items-center space-x-3">
          {/* Story Ring Avatar */}
          <div className="ig-story-ring p-[1.5px]">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-black" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#121212] flex items-center justify-center text-xs font-bold border border-black">
                {post.author?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-xs text-white hover:opacity-80 cursor-pointer">
                {post.author?.username || 'user'}
              </span>
              <span className="text-gray-500 text-xs">• {formatTimeAgo(post.createdAt)}</span>
            </div>
            {post.location && <p className="text-[10px] text-gray-400">{post.location}</p>}
          </div>
        </div>

        <button onClick={() => setShowOptions(!showOptions)} className="text-gray-400 hover:text-white p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Media Canvas */}
      <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[580px] overflow-hidden" onDoubleClick={handleImageDoubleClick}>
        {post.mediaType === 'video' || post.mediaType === 'reel' || post.video ? (
          <video
            ref={videoRef}
            src={getVideoUrl(post)}
            className="w-full h-full max-h-[580px] object-cover bg-black cursor-pointer"
            controls
            preload="metadata"
            onClick={togglePostVideo}
          />
        ) : post.image ? (
          <img src={post.image} alt="post" className="w-full h-full max-h-[580px] object-cover" />
        ) : (
          <div className="w-full h-64 bg-[#121212] flex items-center justify-center text-gray-500 text-sm">
            {post.caption}
          </div>
        )}

        {/* Double Tap Heart Particle Animation */}
        <AnimatePresence>
          {doubleLiked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instagram Action Icons Bar */}
      <div className="px-3 pt-3 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={handleLikeToggle} className="hover:opacity-60 transition">
              <Heart className={`w-6 h-6 ${liked ? 'text-ig-red fill-ig-red' : 'text-white'}`} />
            </button>
            <button onClick={() => setShowComments(!showComments)} className="hover:opacity-60 transition">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
            <button className="hover:opacity-60 transition">
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
          <button onClick={handleSaveToggle} className="hover:opacity-60 transition">
            <Bookmark className={`w-6 h-6 ${saved ? 'text-white fill-white' : 'text-white'}`} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="text-xs font-semibold text-white">
          {likes} {likes === 1 ? 'like' : 'likes'}
        </div>

        {/* Inline Handle + Caption */}
        <div className="text-xs text-white leading-normal">
          <span className="font-semibold mr-1.5">{post.author?.username || 'user'}</span>
          <span>{post.caption}</span>
        </div>

        {/* Comment Preview */}
        {post.comments && post.comments.length > 0 && (
          <div>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-500 text-xs hover:text-gray-400 transition"
            >
              View all {post.comments.length} comments
            </button>
          </div>
        )}

        {/* Add Comment Input Bar */}
        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 pt-2 border-t border-[#262626]">
          <Smile className="w-5 h-5 text-gray-400 cursor-pointer" />
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          {commentText.trim() && (
            <button
              type="submit"
              disabled={isDetecting || toxicityAlert?.level === 'BLOCKED'}
              className="text-ig-blue font-semibold text-xs hover:text-ig-blue-hover disabled:opacity-40"
            >
              Post
            </button>
          )}
        </form>

        {/* Community Warning Overlay */}
        {toxicityAlert && (
          <div className={`p-2 rounded text-xs mt-1 border ${toxicityAlert.level === 'BLOCKED' ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-amber-900/30 border-amber-700 text-amber-300'}`}>
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{toxicityAlert.level === 'BLOCKED' ? 'Comment violates community guidelines' : 'Warning: Comment might offend others'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Comment Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-[#262626] p-3">
            <CommentSection postId={post.id || post._id} showComments={showComments} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}

export default PostCard
