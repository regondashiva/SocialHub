import React, { useState, useRef } from 'react'
import { ImagePlus, X, MapPin, Smile, Hash, UserPlus, Video, Music, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePostStore } from '../store/postStore'
import { toxicityService } from '../services/toxicityService'
import toast from 'react-hot-toast'

function CreatePost({ isOpen, onClose, onPostCreated }) {
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [mediaType, setMediaType] = useState('image') // 'image', 'video', 'reel'
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [location, setLocation] = useState('')
  const [feeling, setFeeling] = useState('')
  const [duration, setDuration] = useState('')
  const fileInputRef = useRef(null)
  const { createPost } = usePostStore()

  const handleMediaChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const maxSize = mediaType === 'video' || mediaType === 'reel' ? 100 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        const sizeLimit = mediaType === 'video' || mediaType === 'reel' ? '100MB' : '10MB'
        toast.error(`${mediaType === 'image' ? 'Image' : 'Video'} size should be less than ${sizeLimit}`)
        return
      }
      
      if (mediaType === 'image') {
        setImage(file)
        setVideo(null)
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result)
        reader.readAsDataURL(file)
      } else {
        setVideo(file)
        setImage(null)
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result)
        reader.readAsDataURL(file)
        
        const videoElement = document.createElement('video')
        videoElement.src = URL.createObjectURL(file)
        videoElement.onloadedmetadata = () => {
          setDuration(Math.floor(videoElement.duration))
          URL.revokeObjectURL(videoElement.src)
        }
      }
    }
  }

  const handleSubmit = async () => {
    if (loading) return
    if (!caption.trim() && !image && !video && !preview) {
      toast.error('Add a caption or media')
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
      const postData = {
        caption: caption.trim(),
        mediaType,
        image: mediaType === 'image' ? preview : null,
        video: (mediaType === 'video' || mediaType === 'reel') ? preview : null,
        duration: duration || null,
        location: location.trim() || null,
        feeling: feeling.trim() || null,
        createdAt: new Date().toISOString()
      }

      await createPost(postData)
      setCaption('')
      setImage(null)
      setVideo(null)
      setPreview(null)
      setDuration('')
      setLocation('')
      setFeeling('')
      if (onPostCreated) onPostCreated(postData)
      if (onClose) onClose()
      toast.success('Post created successfully!')
    } catch (error) {
      toast.error('Failed to create post')
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const feelings = [
    '😊 Happy', '🎉 Excited', '🤔 Thinking', '😎 Chill', 
    '🚀 Building', '💡 Inspired', '🔥 On Fire'
  ]

  const content = (
    <div className="glass-card border border-white/10 p-5 rounded-2xl shadow-2xl relative">
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-cyan flex items-center justify-center shadow-glow-violet flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="flex-1">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Share your thought or spark a idea..."
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none text-base font-normal pt-1"
            rows="2"
          />
        </div>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative mb-4 rounded-xl overflow-hidden border border-white/10"
          >
            <img src={preview} alt="preview" className="w-full max-h-[300px] object-contain bg-obsidian" />
            <button
              onClick={() => {
                setImage(null)
                setPreview(null)
              }}
              className="absolute top-2 right-2 bg-obsidian-card backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Type Tabs */}
      <div className="flex space-x-2 mb-4">
        {[
          { type: 'image', label: 'Photo', icon: ImagePlus },
          { type: 'video', label: 'Video', icon: Video },
          { type: 'reel', label: 'Reel', icon: Music },
        ].map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => setMediaType(type)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              mediaType === type
                ? 'bg-accent/20 border border-accent/50 text-accent shadow-glow-violet'
                : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Media Drop Zone */}
      {!preview && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-xl p-5 mb-4 text-center hover:border-accent/50 hover:bg-white/[0.02] transition-all duration-200 cursor-pointer group"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImagePlus className="w-6 h-6 text-accent" />
            </div>
            <p className="text-xs text-gray-300 font-semibold">
              Click or drag to upload {mediaType}
            </p>
            <p className="text-[10px] text-gray-500">Max size 100MB</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-semibold text-gray-400 hover:text-cyan flex items-center space-x-1 transition"
        >
          <Hash className="w-4 h-4" />
          <span>{showAdvanced ? 'Less Options' : 'Location & Feeling'}</span>
        </button>

        <div className="flex items-center space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmit}
            disabled={loading || (!caption.trim() && !image && !video && !preview)}
            className="bg-neon-gradient text-white px-5 py-2 rounded-xl text-xs font-bold shadow-glow-violet hover:shadow-glow-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Publishing...' : 'Share Post'}
          </motion.button>
        </div>
      </div>

      {/* Advanced Options */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-white/5 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Add location tag..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Smile className="w-4 h-4 text-gray-400" />
              <select
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="" className="bg-obsidian">Select current mood...</option>
                {feelings.map((f) => (
                  <option key={f} value={f} className="bg-obsidian">{f}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
        onChange={handleMediaChange}
        className="hidden"
      />
    </div>
  )

  if (isOpen !== undefined) {
    if (!isOpen) return null
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
          {content}
        </motion.div>
      </div>
    )
  }

  return content
}

export default CreatePost

