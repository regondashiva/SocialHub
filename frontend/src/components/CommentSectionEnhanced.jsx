import React, { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Lightbulb, Send, MessageCircle, RefreshCw } from 'lucide-react'
import { toxicityService } from '../services/toxicityService'
import toast from 'react-hot-toast'
import axios from 'axios'
import { API_URL } from '../config/api'

function CommentSection({ postId, showComments }) {
  const [comment, setComment] = useState('')
  const [toxicityAlert, setToxicityAlert] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)
  const commentInputRef = useRef(null)

  // Fetch existing comments when component mounts
  useEffect(() => {
    fetchComments()
    
    // Set up real-time updates
    const interval = setInterval(fetchComments, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/comments`)
      setComments(response.data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const detectToxicity = async () => {
    if (!comment.trim()) return

    setLoading(true)
    try {
      const result = await toxicityService.detectToxicity(comment)
      
      if (result.toxicity_score > 0.75) {
        setToxicityAlert({
          level: 'BLOCKED',
          score: result.toxicity_score,
          categories: result.categories
        })
        const rewriteSuggestion = await toxicityService.suggestRewrite(comment)
        if (rewriteSuggestion) setSuggestion(rewriteSuggestion)
      } else if (result.toxicity_score > 0.5) {
        setToxicityAlert({
          level: 'WARNING',
          score: result.toxicity_score,
          categories: result.categories
        })
      } else {
        setToxicityAlert(null)
        setSuggestion(null)
      }
    } catch (error) {
      console.error('Toxicity detection error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    // First, detect toxicity before posting
    setLoading(true)
    try {
      console.log('🔍 Detecting toxicity for comment:', comment)
      const result = await toxicityService.detectToxicity(comment)
      console.log('📊 Toxicity result:', result)
      
      if (result.toxicity_score > 0.75) {
        console.log('🚫 Comment blocked - Toxicity score:', result.toxicity_score)
        // Block the comment
        setToxicityAlert({
          level: 'BLOCKED',
          score: result.toxicity_score,
          categories: result.categories
        })
        
        // Get rewrite suggestion
        const rewriteSuggestion = await toxicityService.suggestRewrite(comment)
        if (rewriteSuggestion) setSuggestion(rewriteSuggestion)
        
        toast.error('Comment blocked due to toxic content')
        setLoading(false)
        return
      } else if (result.toxicity_score > 0.5) {
        console.log('⚠️ Comment warning - Toxicity score:', result.toxicity_score)
        // Show warning but allow posting
        setToxicityAlert({
          level: 'WARNING',
          score: result.toxicity_score,
          categories: result.categories
        })
        
        const rewriteSuggestion = await toxicityService.suggestRewrite(comment)
        if (rewriteSuggestion) setSuggestion(rewriteSuggestion)
      } else {
        console.log('✅ Comment safe - Toxicity score:', result.toxicity_score)
        // Clear any existing alerts
        setToxicityAlert(null)
        setSuggestion(null)
      }
    } catch (error) {
      console.error('❌ Toxicity detection error:', error)
      // Continue with posting if detection fails
    } finally {
      setLoading(false)
    }

    // If we reach here, the comment is not blocked, so proceed with posting
    try {
      setIsUpdating(true)
      const response = await axios.post(
        `${API_URL}/posts/${postId}/comments`,
        { 
          text: comment, 
          toxicityScore: toxicityAlert?.score || 0,
          toxicityCategories: toxicityAlert?.categories || {},
          detectedKeywords: toxicityAlert?.detected_keywords || []
        }
      )

      // Add new comment to the existing list optimistically
      const newComment = {
        ...response.data,
        author: { 
          username: 'You', 
          avatar: 'https://ui-avatars.com/api/?name=you&background=random' 
        }
      }

      setComments(prevComments => [newComment, ...prevComments])
      setComment('')
      setToxicityAlert(null)
      setSuggestion(null)
      toast.success('Comment posted!')
      
      // Scroll to the new comment
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
      
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRefresh = () => {
    fetchComments()
    toast.success('Comments refreshed!')
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}/comments/${commentId}`)
      
      // Remove comment from local state
      setComments(prevComments => prevComments.filter(c => c._id !== commentId))
      toast.success('Comment deleted!')
      
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleEditComment = async (commentId, newText) => {
    try {
      // First detect toxicity of edited text
      const result = await toxicityService.detectToxicity(newText)
      
      if (result.toxicity_score > 0.75) {
        toast.error('Edited comment violates community guidelines')
        return
      }

      await axios.put(`${API_URL}/posts/${postId}/comments/${commentId}`, {
        text: newText,
        toxicityScore: result.toxicity_score,
        toxicityCategories: result.categories,
        detectedKeywords: result.detected_keywords || []
      })

      // Update comment in local state
      setComments(prevComments => 
        prevComments.map(c => 
          c._id === commentId 
            ? { ...c, text: newText, toxicityScore: result.toxicity_score }
            : c
        )
      )
      
      toast.success('Comment updated!')
      
    } catch (error) {
      toast.error('Failed to update comment')
    }
  }

  return (
    <div className="border-t border-gray-700 p-4 bg-primary">
      {/* Comment Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center space-x-2">
          Comments ({comments.length})
          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-white transition flex items-center space-x-1 p-2 rounded"
            title="Refresh comments"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </h3>
        <button
          onClick={() => {}} // Parent controls visibility
          className="text-gray-400 hover:text-white transition flex items-center space-x-1"
        >
          <MessageCircle className="w-4 h-4" />
          {showComments ? 'Hide' : 'Show'} Comments
        </button>
      </div>

      {/* Comment Input */}
      <div className="mb-4">
        {toxicityAlert && (
          <div className={`mb-3 p-3 rounded-lg ${
            toxicityAlert.level === 'BLOCKED' ? 'bg-red-900 border-red-700' : 'bg-yellow-900 border-yellow-700'
          }`}>
            <div className="flex items-start space-x-2">
              {toxicityAlert.level === 'BLOCKED' ? (
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-white text-sm">
                  {toxicityAlert.level === 'BLOCKED' ? (
                    <>
                      <strong>Comment Blocked:</strong> This content violates our community guidelines.
                      {suggestion && (
                        <div className="mt-2">
                          <strong>Suggested rewrite:</strong> {suggestion}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <strong>Comment Warning:</strong> This comment may be inappropriate.
                      {suggestion && (
                        <div className="mt-2">
                          <strong>Suggested improvement:</strong> {suggestion}
                        </div>
                      )}
                    </>
                  )}
                </p>
                <div className="text-xs text-gray-300 mt-1">
                  Toxicity Score: {toxicityAlert.score.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <input
            ref={commentInputRef}
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 bg-secondary border border-gray-600 rounded-l text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isUpdating}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || isUpdating || !comment.trim() || toxicityAlert?.level === 'BLOCKED'}
            className="px-4 py-2 bg-purple-600 text-white rounded-r hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
          >
            {loading || isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white border-t-purple-600"></div>
                <span className="ml-2">Processing...</span>
              </>
            ) : toxicityAlert?.level === 'BLOCKED' ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Blocked</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comments Display */}
      {showComments && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.map((c) => (
            <div key={c._id} className="bg-secondary border border border-gray-600 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <img 
                    src={c.author.avatar} 
                    alt={c.author.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-white">{c.author.username}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Toxicity Alert for existing comments */}
                {c.toxicityScore > 0.5 && (
                  <div className={`text-xs px-2 py-1 rounded ${
                    c.toxicityScore > 0.75 ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'
                  }`}>
                    {c.toxicityScore > 0.75 ? '⚠️ Toxic' : '⚠️ Warning'}
                  </div>
                )}
              </div>
              
              <div className="mt-2">
                <p className="text-white text-sm">{c.text}</p>
                
                {/* Comment Actions */}
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => handleEditComment(c._id, c.text)}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(c._id)}
                    className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection
