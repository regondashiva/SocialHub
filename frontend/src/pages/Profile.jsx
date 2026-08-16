import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  Loader, Grid, Bookmark, Film, Settings, UserPlus, Check, ArrowLeft, 
  Camera, Edit3, X, LogOut, Shield, Globe, UserCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { API_URL } from '../config/api'
import { useAuthStore } from '../store/authStore'

function Profile() {
  const { userId } = useParams()
  const { user: currentUser, logout } = useAuthStore()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const fileInputRef = useRef(null)

  // Edit form state
  const [editForm, setEditForm] = useState({
    username: '',
    fullName: '',
    bio: '',
    avatar: '',
    website: ''
  })

  const isOwnProfile = currentUser?._id === userId || (!userId && currentUser)
  const targetId = userId || currentUser?._id

  const fetchProfile = async () => {
    if (!targetId) return

    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/users/${targetId}`)
      const userData = response.data
      setProfile(userData)
      setPosts(userData.posts || [])
      setSavedPosts(userData.savedPosts || [])
      setFollowersCount(userData.followers?.length || 0)
      setFollowingCount(userData.following?.length || 0)

      if (currentUser && userData.followers) {
        setIsFollowing(userData.followers.some(f => 
          (typeof f === 'string' ? f : f._id) === currentUser._id
        ))
      }

      // Pre-fill edit form
      setEditForm({
        username: userData.username || '',
        fullName: userData.fullName || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        website: userData.website || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [targetId, currentUser])

  // Handle Follow / Unfollow Toggle
  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    try {
      if (isFollowing) {
        setIsFollowing(false)
        setFollowersCount(prev => Math.max(0, prev - 1))
        await axios.post(`${API_URL}/users/${targetId}/unfollow`)
        toast.success(`Unfollowed @${profile.username}`)
      } else {
        setIsFollowing(true)
        setFollowersCount(prev => prev + 1)
        await axios.post(`${API_URL}/users/${targetId}/follow`)
        toast.success(`Following @${profile.username}`)
      }
    } catch (err) {
      toast.error('Failed to update follow status')
      fetchProfile()
    }
  }

  // Handle DP file selection
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar image size must be under 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatar: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Save Profile edits to MongoDB
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      const response = await axios.put(`${API_URL}/users/profile`, editForm)
      setProfile(prev => ({ ...prev, ...response.data }))
      setShowEditModal(false)
      toast.success('Profile updated successfully!')
      fetchProfile()
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile'
      toast.error(msg)
    } finally {
      setEditLoading(false)
    }
  }

  // Handle Logout
  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-white">
        <Loader className="w-8 h-8 animate-spin text-[#0095F6]" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-gray-400 text-sm mb-4">The link you followed may be broken, or the user may have been removed.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-[#0095F6] text-white rounded-lg text-sm font-semibold">
          Back to Feed
        </Link>
      </div>
    )
  }

  // Filter posts based on active tab
  const displayedPosts = activeTab === 'posts' 
    ? posts 
    : activeTab === 'reels' 
    ? posts.filter(p => p.mediaType === 'reel' || p.mediaType === 'video' || p.video)
    : savedPosts

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-14 pb-20 md:py-8 text-white">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between pb-3 mb-3 border-b border-[#262626]">
        <Link to="/" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-bold text-base tracking-tight">{profile.username}</h1>
        <button onClick={() => setShowSettingsModal(true)} className="text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-[#121212] sm:bg-black border border-[#262626] rounded-2xl p-4 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
          
          {/* Avatar with Camera Overlay */}
          <div className="relative group cursor-pointer" onClick={() => isOwnProfile && setShowEditModal(true)}>
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover border-2 border-black"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#262626] flex items-center justify-center text-2xl sm:text-3xl font-bold text-white border-2 border-black">
                  {profile.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{profile.username}</h2>
              
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-1.5 bg-[#262626] hover:bg-[#363636] text-white text-xs sm:text-sm font-semibold rounded-lg transition flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="p-2 bg-[#262626] hover:bg-[#363636] text-white rounded-lg transition"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      className={`px-5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center gap-1.5 ${
                        isFollowing 
                          ? 'bg-[#262626] text-white hover:bg-[#363636]' 
                          : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => navigate('/?view=messages')}
                      className="px-4 py-1.5 bg-[#262626] hover:bg-[#363636] text-white text-xs sm:text-sm font-semibold rounded-lg transition"
                    >
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-around sm:justify-start sm:gap-8 py-3 border-y sm:border-none border-[#262626] mb-3 text-center sm:text-left">
              <div>
                <span className="font-bold text-base sm:text-lg">{posts.length}</span>
                <p className="text-gray-400 text-xs sm:text-sm">posts</p>
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg">{followersCount}</span>
                <p className="text-gray-400 text-xs sm:text-sm">followers</p>
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg">{followingCount}</span>
                <p className="text-gray-400 text-xs sm:text-sm">following</p>
              </div>
            </div>

            {/* Bio */}
            <div className="text-left mt-2 space-y-1">
              <p className="text-sm font-bold text-white">{profile.fullName || profile.username}</p>
              <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line">{profile.bio || '✨ Welcome to my SocialHub profile!'}</p>
              {profile.website && (
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-[#0095F6] hover:underline flex items-center gap-1 font-semibold pt-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{profile.website}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#262626] justify-center gap-12 sm:gap-16 mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 py-3 border-b-2 transition ${
            activeTab === 'posts' ? 'border-white text-white' : 'border-transparent hover:text-gray-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({posts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-2 py-3 border-b-2 transition ${
            activeTab === 'reels' ? 'border-white text-white' : 'border-transparent hover:text-gray-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Reels ({posts.filter(p => p.mediaType === 'reel' || p.mediaType === 'video' || p.video).length})</span>
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-3 border-b-2 transition ${
              activeTab === 'saved' ? 'border-white text-white' : 'border-transparent hover:text-gray-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {/* Responsive Grid */}
      {displayedPosts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#121212] sm:bg-black border border-[#262626] rounded-xl">
          <Grid className="w-10 h-10 mx-auto text-gray-600 mb-2" />
          <p className="text-sm font-semibold text-white">No {activeTab} yet</p>
          <p className="text-xs text-gray-400 mt-1">
            {activeTab === 'saved' 
              ? 'Save photos and videos that you want to see again.' 
              : activeTab === 'reels' 
              ? 'Shared reels will appear here.'
              : 'When photos or videos are shared, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-3 md:gap-4">
          {displayedPosts.map((post) => (
            <div
              key={post._id || post.id}
              className="aspect-square bg-[#1a1a1a] rounded-md sm:rounded-lg overflow-hidden relative group cursor-pointer"
            >
              {post.image ? (
                <img
                  src={post.image}
                  alt={post.caption || 'post'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              ) : post.video ? (
                <video
                  src={post.video}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-3 text-center text-xs text-gray-400 bg-[#161616]">
                  {post.caption?.slice(0, 50) || 'Post'}
                </div>
              )}
              
              {post.mediaType === 'reel' && (
                <div className="absolute top-2 right-2 text-white bg-black/60 p-1 rounded-full">
                  <Film className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white font-bold text-xs sm:text-sm">
                <span>❤️ {post.likes || 0}</span>
                <span>💬 {post.comments?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#121212] border border-[#262626] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <h3 className="font-bold text-base text-white">Edit Profile & Avatar</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar Preview & File Input */}
              <div className="flex items-center gap-4 py-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
                    {editForm.avatar ? (
                      <img src={editForm.avatar} alt="" className="w-full h-full rounded-full object-cover border border-black" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#262626] flex items-center justify-center text-lg font-bold">
                        {editForm.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold rounded-lg transition"
                  >
                    Upload New DP / Avatar
                  </button>
                  <p className="text-[11px] text-gray-500 mt-1">PNG, JPG, or GIF up to 5MB</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Your Full Name"
                    className="w-full bg-black border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0095F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="username"
                    required
                    className="w-full bg-black border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0095F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Write a brief bio..."
                    rows="3"
                    className="w-full bg-black border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0095F6] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-black border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0095F6]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-[#262626] hover:bg-[#363636] text-white text-xs font-semibold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 bg-[#0095F6] hover:bg-[#1877F2] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <h3 className="font-bold text-base text-white">Settings & Account</h3>
                <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 text-sm">
                <button
                  onClick={() => {
                    setShowSettingsModal(false)
                    setShowEditModal(true)
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center gap-3 text-white transition"
                >
                  <Edit3 className="w-4 h-4 text-gray-400" />
                  <span>Edit Profile & Avatar</span>
                </button>

                <Link
                  to="/admin"
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center gap-3 text-white transition"
                >
                  <Shield className="w-4 h-4 text-[#0095F6]" />
                  <span>Admin Moderation Portal</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-500/10 flex items-center gap-3 text-red-400 transition"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Profile
