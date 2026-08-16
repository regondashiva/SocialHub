import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Loader, Search, UserPlus, Check, Sparkles } from 'lucide-react'
import { API_URL } from '../config/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function Explore() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [followingMap, setFollowingMap] = useState({})

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/users`)
        setUsers(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users
    return users.filter(u =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(search.toLowerCase())
    )
  }, [users, search])

  const { user: currentUser } = useAuthStore()

  const toggleFollow = async (userId, e) => {
    e.preventDefault()
    e.stopPropagation()
    const currentlyFollowing = !!followingMap[userId]
    setFollowingMap(prev => ({ ...prev, [userId]: !currentlyFollowing }))
    try {
      if (currentlyFollowing) {
        await axios.post(`${API_URL}/users/${userId}/unfollow`)
        toast.success('Unfollowed')
      } else {
        await axios.post(`${API_URL}/users/${userId}/follow`)
        toast.success('Following')
      }
    } catch (err) {
      setFollowingMap(prev => ({ ...prev, [userId]: currentlyFollowing }))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-white">
        <Loader className="w-8 h-8 animate-spin text-[#0095F6]" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-14 pb-20 md:py-8 text-white">
      {/* Header & Search */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Discover Creators</h1>
          </div>
          <span className="text-xs text-gray-400 font-medium">{filteredUsers.length} creators</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search creators by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121212] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0095F6] transition"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#121212] border border-[#262626] rounded-2xl">
          <p className="text-gray-400 text-sm">No creators found matching "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredUsers.map((user) => {
            const isFollowing = !!followingMap[user._id]
            return (
              <Link
                key={user._id}
                to={`/profile/${user._id}`}
                className="bg-[#121212] hover:bg-[#181818] border border-[#262626] hover:border-[#363636] rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition group relative"
              >
                {/* Avatar */}
                <div className="relative mb-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover border border-black"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#262626] border border-black flex items-center justify-center font-bold text-lg text-white">
                        {user.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <h3 className="font-bold text-sm text-white group-hover:text-[#0095F6] transition truncate w-full">
                  {user.username}
                </h3>
                <p className="text-gray-400 text-xs truncate w-full mb-3">
                  {user.fullName || `@${user.username}`}
                </p>

                {/* Follow Button */}
                <button
                  onClick={(e) => toggleFollow(user._id, e)}
                  className={`mt-auto w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isFollowing
                      ? 'bg-[#262626] text-white hover:bg-[#333]'
                      : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Explore
