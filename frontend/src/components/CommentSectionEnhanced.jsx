import React, { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Sparkles, Send, Trash2, Heart, Smile, Check, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toxicityService } from '../services/toxicityService'
import toast from 'react-hot-toast'
import axios from 'axios'
import { API_URL } from '../config/api'
import { useAuthStore } from '../store/authStore'

function CommentSection({ postId, showComments, onCommentAdded }) {
  const { user: currentUser } = useAuthStore()
  const [comment, setComment] = useState('')
  const [toxicityAlert, setToxicityAlert] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [likedComments, setLikedComments] = useState({})
  const commentInputRef = useRef(null)

  const fetchComments = async () => {
    if (!postId) return
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/comments`)
      setComments(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId])

  // Real-time toxicity check debounce as user types
  useEffect(() => {
    if (!comment.trim()) {
      setToxicityAlert(null)
      setSuggestion(null)
      return
    }

    const timer = setTimeout(async () => {
      const result = await toxicityService.detectToxicity(comment)
      if (result.toxicity_score >= 0.5 || result.is_toxic) {
        setToxicityAlert({ 
          level: result.toxicity_score >= 0.75 ? 'BLOCKED' : 'WARNING', 
          score: result.toxicity_score 
        })
        const rewrite = await toxicityService.suggestRewrite(comment)
        if (rewrite) setSuggestion(rewrite)
      } else {
        setToxicityAlert(null)
        setSuggestion(null)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [comment])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!comment.trim()) return

    const toxicResult = await toxicityService.detectToxicity(comment)
    if (toxicResult.is_toxic || toxicResult.toxicity_score >= 0.5) {
      toast.error('🚫 Comment blocked: Contains inappropriate words. Please use the suggested rewrite below!')
      const rewrite = await toxicityService.suggestRewrite(comment)
      if (rewrite) setSuggestion(rewrite)
      setToxicityAlert({ level: 'BLOCKED', score: toxicResult.toxicity_score })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, {
        text: comment.trim(),
        toxicityScore: toxicResult.toxicity_score,
        toxicityCategories: toxicResult.categories || {}
      })

      setComments(prev => [...prev, response.data])
      if (onCommentAdded) onCommentAdded(response.data)
      setComment('')
      setToxicityAlert(null)
      setSuggestion(null)
      toast.success('Comment posted!')
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to post comment'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 1-Tap Apply & Instant Post the civil suggestion
  const handleApplyAndPost = async () => {
    if (!suggestion) return
    const textToPost = suggestion
    setComment('')
    setToxicityAlert(null)
    setSuggestion(null)
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, {
        text: textToPost,
        toxicityScore: 0,
        toxicityCategories: {}
      })

      setComments(prev => [...prev, response.data])
      if (onCommentAdded) onCommentAdded(response.data)
      toast.success('Posted respectful suggestion ✨')
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}/comments/${commentId}`)
      setComments(prev => prev.filter(c => c._id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const toggleCommentLike = (commentId) => {
    setLikedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const formatCommentTime = (date) => {
    if (!date) return 'now'
    const diff = Math.floor((new Date() - new Date(date)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  return (
    <div className="border-t border-[#262626] bg-[#0c0c0c] rounded-b-xl overflow-hidden">
      
      {/* Existing Comments List */}
      <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3.5 scrollbar-thin scrollbar-thumb-[#262626]">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-3">No comments yet. Start the conversation!</p>
        ) : (
          comments.map((c) => {
            const author = c.author || {}
            const authorName = author.username || 'user'
            const authorAvatar = author.avatar
            const isOwn = (author._id || author) === currentUser?._id || authorName === currentUser?.username
            const isLiked = !!likedComments[c._id]

            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-3 text-xs group"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {/* User Avatar */}
                  <div className="w-7 h-7 rounded-full bg-[#262626] flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-[10px] text-white">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      authorName.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Text & Meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white leading-relaxed">
                      <span className="font-semibold mr-1.5 text-white">{authorName}</span>
                      <span className="text-gray-200">{c.text}</span>
                    </p>
                    
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                      <span>{formatCommentTime(c.createdAt)}</span>
                      {c.toxicityScore > 0.5 && (
                        <span className="text-yellow-400 font-medium">⚠️ Flagged</span>
                      )}
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-gray-500 hover:text-red-400 transition"
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comment Heart Like */}
                <button
                  onClick={() => toggleCommentLike(c._id)}
                  className="text-gray-500 hover:text-red-500 transition pt-1"
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                </button>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Real-time Toxicity & AI Smart Suggestion Banner */}
      <AnimatePresence>
        {(toxicityAlert || suggestion) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2.5 text-xs border-t bg-gradient-to-r from-red-950/80 via-[#181818] to-purple-950/80 border-red-800 text-white space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 text-red-300 font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Toxic words detected! We encourage respectful communication.</span>
              </div>
            </div>

            {suggestion && (
              <div className="bg-black/60 border border-white/10 p-2.5 rounded-xl space-y-2">
                <div className="flex items-start gap-2 text-xs text-white">
                  <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase block tracking-wider">AI Suggested Polite Rewrite:</span>
                    <span className="italic text-gray-200">"{suggestion}"</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleApplyAndPost}
                    disabled={loading}
                    className="flex-1 py-1.5 px-3 bg-gradient-to-r from-[#0095F6] to-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Post Suggested Rewrite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setComment(suggestion)
                      setToxicityAlert(null)
                      setSuggestion(null)
                    }}
                    className="py-1.5 px-3 bg-[#262626] hover:bg-[#363636] text-gray-200 text-xs font-semibold rounded-lg transition"
                  >
                    Insert to Edit
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex items-center px-3 py-2.5 border-t border-[#262626] bg-black">
        {/* Quick Emoji Reacts */}
        <div className="hidden sm:flex items-center gap-1.5 mr-2">
          {['❤️', '🙌', '🔥', '👏'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setComment(prev => prev + emoji)}
              className="text-xs hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}
        </div>

        <input
          ref={commentInputRef}
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none px-2"
        />

        <button
          type="submit"
          disabled={loading || !comment.trim() || toxicityAlert?.level === 'BLOCKED'}
          className="text-xs font-semibold text-[#0095F6] hover:text-[#1877F2] disabled:opacity-40 disabled:hover:text-[#0095F6] transition px-2 py-1"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>

    </div>
  )
}

export default CommentSection
