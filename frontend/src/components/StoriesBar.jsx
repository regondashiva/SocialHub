import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Play, Pause, Volume2, VolumeX, Heart, Send, X, Camera, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Cookie from 'js-cookie'
import { useAuthStore } from '../store/authStore'
import { API_URL } from '../config/api'
import toast from 'react-hot-toast'

const StoriesBar = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [activeStory, setActiveStory] = useState(null)
  const [likedStories, setLikedStories] = useState({})
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [replyText, setReplyText] = useState('')
  const [uploading, setUploading] = useState(false)
  const videoRef = useRef(null)
  const progressInterval = useRef(null)
  const fileInputRef = useRef(null)

  // Fetch stories from MongoDB
  const fetchBackendStories = async () => {
    try {
      const res = await fetch(`${API_URL}/stories`)
      const dbStories = await res.json()

      const demoStories = [
        {
          id: 's1',
          username: 'aria_dev',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
          hasStory: true,
          viewed: false,
          content: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop', duration: 4000 },
            { type: 'image', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=1200&fit=crop', duration: 4000 }
          ]
        },
        {
          id: 's2',
          username: 'dev_sharma',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
          hasStory: true,
          viewed: false,
          content: [
            { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 5000 }
          ]
        },
        {
          id: 's3',
          username: 'elena_travel',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
          hasStory: true,
          viewed: false,
          content: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=1200&fit=crop', duration: 4000 }
          ]
        }
      ]

      // Combine User Own Story + DB Stories + Demo Stories
      const ownStory = {
        id: 'own',
        username: 'Your story',
        avatar: user?.avatar || '',
        isOwn: true,
        hasStory: false
      }

      setStories([ownStory, ...(Array.isArray(dbStories) && dbStories.length > 0 ? dbStories : demoStories)])
    } catch (e) {
      console.error('Failed to load stories:', e)
    }
  }

  useEffect(() => {
    fetchBackendStories()
  }, [user])

  // Handle uploading story file from device
  const handleStoryFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    toast.loading('Uploading to your story...')

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Data = reader.result
      const isVideo = file.type.startsWith('video')

      try {
        const token = Cookie.get('token') || localStorage.getItem('token')
        const response = await fetch(`${API_URL}/stories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            mediaType: isVideo ? 'video' : 'image',
            url: base64Data,
            duration: isVideo ? 6000 : 4000
          })
        })

        if (response.ok) {
          toast.dismiss()
          toast.success('Story posted successfully!')
          fetchBackendStories()
        } else {
          toast.dismiss()
          // Display locally if auth token not set
          const newStoryItem = {
            id: `story-${Date.now()}`,
            username: user?.username || 'You',
            avatar: user?.avatar || '',
            hasStory: true,
            viewed: false,
            content: [{ type: isVideo ? 'video' : 'image', url: base64Data, duration: 5000 }]
          }
          setStories(prev => [prev[0], newStoryItem, ...prev.slice(1)])
          toast.success('Story posted!')
        }
      } catch (err) {
        toast.dismiss()
        toast.error('Failed to post story')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // Progress timer for story playback
  useEffect(() => {
    if (activeStory && isPlaying) {
      const currentContent = activeStory.content[currentStoryIndex]
      if (currentContent) {
        setProgress(0)
        if (progressInterval.current) clearInterval(progressInterval.current)

        const stepTime = 50
        const totalSteps = (currentContent.duration || 4000) / stepTime
        let currentStep = 0

        progressInterval.current = setInterval(() => {
          currentStep++
          const newProgress = (currentStep / totalSteps) * 100
          setProgress(newProgress)

          if (newProgress >= 100) {
            clearInterval(progressInterval.current)
            if (currentStoryIndex < activeStory.content.length - 1) {
              setCurrentStoryIndex(prev => prev + 1)
            } else {
              const currentStoryIdx = stories.findIndex(s => s.id === activeStory.id)
              if (currentStoryIdx < stories.length - 1) {
                const nextStory = stories[currentStoryIdx + 1]
                setActiveStory(nextStory)
                setCurrentStoryIndex(0)
                setStories(prev => prev.map(s => s.id === activeStory.id ? { ...s, viewed: true } : s))
              } else {
                setActiveStory(null)
              }
            }
          }
        }, stepTime)
      }
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [activeStory, currentStoryIndex, isPlaying, stories])

  const handleStoryClick = (story) => {
    if (story.isOwn) {
      fileInputRef.current?.click()
    } else if (story.hasStory && story.content?.length > 0) {
      setActiveStory(story)
      setCurrentStoryIndex(0)
      setIsPlaying(true)
      setProgress(0)
      setStories(prev => prev.map(s => s.id === story.id ? { ...s, viewed: true } : s))
    }
  }

  const goToNextContent = () => {
    if (currentStoryIndex < activeStory.content.length - 1) {
      setCurrentStoryIndex(prev => prev + 1)
    } else {
      const currentStoryIdx = stories.findIndex(s => s.id === activeStory.id)
      if (currentStoryIdx < stories.length - 1) {
        setActiveStory(stories[currentStoryIdx + 1])
        setCurrentStoryIndex(0)
      } else {
        setActiveStory(null)
      }
    }
  }

  const goToPreviousContent = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1)
    }
  }

  const handleDeleteStory = async () => {
    if (!activeStory) return
    const currentContent = activeStory.content?.[currentStoryIndex]
    const storyId = currentContent?.id || activeStory.id

    if (window.confirm('Delete this story?')) {
      try {
        const token = Cookie.get('token') || localStorage.getItem('token')
        await fetch(`${API_URL}/stories/${storyId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setActiveStory(null)
        toast.success('Story deleted')
        fetchBackendStories()
      } catch (e) {
        toast.error('Failed to delete story')
      }
    }
  }

  return (
    <>
      {/* Hidden file input for uploading story */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleStoryFileUpload}
        className="hidden"
      />

      {/* SocialHub Stories Bar */}
      <div className="bg-black py-3 px-2 border-b border-[#262626]">
        <div className="flex space-x-4 overflow-x-auto custom-scrollbar">
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => handleStoryClick(story)}
              className="flex flex-col items-center space-y-1.5 cursor-pointer flex-shrink-0 group"
            >
              {/* Instagram Ring */}
              <div className="relative">
                {story.isOwn ? (
                  <div className="w-[66px] h-[66px] rounded-full p-[2px] border border-[#262626] relative flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="You" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-white font-bold text-sm">
                        {user?.username?.charAt(0).toUpperCase() || 'Y'}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-[#0095F6] border-2 border-black rounded-full p-0.5 text-white">
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                ) : (
                  <div className={`w-[66px] h-[66px] rounded-full ${story.viewed ? 'ig-story-ring-viewed' : 'ig-story-ring'} flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <div className="w-full h-full rounded-full bg-black p-[2px]">
                      {story.avatar ? (
                        <img src={story.avatar} alt={story.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-white font-bold text-sm">
                          {story.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Username */}
              <span className="text-[11px] text-[#F5F5F5] truncate w-16 text-center tracking-tight">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Fullscreen Viewer Modal */}
      <AnimatePresence>
        {activeStory && activeStory.content?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-[#1a1a1a] z-50 flex items-center justify-center"
          >
            {/* Story Card Container */}
            <div className="relative w-full max-w-[400px] h-full max-h-[850px] bg-black sm:rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between">

              {/* Top Progress Segmented Bar */}
              <div className="absolute top-3 left-3 right-3 z-30 flex space-x-1.5">
                {activeStory.content.map((_, idx) => (
                  <div key={idx} className="flex-1 bg-white/30 h-[2.5px] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width: idx === currentStoryIndex ? `${progress}%` : idx < currentStoryIndex ? '100%' : '0%'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Header */}
              <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between">
                <div 
                  onClick={() => {
                    setActiveStory(null)
                    navigate(`/profile/${activeStory.id || activeStory.username}`)
                  }}
                  className="flex items-center space-x-2.5 cursor-pointer hover:opacity-80 transition"
                  title="View Profile"
                >
                  <img src={activeStory.avatar || 'https://picsum.photos/seed/user/100/100'} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white hover:underline">@{activeStory.username}</span>
                    <span className="text-[10px] text-gray-300">View Profile</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {(activeStory.isOwn || activeStory.username === user?.username) && (
                    <button onClick={handleDeleteStory} className="text-white hover:text-red-400 p-1" title="Delete Story">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                  <button onClick={() => setIsPlaying(!isPlaying)} className="text-white">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setActiveStory(null)} className="text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Story Content & Tap Controls */}
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {activeStory.content[currentStoryIndex]?.type === 'video' ? (
                  <video
                    ref={videoRef}
                    src={activeStory.content[currentStoryIndex].url}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted={isMuted}
                    playsInline
                  />
                ) : (
                  <img
                    src={activeStory.content[currentStoryIndex]?.url}
                    alt="story"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Left/Right Tap Areas */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={goToPreviousContent} />
                <div className="absolute inset-y-0 right-0 w-2/3 z-20" onClick={goToNextContent} />
              </div>

              {/* Story Bottom Reply & Like Bar */}
              <div className="absolute bottom-4 left-3 right-3 z-30 flex items-center space-x-2">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!replyText.trim()) return
                    toast.success(`Reply sent to @${activeStory.username}! 💬`)
                    setReplyText('')
                  }} 
                  className="flex-1 flex items-center space-x-2 bg-black/50 backdrop-blur-md border border-white/30 rounded-full px-3 py-1.5"
                >
                  <input
                    type="text"
                    placeholder={`Reply to @${activeStory.username}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-white placeholder-gray-300 focus:outline-none"
                  />
                  <button type="submit" className="text-white hover:text-[#0095F6] transition">
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <button 
                  onClick={() => {
                    const storyId = activeStory.id
                    const nextLiked = !likedStories[storyId]
                    setLikedStories(prev => ({ ...prev, [storyId]: nextLiked }))
                    if (nextLiked) toast.success(`Liked @${activeStory.username}'s story ❤️`)
                  }}
                  className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:scale-110 active:scale-90 transition border border-white/20"
                  title="Like Story"
                >
                  <Heart className={`w-5 h-5 ${likedStories[activeStory.id] ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default StoriesBar
