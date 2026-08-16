import React, { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile, AlertTriangle, Share2, Copy, Link2, X } from 'lucide-react'
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
  const [showShareModal, setShowShareModal] = useState(false)
  const [doubleLiked, setDoubleLiked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [likes, setLikes] = useState(post.likes || 0)
  const [toxicityAlert, setToxicityAlert] = useState(null)
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
      return
    }
    const timeoutId = setTimeout(async () => {
      setIsDetecting(true)
      try {
        const result = await toxicityService.detectToxicity(commentText)
        if (result.toxicity_score >= 0.75) {
          setToxicityAlert({ level: 'BLOCKED', score: result.toxicity_score })
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

    // Synchronous toxicity validation before submission
    const toxicResult = await toxicityService.detectToxicity(commentText)
    if (toxicResult.is_toxic || toxicResult.toxicity_score >= 0.5) {
      toast.error('🚫 Comment blocked: Contains offensive words. Please rewrite.')
      return
    }

    try {
      await createComment(post.id || post._id, commentText)
      setCommentText('')
      setToxicityAlert(null)
      toast.success('Comment posted!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post comment'
      toast.error(msg)
    }
  }

  const handleShareClick = () => {
    const postUrl = `${window.location.origin}/?post=${post.id || post._id}`
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.author?.username || 'user'} on SocialHub`,
        text: post.caption || 'Check out this post on SocialHub!',
        url: postUrl
      }).then(() => toast.success('Shared!')).catch(() => setShowShareModal(true))
    } else {
      setShowShareModal(true)
    }
  }

  const copyPostLink = () => {
    const postUrl = `${window.location.origin}/?post=${post.id || post._id}`
    navigator.clipboard.writeText(postUrl)
    toast.success('Link copied to clipboard! 📋')
    setShowShareModal(false)
  }

  const formatTimeAgo = (date) => {
    if (!date) return '1h'
    const diff = Math.floor((new Date() - new Date(date)) / 1000)
    if (diff < 60) return '1m'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  const isVideoPost = post.mediaType === 'video' || post.mediaType === 'reel' || !!post.video
  const videoUrl = getVideoUrl(post)

  return (
    <article className="w-full bg-black border border-[#262626] rounded-xl overflow-hidden mb-4 relative">
      {/* Instagram Post Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author?.username}
                className="w-8 h-8 rounded-full object-cover border border-black"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-xs font-bold text-white border border-black">
                {post.author?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-xs text-white">{post.author?.username || 'user'}</span>
              <span className="text-gray-500 text-xs">• {formatTimeAgo(post.createdAt)}</span>
            </div>
            {post.location && (
              <span className="text-[10px] text-gray-400 block">{post.location}</span>
            )}
          </div>
        </div>
        <button onClick={handleShareClick} className="text-gray-400 hover:text-white p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Main Media Canvas (Image or Video) */}
      <div
        className="relative bg-black w-full flex items-center justify-center select-none overflow-hidden"
        onDoubleClick={handleImageDoubleClick}
      >
        {isVideoPost && videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full max-h-[500px] object-cover"
            loop
            muted
            autoPlay
            playsInline
            controls
          />
        ) : post.image ? (
          <img
            src={post.image}
            alt={post.caption || 'post image'}
            className="w-full max-h-[550px] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-[#161616] flex items-center justify-center p-6 text-center text-white text-sm">
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

      {/* Action Icons Bar */}
      <div className="px-3 pt-3 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={handleLikeToggle} className="hover:opacity-60 transition">
              <Heart className={`w-6 h-6 ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
            </button>
            <button onClick={() => setShowComments(!showComments)} className="hover:opacity-60 transition">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
            <button onClick={handleShareClick} className="hover:opacity-60 transition" title="Share Post">
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
          <button onClick={handleSaveToggle} className="hover:opacity-60 transition" title="Save Post">
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

        {/* Comment Drawer Toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-gray-500 text-xs hover:text-gray-400 transition block pt-0.5"
        >
          {showComments ? 'Hide comments' : `View all ${post.comments?.length || 0} comments`}
        </button>
      </div>

      {/* Expanded Modern Comment Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CommentSection postId={post.id || post._id} showComments={showComments} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal Dialog */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#0095F6]" />
                  Share Post
                </h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={copyPostLink}
                  className="w-full py-2.5 px-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-xl text-xs font-semibold text-white flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-[#0095F6]" />
                    Copy Post Link
                  </span>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this post on SocialHub: ${window.location.origin}/?post=${post.id || post._id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-xl text-xs font-semibold text-white flex items-center gap-2 transition block"
                >
                  <span className="text-green-500 font-bold">💬</span> Share on WhatsApp
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this post on SocialHub: ${window.location.origin}/?post=${post.id || post._id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-xl text-xs font-semibold text-white flex items-center gap-2 transition block"
                >
                  <span className="text-[#0095F6] font-bold">🐦</span> Share on X (Twitter)
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </article>
  )
}

export default PostCard
