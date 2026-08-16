import React, { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Send, Bookmark, Music, Volume2, VolumeX, Play, Pause, MoreHorizontal, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePostStore } from '../store/postStore'
import CommentSection from './CommentSectionEnhanced'

const workingVideos = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4',
  'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4'
]

function ReelsSection({ onBackToHome }) {
  const { posts, fetchPosts } = usePostStore()
  const [reels, setReels] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [likedReels, setLikedReels] = useState({})
  const [savedReels, setSavedReels] = useState({})
  const [followingMap, setFollowingMap] = useState({})
  const [showComments, setShowComments] = useState(false)
  const [doubleTapLiked, setDoubleTapLiked] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    // Filter reels/videos from posts or create demo reels
    const reelItems = posts
      .filter(p => p.mediaType === 'reel' || p.mediaType === 'video' || p.video)
      .map((p, idx) => ({
        id: p._id || p.id || `reel-${idx}`,
        author: p.author || { username: 'creator', avatar: '' },
        caption: p.caption || 'Check out this awesome reel! 🎥✨',
        video: p.video || p.image || workingVideos[idx % workingVideos.length],
        likes: p.likes || 1240 + idx * 85,
        comments: p.comments?.length || 42 + idx * 3,
        musicTrack: 'Original Audio - Instagram'
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
          likes: 4820,
          comments: 184,
          musicTrack: 'Tropical Chill - Sunset Beats'
        },
        {
          id: 'mock-2',
          author: { username: 'tech_coder', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
          caption: 'Building AI Social Media App with React & FastAPI 🚀🔥',
          video: workingVideos[1],
          likes: 8940,
          comments: 312,
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

  const handleNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsPlaying(true)
    }
  }

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsPlaying(true)
    }
  }

  const handleDoubleTap = () => {
    if (currentReel) {
      setLikedReels(prev => ({ ...prev, [currentReel.id]: true }))
      setDoubleTapLiked(true)
      setTimeout(() => setDoubleTapLiked(false), 800)
    }
  }

  const toggleLike = () => {
    if (currentReel) {
      setLikedReels(prev => ({ ...prev, [currentReel.id]: !prev[currentReel.id] }))
    }
  }

  const toggleSave = () => {
    if (currentReel) {
      setSavedReels(prev => ({ ...prev, [currentReel.id]: !prev[currentReel.id] }))
    }
  }

  const toggleFollow = () => {
    if (currentReel) {
      setFollowingMap(prev => ({ ...prev, [currentReel.id]: !prev[currentReel.id] }))
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center pt-2 pb-16 md:py-4">
      {/* Instagram 9:16 Reel Container */}
      <div className="relative w-full max-w-ig-reel h-[85vh] md:h-[90vh] bg-[#121212] rounded-xl overflow-hidden shadow-2xl border border-[#262626] flex items-center justify-center">

        {currentReel && (
          <>
            {/* Video Canvas */}
            <div className="relative w-full h-full bg-black flex items-center justify-center" onDoubleClick={handleDoubleTap}>
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

              {/* Double Tap Heart Explosion */}
              <AnimatePresence>
                {doubleTapLiked && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.3, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                  >
                    <Heart className="w-28 h-28 text-white fill-white drop-shadow-lg animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Left Back Button Header */}
              <button
                onClick={onBackToHome}
                className="absolute top-4 left-4 z-30 flex items-center space-x-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {/* Mute / Unmute Button Header */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 right-4 z-30 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Play Pause Indicator */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-20">
                  <Play className="w-16 h-16 text-white/70" />
                </div>
              )}
            </div>

            {/* Bottom-Left Creator & Caption Overlay */}
            <div className="absolute bottom-4 left-4 right-16 z-30 space-y-3 text-white">
              {/* Creator Handle & Follow Pill */}
              <div className="flex items-center space-x-3">
                <div className="ig-story-ring p-[1.5px]">
                  <img
                    src={currentReel.author.avatar || 'https://picsum.photos/seed/user/100/100'}
                    alt={currentReel.author.username}
                    className="w-8 h-8 rounded-full object-cover border border-black"
                  />
                </div>
                <span className="font-bold text-sm drop-shadow">{currentReel.author.username}</span>
                <button
                  onClick={toggleFollow}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${followingMap[currentReel.id]
                      ? 'border-white/30 bg-white/20 text-white'
                      : 'border-white text-white hover:bg-white hover:text-black'
                    }`}
                >
                  {followingMap[currentReel.id] ? 'Following' : 'Follow'}
                </button>
              </div>

              {/* Caption */}
              <p className="text-xs text-white/95 line-clamp-2 leading-relaxed drop-shadow">
                {currentReel.caption}
              </p>

              {/* Music Track Ticker with Spinning Audio Disc */}
              <div className="flex items-center space-x-2 text-[11px] text-white/80">
                <Music className="w-3.5 h-3.5 animate-bounce" />
                <span className="truncate max-w-[200px]">{currentReel.musicTrack}</span>
              </div>
            </div>

            {/* Right Vertical Instagram Action Bar */}
            <div className="absolute bottom-6 right-3 z-30 flex flex-col items-center space-y-5 text-white">
              {/* Like */}
              <div className="flex flex-col items-center">
                <button onClick={toggleLike} className="p-1 hover:scale-110 transition">
                  <Heart
                    className={`w-7 h-7 ${likedReels[currentReel.id] ? 'text-ig-red fill-ig-red' : 'text-white'}`}
                  />
                </button>
                <span className="text-[11px] font-semibold mt-1">
                  {likedReels[currentReel.id] ? currentReel.likes + 1 : currentReel.likes}
                </span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center">
                <button onClick={() => setShowComments(!showComments)} className="p-1 hover:scale-110 transition">
                  <MessageCircle className="w-7 h-7 text-white" />
                </button>
                <span className="text-[11px] font-semibold mt-1">{currentReel.comments}</span>
              </div>

              {/* Send / Share */}
              <button className="p-1 hover:scale-110 transition">
                <Send className="w-6 h-6 text-white" />
              </button>

              {/* Bookmark */}
              <button onClick={toggleSave} className="p-1 hover:scale-110 transition">
                <Bookmark className={`w-6 h-6 ${savedReels[currentReel.id] ? 'text-white fill-white' : 'text-white'}`} />
              </button>

              {/* Options */}
              <button className="p-1 text-white hover:opacity-80">
                <MoreHorizontal className="w-6 h-6" />
              </button>

              {/* Spinning Vinyl Audio Disc */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-900 to-black border-2 border-white/40 flex items-center justify-center shadow-lg animate-spin-slow">
                <div className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center">
                  <Music className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>

            {/* Reel Navigation Up/Down Controls (Desktop) */}
            <div className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden lg:flex flex-col space-y-3">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrevReel}
                className="p-2 bg-[#262626] rounded-full text-white hover:bg-white/20 disabled:opacity-30"
              >
                ▲
              </button>
              <button
                disabled={currentIndex === reels.length - 1}
                onClick={handleNextReel}
                className="p-2 bg-[#262626] rounded-full text-white hover:bg-white/20 disabled:opacity-30"
              >
                ▼
              </button>
            </div>
          </>
        )}
      </div>

      {/* Drawer Comments */}
      <AnimatePresence>
        {showComments && currentReel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-lg bg-[#121212] border border-[#262626] rounded-t-2xl sm:rounded-2xl max-h-[70vh] flex flex-col overflow-hidden"
            >
              <div className="p-3 border-b border-[#262626] flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Comments</h3>
                <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <CommentSection postId={currentReel.id} showComments={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ReelsSection
