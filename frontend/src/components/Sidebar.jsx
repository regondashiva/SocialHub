import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
  Menu,
  ShieldCheck,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { motion } from 'framer-motion'

function Sidebar({ activeView, onViewChange, onOpenCreatePost }) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/', isView: true },
    { id: 'search', label: 'Search', icon: Search, path: '/', isView: true },
    { id: 'explore', label: 'Explore', icon: Compass, path: '/explore', isView: false },
    { id: 'reels', label: 'Reels', icon: Film, path: '/', isView: true },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/', isView: true, badge: 3 },
    { id: 'notifications', label: 'Notifications', icon: Heart, path: '/', isView: true },
    { id: 'create', label: 'Create', icon: PlusSquare, action: onOpenCreatePost },
    { id: 'profile', label: 'Profile', icon: User, path: `/profile/${user?._id || ''}`, isView: false },
  ]

  const handleItemClick = (item) => {
    if (item.action) {
      item.action()
      return
    }
    if (item.isView) {
      if (location.pathname !== '/') {
        navigate('/')
      }
      onViewChange(item.id)
    } else if (item.path) {
      navigate(item.path)
    }
  }

  const isItemActive = (item) => {
    if (item.id === 'create') return false
    if (item.isView && location.pathname === '/') {
      return activeView === item.id
    }
    return location.pathname === item.path
  }

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-60 lg:w-64 bg-black border-r border-[#262626] px-4 py-6 z-40 justify-between">
      {/* SocialHub Brand Header */}
      <div className="space-y-6">
        <Link to="/" className="flex items-center space-x-2 px-3 pt-2 pb-4">
          <h1 className="text-3xl font-ig-logo tracking-wider text-white hover:opacity-90 transition">SocialHub</h1>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isItemActive(item)
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg font-normal text-sm transition-colors duration-150 ${active
                    ? 'text-white font-bold bg-[#121212]'
                    : 'text-[#F5F5F5] hover:bg-[#1A1A1A] hover:text-white'
                  }`}
              >
                <div className="flex items-center space-x-4">
                  <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px] text-white' : 'stroke-[1.75px]'}`} />
                  <span className={`${active ? 'font-bold' : 'font-normal'} text-sm`}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#FF3040] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* Instagram Profile & More Footer */}
      <div className="space-y-2 pt-4 border-t border-[#262626]">
        <Link
          to={`/profile/${user?._id}`}
          className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#1A1A1A] transition"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#262626]"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-ig-gradient flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.username || 'user'}</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 p-2.5 rounded-lg text-red-500 hover:bg-[#1A1A1A] transition text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
