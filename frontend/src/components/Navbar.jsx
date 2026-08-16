import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Film, MessageCircle, User, PlusSquare, Heart, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

function Navbar({ activeView, onViewChange, onOpenCreatePost }) {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/', isView: true },
    { id: 'explore', label: 'Explore', icon: Compass, path: '/explore', isView: false },
    { id: 'create', label: 'Create', icon: PlusSquare, isAction: true },
    { id: 'reels', label: 'Reels', icon: Film, path: '/', isView: true },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/', isView: true },
  ]

  const handleItemClick = (item) => {
    if (item.isAction) {
      if (onOpenCreatePost) onOpenCreatePost()
      return
    }

    if (item.isView) {
      if (location.pathname !== '/') navigate('/')
      onViewChange(item.id)
    } else {
      navigate(item.path)
    }
  }

  const isCurrentActive = (item) => {
    if (item.isAction) return false
    if (item.isView) {
      return location.pathname === '/' && activeView === item.id
    }
    return location.pathname === item.path
  }

  return (
    <>
      {/* Mobile Top App Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-black/90 backdrop-blur-md border-b border-[#262626] px-4 flex items-center justify-between z-40">
        <Link to="/" onClick={() => onViewChange && onViewChange('feed')} className="flex items-center space-x-2">
          <h1 className="text-2xl font-ig-logo text-white tracking-wider">SocialHub</h1>
        </Link>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/admin"
            className="p-1.5 text-gray-400 hover:text-white transition rounded-lg hover:bg-white/5"
            title="Admin Moderation"
          >
            <Shield className="w-5 h-5 text-[#0095F6]" />
          </Link>
          <button
            onClick={() => onViewChange && onViewChange('messages')}
            className="p-1.5 text-white hover:opacity-80 transition relative"
          >
            <MessageCircle className="w-6 h-6 stroke-[1.75]" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar with Safe Padding */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-black/95 backdrop-blur-md border-t border-[#262626] px-2 flex items-center justify-around z-40 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isCurrentActive(item)
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="p-2 flex flex-col items-center justify-center text-white transition active:scale-95"
              aria-label={item.label}
            >
              <Icon
                className={`w-6 h-6 transition-all duration-200 ${
                  active ? 'stroke-[2.5] text-[#0095F6] scale-110' : 'stroke-[1.75] text-gray-300'
                }`}
              />
            </button>
          )
        })}

        {/* Profile Avatar Button */}
        <button
          onClick={() => navigate(`/profile/${user?._id || ''}`)}
          className="p-2 flex items-center justify-center active:scale-95 transition"
          aria-label="Profile"
        >
          <div
            className={`w-7 h-7 rounded-full p-[1.5px] ${
              location.pathname.startsWith('/profile') ? 'ring-2 ring-[#0095F6]' : 'border border-[#363636]'
            }`}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Me" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#262626] flex items-center justify-center text-[10px] font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </button>
      </nav>
    </>
  )
}

export default Navbar
