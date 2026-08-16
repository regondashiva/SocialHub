import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Film, MessageCircle, User, PlusSquare, Heart, Shield, Bell, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { API_URL } from '../config/api'

function Navbar({ activeView, onViewChange, onOpenCreatePost }) {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const fetchNotifications = async () => {
    if (!user) return
    try {
      const res = await axios.get(`${API_URL}/notifications`)
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchNotifications()
    const timer = setInterval(fetchNotifications, 10000)
    return () => clearInterval(timer)
  }, [user])

  const handleOpenNotifications = async () => {
    setShowNotifications(true)
    if (unreadCount > 0) {
      try {
        await axios.put(`${API_URL}/notifications/read`)
        setUnreadCount(0)
      } catch (e) {}
    }
  }

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
      if (onViewChange) onViewChange(item.id)
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

          {/* Notifications Heart Icon */}
          <button
            onClick={handleOpenNotifications}
            className="p-1.5 text-white hover:opacity-80 transition relative"
            title="Notifications"
          >
            <Heart className="w-6 h-6 stroke-[1.75]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-black" />
            )}
          </button>

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
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </button>
      </nav>

      {/* Notifications Drawer / Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-2xl space-y-3 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  Notifications
                </h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 scrollbar-thin scrollbar-thumb-[#262626]">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-8">No notifications yet</p>
                ) : (
                  notifications.map((notif) => {
                    const sender = notif.sender || { username: 'someone', avatar: '' }
                    return (
                      <div
                        key={notif._id}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl transition ${
                          notif.read ? 'bg-black/30' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center overflow-hidden flex-shrink-0 font-bold text-xs">
                            {sender.avatar ? (
                              <img src={sender.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              sender.username.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div className="text-xs min-w-0">
                            <p className="text-white">
                              <span className="font-bold mr-1">@{sender.username}</span>
                              <span className="text-gray-300">
                                {notif.type === 'like' && 'liked your post ❤️'}
                                {notif.type === 'comment' && `commented: "${notif.commentText || ''}" 💬`}
                                {notif.type === 'follow' && 'started following you 👤'}
                              </span>
                            </p>
                            <span className="text-[10px] text-gray-500">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {notif.post?.image && (
                          <img
                            src={notif.post.image}
                            alt=""
                            className="w-8 h-8 rounded object-cover flex-shrink-0 border border-[#262626]"
                          />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
