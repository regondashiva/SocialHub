import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Heart, MessageCircle, Send, Bookmark, Music, Volume2, VolumeX, 
  Play, Pause, MoreHorizontal, ArrowLeft, ChevronUp, ChevronDown, 
  UserPlus, UserCheck, Share2, Copy, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { usePostStore } from '../store/postStore'
import { useAuthStore } from '../store/authStore'
import CommentSection from './CommentSectionEnhanced'
import { API_URL } from '../config/api'
import toast from 'react-hot-toast'

const workingVideos = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
]

function ReelsSection({ onBackToHome }) {
  const { posts, fetchPosts, likePost, unlikePost } = usePostStore()
  const { user: currentUser } = useAuthStore()
  const [reels, setReels] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [likedReels, setLikedReels] = useState({})
  const [savedReels, setSavedReels] = useState({})
  const [followingMap, setFollowingMap] = useState({})
  const [showComments, setShowComments] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [doubleTapLiked, setDoubleTapLiked] = useState(false)
  
  const videoRef = useRef(null)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const isScrollingRef = useRef(false)

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    // Collect all reels and videos from MongoDB posts
    const reelItems = posts
      .filter(p => p.mediaType === 'reel' || p.mediaType === 'video' || p.video)
      .map((p, idx) => ({
        id: p._id || p.id || `reel-${idx}`,
        author: p.author || { username: 'creator', avatar: '' },
        caption: p.caption || 'Check out this awesome reel! 🎥✨',
        video: p.video || p.image || workingVideos[idx % workingVideos.length],
        likes: p.likes || 12,
        likedBy: p.likedBy || [],
        commentsCount: p.comments?.length || 0,
        musicTrack: 'Original Audio - SocialHub Music'
      }))

    if (reelItems.length > 0) {
      setReels(reelItems)
    } else {
      setReels([
        {
          id: 'mock-1',
          author: { username: 'alex_travel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
          caption: 'Sunset in Bali 🌅🌴 #travel #reels #vibes',
          video: workingVideos[0],
          likes: 48,
          commentsCount: 12,
          musicTrack: 'Tropical Chill - Sunset Beats'
        },
        {
          id: 'mock-2',
          author: { username: 'tech_coder', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
          caption: 'Building AI Social Media App with React & FastAPI 🚀🔥',
          video: workingVideos[1],
          likes: 89,
          commentsCount: 34,
          musicTrack: 'Cyberpunk Synthwave'
        }
      ])
    }
  }, [posts])

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => { })
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, currentIndex])

  const currentReel = reels[currentIndex] || reels[0]

  const handleNextReel = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsPlaying(true)
    } else {
      // Loop back to first reel
      setCurrentIndex(0)
      setIsPlaying(true)
    }
  }, [currentIndex, reels.length])

  const handlePrevReel = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsPlaying(true)
    }
  }, [currentIndex])

  // Touch Gesture Handling for Mobile Swipe UP / DOWN
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY
  }

  const handleTouchEnd = () => {
    const deltaY = touchStartY.current - touchEndY.current
    if (Math.abs(deltaY) > 40) {
      if (deltaY > 0) {
        // Swiped UP -> Next Reel
        handleNextReel()
      } else {
        // Swiped DOWN -> Prev Reel
        handlePrevReel()
      }
    }
  }

  // Wheel Scrolling for Desktop
  const handleWheel = (e) => {
    if (isScrollingRef.current) return
    isScrollingRef.current = true
    setTimeout(() => { isScrollingRef.current = false }, 400)

    if (e.deltaY > 20) {
      handleNextReel()
    } else if (e.deltaY < -20) {
      handlePrevReel()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') handleNextReel()
      if (e.key === 'ArrowUp') handlePrevReel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNextReel, handlePrevReel])

  const handleDoubleTap = () => {
    if (currentReel) {
      setLikedReels(prev => ({ ...prev, [currentReel.id]: true }))
      setDoubleTapLiked(true)
      if (currentReel.id && !currentReel.id.startsWith('mock')) {
        likePost(currentReel.id)
      }
      setTimeout(() => setDoubleTapLiked(false), 800)
    }
  }

  const toggleLike = () => {
    if (currentReel) {
      const willLike = !likedReels[currentReel.id]
      setLikedReels(prev => ({ ...prev, [currentReel.id]: willLike }))
      if (currentReel.id && !currentReel.id.startsWith('mock')) {
        if (willLike) likePost(currentReel.id)
        else unlikePost(currentReel.id)
      }
    }
  }

  const toggleSave = async () => {
    if (currentReel) {
      const nextSaved = !savedReels[currentReel.id]
      setSavedReels(prev => ({ ...prev, [currentReel.id]: nextSaved }))
      if (currentReel.id && !currentReel.id.startsWith('mock')) {
        try {
          await axios.post(`${API_URL}/users/saved/${currentReel.id}`)
          toast.success(nextSaved ? 'Reel saved!' : 'Reel unsaved')
        } catch (e) {}
      }
    }
  }

  const toggleFollow = async () => {
    if (!currentUser) return
    const authorId = currentReel.author?._id || currentReel.author?.id
    if (!authorId) return

    const currentlyFollowing = !!followingMap[authorId]
    setFollowingMap(prev => ({ ...prev, [authorId]: !currentlyFollowing }))
    try {
      if (currentlyFollowing) {
        await axios.post(`${API_URL}/users/${authorId}/unfollow`)
        toast.success(`Unfollowed @${currentReel.author?.username}`)
      } else {
        await axios.post(`${API_URL}/users/${authorId}/follow`)
        toast.success(`Following @${currentReel.author?.username}`)
      }
    } catch (e) {
      setFollowingMap(prev => ({ ...prev, [authorId]: currentlyFollowing }))
    }
  }

  const handleShareClick = () => {
    const reelUrl = `${window.location.origin}/?reel=${currentReel.id}`
    if (navigator.share) {
      navigator.share({
        title: `Reel by ${currentReel.author?.username} on SocialHub`,
        text: currentReel.caption,
        url: reelUrl
      }).then(() => toast.success('Shared!')).catch(() => setShowShareModal(true))
    } else {
      setShowShareModal(true)
    }
  }

  const copyReelLink = () => {
    const reelUrl = `${window.location.origin}/?reel=${currentReel.id}`
    navigator.clipboard.writeText(reelUrl)
    toast.success('Reel link copied! 📋')
    setShowShareModal(false)
  }

  return (
    <div 
      className="min-h-screen bg-black flex items-center justify-center pt-2 pb-16 md:py-4 select-none touch-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 9:16 Reel Stage */}
      <div className="relative w-full max-w-[420px] h-[86vh] md:h-[90vh] bg-[#121212] rounded-2xl overflow-hidden shadow-2xl border border-[#262626] flex items-center justify-center">

        {currentReel && (
          <>
            {/* Video Canvas */}
            <div 
              className="relative w-full h-full bg-black flex items-center justify-center" 
              onDoubleClick={handleDoubleTap}
            >
              <video
                ref={videoRef}
                src={currentReel.video}
                className="w-full h-full object-cover"
                autoPlay={isPlaying}
                loop
                muted={isMuted}
                playsInline
                onClick={() => setIsPlaying(!isPlaying)}
              />

              {/* Play / Pause Center Icon Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                  <Play className="w-16 h-16 text-white/80 fill-white/80" />
                </div>
              )}

              {/* Double Tap Heart Burst */}
              <AnimatePresence>
                {doubleTapLiked && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                  >
                    <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Top Navigation Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-semibold flex items-center gap-1 hover:bg-black/80 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[11px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded-full">
                  {currentIndex + 1} / {reels.length}
                </span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Right Action Icons Bar */}
            <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-20">
              {/* Like */}
              <div className="flex flex-col items-center">
                <button
                  onClick={toggleLike}
                  className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:scale-110 active:scale-90 transition"
                >
                  <Heart
                    className={`w-7 h-7 ${
                      likedReels[currentReel.id] ? 'text-red-500 fill-red-500' : 'text-white'
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-white mt-1 shadow-sm">
                  {(currentReel.likes || 0) + (likedReels[currentReel.id] ? 1 : 0)}
                </span>
              </div>

              {/* Comments */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:scale-110 active:scale-90 transition"
                >
                  <MessageCircle className="w-7 h-7" />
                </button>
                <span className="text-xs font-bold text-white mt-1">
                  {currentReel.commentsCount || 0}
                </span>
              </div>

              {/* Share */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleShareClick}
                  className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:scale-110 active:scale-90 transition"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>

              {/* Save */}
              <div className="flex flex-col items-center">
                <button
                  onClick={toggleSave}
                  className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:scale-110 active:scale-90 transition"
                >
                  <Bookmark
                    className={`w-6 h-6 ${
                      savedReels[currentReel.id] ? 'text-white fill-white' : 'text-white'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Details Overlay */}
            <div className="absolute left-4 right-16 bottom-4 text-white z-20 space-y-2 pointer-events-auto">
              {/* Creator Tag & Follow Button */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#262626] overflow-hidden flex items-center justify-center p-[1px] bg-gradient-to-tr from-yellow-400 to-purple-600">
                  {currentReel.author?.avatar ? (
                    <img src={currentReel.author.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs">{currentReel.author?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>

                <span className="font-bold text-sm tracking-wide">
                  @{currentReel.author?.username || 'creator'}
                </span>

                <button
                  onClick={toggleFollow}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                    followingMap[currentReel.author?._id || currentReel.author?.id]
                      ? 'bg-transparent border-white/40 text-white'
                      : 'bg-[#0095F6] border-[#0095F6] text-white hover:bg-[#1877F2]'
                  }`}
                >
                  {followingMap[currentReel.author?._id || currentReel.author?.id] ? 'Following' : 'Follow'}
                </button>
              </div>

              {/* Caption */}
              <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
                {currentReel.caption}
              </p>

              {/* Audio Track */}
              <div className="flex items-center gap-2 text-[11px] text-gray-300">
                <Music className="w-3.5 h-3.5 animate-spin" />
                <span className="truncate">{currentReel.musicTrack}</span>
              </div>
            </div>

            {/* Floating Up/Down Quick Scroll Controls */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 opacity-40 hover:opacity-100 transition">
              <button
                onClick={handlePrevReel}
                disabled={currentIndex === 0}
                className="p-2 bg-black/60 rounded-full text-white disabled:opacity-20 hover:bg-black transition"
                title="Previous Reel (Swipe Down)"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextReel}
                className="p-2 bg-black/60 rounded-full text-white hover:bg-black transition"
                title="Next Reel (Swipe Up)"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

      </div>

      {/* Reel Comments Bottom Sheet Modal */}
      <AnimatePresence>
        {showComments && currentReel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-lg bg-[#121212] border-t sm:border border-[#262626] rounded-t-2xl sm:rounded-2xl max-h-[75vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
                <h3 className="font-bold text-sm text-white">Comments</h3>
                <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <CommentSection postId={currentReel.id} showComments={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal Dialog */}
      <AnimatePresence>
        {showShareModal && currentReel && (
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
                  Share Reel
                </h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={copyReelLink}
                  className="w-full py-2.5 px-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-xl text-xs font-semibold text-white flex items-center justify-between transition"
                >
                  <span>Copy Reel Link</span>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this reel on SocialHub: ${window.location.origin}/?reel=${currentReel.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-xl text-xs font-semibold text-white flex items-center gap-2 transition block"
                >
                  <span className="text-green-500 font-bold">💬</span> Share on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default ReelsSection
