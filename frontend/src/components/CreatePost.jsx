import React, { useState, useRef, useEffect } from 'react'
import { 
  ImagePlus, X, MapPin, Smile, Hash, Video, Film, Sparkles, 
  ArrowLeft, Check, AlertTriangle, Globe, Play, Trash2, UploadCloud
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePostStore } from '../store/postStore'
import { useAuthStore } from '../store/authStore'
import { toxicityService } from '../services/toxicityService'
import toast from 'react-hot-toast'

function CreatePost({ isOpen, onClose, onPostCreated }) {
  const { user } = useAuthStore()
  const { createPost } = usePostStore()

  const [caption, setCaption] = useState('')
  const [mediaType, setMediaType] = useState('image') // 'image' | 'video' | 'reel'
  const [mediaFile, setMediaFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState('')
  const [feeling, setFeeling] = useState('')
  const [duration, setDuration] = useState('')
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [showFeelingPicker, setShowFeelingPicker] = useState(false)
  const [toxicityAlert, setToxicityAlert] = useState(null)
  const [suggestedRewrite, setSuggestedRewrite] = useState(null)

  const fileInputRef = useRef(null)

  // Real-time toxicity check as user types caption
  useEffect(() => {
    if (!caption.trim()) {
      setToxicityAlert(null)
      setSuggestedRewrite(null)
      return
    }

    const timer = setTimeout(async () => {
      const result = await toxicityService.detectToxicity(caption)
      if (result.is_toxic || result.toxicity_score >= 0.5) {
        setToxicityAlert({
          score: result.toxicity_score,
          level: result.toxicity_score >= 0.75 ? 'BLOCKED' : 'WARNING'
        })
        const rewrite = await toxicityService.suggestRewrite(caption)
        if (rewrite) setSuggestedRewrite(rewrite)
      } else {
        setToxicityAlert(null)
        setSuggestedRewrite(null)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [caption])

  if (!isOpen) return null

  const handleMediaChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isVideo = file.type.startsWith('video')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024

    if (file.size > maxSize) {
      toast.error(`File size exceeds limit (${isVideo ? '100MB' : '15MB'})`)
      return
    }

    setMediaFile(file)
    setMediaType(isVideo ? 'video' : 'image')

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    if (isVideo) {
      const videoElement = document.createElement('video')
      videoElement.src = URL.createObjectURL(file)
      videoElement.onloadedmetadata = () => {
        setDuration(Math.floor(videoElement.duration))
        URL.revokeObjectURL(videoElement.src)
      }
    }
  }

  const handleRemoveMedia = () => {
    setMediaFile(null)
    setPreview(null)
    setDuration('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (loading) return
    if (!caption.trim() && !preview) {
      toast.error('Please add a caption or upload media')
      return
    }

    if (caption.trim()) {
      const toxicResult = await toxicityService.detectToxicity(caption)
      if (toxicResult.is_toxic || toxicResult.toxicity_score >= 0.5) {
        toast.error('🚫 Post blocked: Caption contains offensive words. Please rewrite.')
        return
      }
    }

    setLoading(true)
    try {
      const isVideo = mediaType === 'video' || mediaType === 'reel' || (mediaFile && mediaFile.type.startsWith('video'))
      const postData = {
        caption: caption.trim(),
        mediaType: isVideo ? (mediaType === 'reel' ? 'reel' : 'video') : 'image',
        image: !isVideo ? preview : null,
        video: isVideo ? preview : null,
        duration: duration || null,
        location: location.trim() || null,
        feeling: feeling.trim() || null,
        createdAt: new Date().toISOString()
      }

      await createPost(postData)

      // Reset
      setCaption('')
      setMediaFile(null)
      setPreview(null)
      setLocation('')
      setFeeling('')
      setDuration('')
      if (onPostCreated) onPostCreated(postData)
      if (onClose) onClose()
      toast.success('Post published successfully! 🎉')
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create post'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const feelings = [
    '😊 Happy', '🔥 Excited', '🌴 Chill', '🚀 Building', 
    '💡 Inspired', '🎧 Vibing', '☕ Relaxed', '🎉 Celebrating'
  ]

  const isVideoMedia = mediaType === 'video' || mediaType === 'reel' || (mediaFile && mediaFile.type.startsWith('video'))

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-[#181818] border border-[#2c2c2c] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="h-14 px-4 border-b border-[#2c2c2c] flex items-center justify-between bg-[#121212] flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm sm:text-base text-white">Create new post</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || (!caption.trim() && !preview) || toxicityAlert?.level === 'BLOCKED'}
            className="px-4 py-1.5 bg-[#0095F6] hover:bg-[#1877F2] disabled:opacity-40 disabled:hover:bg-[#0095F6] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sharing...</span>
              </span>
            ) : (
              'Share'
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-[360px]">
          
          {/* Media Upload / Preview Canvas (7 cols on desktop) */}
          <div className="md:col-span-7 bg-black flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-[#2c2c2c] min-h-[260px] relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="hidden"
            />

            {preview ? (
              <div className="relative w-full h-full min-h-[280px] max-h-[400px] flex items-center justify-center rounded-xl overflow-hidden bg-[#0a0a0a]">
                {isVideoMedia ? (
                  <video
                    src={preview}
                    className="w-full h-full max-h-[380px] object-contain rounded-lg"
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Uploaded preview"
                    className="w-full h-full max-h-[380px] object-contain rounded-lg"
                  />
                )}

                {/* Remove Media Button */}
                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-2.5 right-2.5 p-2 bg-black/70 hover:bg-red-600 text-white rounded-full transition backdrop-blur-sm"
                  title="Remove media"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Media Type Badge */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[11px] font-mono text-white/80 border border-white/10 flex items-center gap-1">
                  {isVideoMedia ? <Film className="w-3 h-3 text-cyan-400" /> : <ImagePlus className="w-3 h-3 text-green-400" />}
                  <span>{isVideoMedia ? (mediaType === 'reel' ? 'Reel Video' : 'Video') : 'Photo'}</span>
                </div>
              </div>
            ) : (
              /* Dropzone Placeholder */
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full min-h-[260px] border-2 border-dashed border-[#363636] hover:border-[#0095F6] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition group bg-[#121212]/50 hover:bg-[#121212]"
              >
                <div className="w-16 h-16 rounded-full bg-[#262626] group-hover:bg-[#0095F6]/10 flex items-center justify-center text-gray-400 group-hover:text-[#0095F6] transition mb-3">
                  <UploadCloud className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">Drag photos and videos here</h4>
                <p className="text-gray-400 text-xs mb-4">Supports JPG, PNG, MP4, WebM (up to 100MB)</p>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-bold rounded-lg transition shadow-md"
                >
                  Select from device
                </button>
              </div>
            )}
          </div>

          {/* Details & Caption Section (5 cols on desktop) */}
          <div className="md:col-span-5 p-4 flex flex-col justify-between space-y-4 bg-[#161616]">
            
            <div className="space-y-3.5">
              {/* User Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#262626] overflow-hidden flex items-center justify-center p-[1px] bg-gradient-to-tr from-yellow-400 to-purple-600 flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs text-white">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white block truncate">@{user?.username || 'user'}</span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#0095F6]" />
                    <span>Public</span>
                  </span>
                </div>
              </div>

              {/* Caption Textarea */}
              <div className="relative">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={4}
                  className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-[#3a3a3a] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
                />
                
                {/* Emoji Bar */}
                <div className="flex items-center justify-between text-gray-400 pt-1 px-1">
                  <div className="flex items-center gap-1.5">
                    {['🔥', '❤️', '✨', '🚀', '🙌'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCaption(prev => prev + emoji)}
                        className="text-xs hover:scale-125 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500">{caption.length}/2,200</span>
                </div>
              </div>

              {/* AI Toxicity Alert & Suggestion Banner */}
              <AnimatePresence>
                {(toxicityAlert || suggestedRewrite) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-white space-y-1.5 text-xs"
                  >
                    <div className="flex items-center gap-1.5 text-red-300 font-semibold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span>Warning: Contains offensive words</span>
                    </div>

                    {suggestedRewrite && (
                      <div className="bg-black/50 p-2 rounded-lg space-y-1.5 border border-white/5">
                        <span className="text-[10px] text-cyan-400 font-bold block">💡 Suggested Polite Version:</span>
                        <p className="text-[11px] italic text-gray-200">"{suggestedRewrite}"</p>
                        <button
                          type="button"
                          onClick={() => {
                            setCaption(suggestedRewrite)
                            setToxicityAlert(null)
                            setSuggestedRewrite(null)
                          }}
                          className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Use Suggestion</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Location Input */}
              {showLocationInput ? (
                <div className="flex items-center gap-2 bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location (e.g. Paris, France)"
                    className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  <button onClick={() => setShowLocationInput(false)} className="text-gray-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLocationInput(true)}
                  className="w-full py-2 px-3 bg-[#121212] hover:bg-[#1f1f1f] border border-[#262626] rounded-xl text-xs text-gray-300 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>{location || 'Add Location'}</span>
                  </span>
                  <span className="text-[10px] text-gray-500">{location ? 'Edit' : '+'}</span>
                </button>
              )}

              {/* Feeling Picker */}
              {showFeelingPicker ? (
                <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Select feeling:</span>
                    <button onClick={() => setShowFeelingPicker(false)} className="text-gray-500 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {feelings.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setFeeling(f)
                          setShowFeelingPicker(false)
                        }}
                        className={`text-[11px] p-1.5 rounded-lg border transition text-left ${
                          feeling === f ? 'bg-[#0095F6]/20 border-[#0095F6] text-white' : 'bg-[#181818] border-[#2a2a2a] text-gray-300 hover:bg-[#222]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFeelingPicker(true)}
                  className="w-full py-2 px-3 bg-[#121212] hover:bg-[#1f1f1f] border border-[#262626] rounded-xl text-xs text-gray-300 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Smile className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{feeling || 'Add Feeling / Activity'}</span>
                  </span>
                  <span className="text-[10px] text-gray-500">{feeling ? 'Edit' : '+'}</span>
                </button>
              )}

            </div>

            {/* Media Type Selector */}
            <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Format</span>
              <div className="flex items-center gap-1.5 bg-[#121212] p-1 rounded-lg border border-[#262626]">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    mediaType === 'image' ? 'bg-[#0095F6] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('reel')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    mediaType === 'reel' ? 'bg-[#0095F6] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Reel
                </button>
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  )
}

export default CreatePost
