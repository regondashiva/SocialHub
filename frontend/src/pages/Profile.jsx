import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Loader, Grid, Bookmark, Film, Settings, UserPlus, Check, ArrowLeft } from 'lucide-react'
import { API_URL } from '../config/api'
import { useAuthStore } from '../store/authStore'

function Profile() {
  const { userId } = useParams()
  const { user: currentUser } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  const [isFollowing, setIsFollowing] = useState(false)

  const isOwnProfile = currentUser?._id === userId || (!userId && currentUser)

  useEffect(() => {
    const fetchProfile = async () => {
      const targetId = userId || currentUser?._id
      if (!targetId) return

      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/users/${targetId}`)
        setProfile(response.data)
        setPosts(response.data.posts || [])
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, currentUser])

  if (loading) {
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

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-14 pb-20 md:py-8 text-white">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between pb-3 mb-3 border-b border-[#262626]">
        <Link to="/" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-bold text-base tracking-tight">{profile.username}</h1>
        <button className="text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-[#121212] sm:bg-black border border-[#262626] rounded-2xl p-4 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
          
          {/* Avatar with gradient border */}
          <div className="relative group">
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
          </div>

          {/* Profile Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{profile.username}</h2>
              
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {isOwnProfile ? (
                  <button className="px-4 py-1.5 bg-[#262626] hover:bg-[#363636] text-white text-xs sm:text-sm font-semibold rounded-lg transition">
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition ${
                        isFollowing 
                          ? 'bg-[#262626] text-white hover:bg-[#363636]' 
                          : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="px-4 py-1.5 bg-[#262626] hover:bg-[#363636] text-white text-xs sm:text-sm font-semibold rounded-lg transition">
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
                <span className="font-bold text-base sm:text-lg">{profile.followers?.length || 0}</span>
                <p className="text-gray-400 text-xs sm:text-sm">followers</p>
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg">{profile.following?.length || 0}</span>
                <p className="text-gray-400 text-xs sm:text-sm">following</p>
              </div>
            </div>

            {/* Bio */}
            <div className="text-left mt-2">
              <p className="text-sm font-medium text-white">{profile.fullName || profile.username}</p>
              <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line mt-1">{profile.bio || '✨ Welcome to my SocialHub profile!'}</p>
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
          <span>Posts</span>
        </button>
        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-2 py-3 border-b-2 transition ${
            activeTab === 'reels' ? 'border-white text-white' : 'border-transparent hover:text-gray-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Reels</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 border-b-2 transition ${
            activeTab === 'saved' ? 'border-white text-white' : 'border-transparent hover:text-gray-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved</span>
        </button>
      </div>

      {/* Responsive Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#121212] sm:bg-black border border-[#262626] rounded-xl">
          <Grid className="w-10 h-10 mx-auto text-gray-600 mb-2" />
          <p className="text-sm font-semibold text-white">No Posts Yet</p>
          <p className="text-xs text-gray-400 mt-1">When {profile.username} shares photos or reels, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-3 md:gap-4">
          {posts.map((post) => (
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
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white font-bold text-sm">
                <span>❤️ {post.likes || 0}</span>
                <span>💬 {post.comments?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile
