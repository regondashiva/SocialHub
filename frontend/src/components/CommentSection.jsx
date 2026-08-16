import React, { useState, useEffect } from 'react'
import { AlertTriangle, Lightbulb, Send, MessageCircle } from 'lucide-react'
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

  // Fetch existing comments when component mounts
  useEffect(() => {
    fetchComments()
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

    if (toxicityAlert?.level === 'BLOCKED') {
      toast.error('Your comment violates community guidelines')
      return
    }

    try {
      const response = await axios.post(
        `${API_URL}/posts/${postId}/comments`,
        { text: comment, toxicityScore: toxicityAlert?.score || 0 }
      )
      // Add new comment to the existing list
      const newComment = {
        ...response.data,
        author: { username: 'You', avatar: 'https://ui-avatars.com/api/?name=you&background=random' }
      }
      setComments([...comments, newComment])
      setComment('')
      setToxicityAlert(null)
      setSuggestion(null)
      toast.success('Comment posted!')
    } catch (error) {
      toast.error('Failed to post comment')
    }
  }

  return (
    <div className="border-t border-gray-700 p-4 bg-primary">
      {/* Comment Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Comments ({comments.length})</h3>
        <button
          onClick={() => {}} // Remove onClick, let parent control visibility
          className="text-gray-400 hover:text-white transition flex items-center space-x-1"
        >
          <MessageCircle className="w-4 h-4" />
          {showComments ? 'Hide' : 'Show'} Comments
        </button>
      </div>

      {/* Comments Display */}
      {showComments && (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{c.author?.username}</p>
                <p className="text-gray-300 text-sm">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      <div className="mt-4 space-y-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={detectToxicity}
          placeholder="Add a comment..."
          className="w-full bg-secondary border border-gray-700 rounded p-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          rows="2"
        />

        {toxicityAlert?.level === 'WARNING' && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-200 font-semibold text-sm">Content Warning</p>
              <p className="text-yellow-100 text-xs">Your comment might offend some people (Score: {(toxicityAlert.score * 100).toFixed(1)}%)</p>
              {suggestion && (
                <p className="text-yellow-100 text-xs mt-2">💡 Try: {suggestion}</p>
              )}
            </div>
          </div>
        )}

        {toxicityAlert?.level === 'BLOCKED' && (
          <div className="bg-red-900/30 border border-red-700 rounded p-3 flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 font-semibold text-sm">Comment Blocked</p>
              <p className="text-red-100 text-xs">This comment violates our community guidelines</p>
              {suggestion && (
                <div>
                  <p className="text-red-100 text-xs mt-2 flex items-center space-x-1">
                    <Lightbulb className="w-3 h-3" />
                    <span>Alternative: {suggestion}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || (toxicityAlert?.level === 'BLOCKED')}
          className="w-full bg-accent hover:bg-blue-600 disabled:bg-gray-600 text-white rounded p-2 flex items-center justify-center space-x-2 transition"
        >
          <Send className="w-4 h-4" />
          <span>Post Comment</span>
        </button>
      </div>
    </div>
  )
}

export default CommentSection
