import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ShieldCheck } from 'lucide-react'

function RightPanel({ onTagClick }) {
  const { user } = useAuthStore()
  const [followingMap, setFollowingMap] = useState({})

  const suggestions = [
    { id: '1', username: 'aria_dev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', subtitle: 'Followed by dev_sharma + 3 more' },
    { id: '2', username: 'dev_sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces', subtitle: 'Suggested for you' },
    { id: '3', username: 'elena_ai', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', subtitle: 'Follows you' },
    { id: '4', username: 'marcus_code', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces', subtitle: 'Suggested for you' },
  ]

  const toggleFollow = (id) => {
    setFollowingMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside className="hidden lg:block w-80 fixed top-8 right-12 space-y-6 text-[#F5F5F5]">
      {/* Current User Header */}
      <div className="flex items-center justify-between">
        <Link to={`/profile/${user?._id}`} className="flex items-center space-x-3 group">
          <div className="ig-story-ring p-[1.5px]">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-11 h-11 rounded-full object-cover border border-black" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#121212] border border-black flex items-center justify-center font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:opacity-80 transition">{user?.username || 'user'}</p>
            <p className="text-[11px] text-gray-400">@{user?.username?.toLowerCase() || 'user'}</p>
          </div>
        </Link>
        <button className="text-xs font-bold text-ig-blue hover:text-white transition">Switch</button>
      </div>

      {/* Suggested for You Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400">Suggested for you</span>
          <button className="text-xs font-bold text-white hover:text-gray-400 transition">See All</button>
        </div>

        {/* Creator List */}
        <div className="space-y-3">
          {suggestions.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <img src={item.avatar} alt={item.username} className="w-8 h-8 rounded-full object-cover ring-1 ring-[#262626]" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate hover:underline cursor-pointer">{item.username}</p>
                  <p className="text-[10px] text-gray-400 truncate">{item.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(item.id)}
                className={`text-xs font-bold transition ${followingMap[item.id] ? 'text-gray-400' : 'text-ig-blue hover:text-white'}`}
              >
                {followingMap[item.id] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram Footer Links */}
      <div className="space-y-3 text-[11px] text-gray-500 leading-relaxed">
        <p className="flex flex-wrap gap-x-2 gap-y-1">
          <a href="#" className="hover:underline">About</a> •
          <a href="#" className="hover:underline">Help</a> •
          <a href="#" className="hover:underline">Press</a> •
          <a href="#" className="hover:underline">API</a> •
          <a href="#" className="hover:underline">Jobs</a> •
          <a href="#" className="hover:underline">Privacy</a> •
          <a href="#" className="hover:underline">Terms</a> •
          <a href="#" className="hover:underline">Locations</a>
        </p>
        <p className="uppercase text-[10px] tracking-wider text-gray-500 font-semibold">
          © 2026 INSTAGRAM / SOCIALHUB
        </p>
      </div>
    </aside>
  )
}

export default RightPanel
