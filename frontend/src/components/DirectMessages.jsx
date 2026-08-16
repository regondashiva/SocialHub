import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Send, Paperclip, Smile, Phone, Video, Info, ArrowLeft, Mic, Image, Heart, Edit } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const DirectMessages = ({ onBackToHome, onViewChange }) => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [selectedChat, setSelectedChat] = useState('1')
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showChatInfo, setShowChatInfo] = useState(false)
  const [messages, setMessages] = useState({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleBack = () => {
    if (onBackToHome) onBackToHome()
    else if (onViewChange) onViewChange('feed')
    else navigate('/')
  }

  const mockChats = [
    {
      id: '1',
      username: 'aria_dev',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
      lastMessage: 'Hey! Are you working on SocialHub?',
      timestamp: '2m',
      unread: 1,
      online: true
    },
    {
      id: '2',
      username: 'dev_sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      lastMessage: 'The new dark theme design looks fire 🔥',
      timestamp: '15m',
      unread: 0,
      online: true
    },
    {
      id: '3',
      username: 'elena_ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      lastMessage: 'Let\'s collaborate on a reel!',
      timestamp: '1h',
      unread: 0,
      online: false
    },
    {
      id: '4',
      username: 'marcus_code',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
      lastMessage: 'Sent a photo.',
      timestamp: '3h',
      unread: 0,
      online: false
    }
  ]

  const mockMessages = {
    '1': [
      { id: 'm1', text: 'Hey! Are you working on SocialHub?', sender: 'aria_dev', timestamp: '10:30 AM' },
      { id: 'm2', text: 'Yes! Just finalized the SocialHub dark mode and DMs interface.', sender: 'me', timestamp: '10:32 AM' },
      { id: 'm3', text: 'That looks so clean! Great work 👏', sender: 'aria_dev', timestamp: '10:33 AM' }
    ],
    '2': [
      { id: 'm1', text: 'The new dark theme design looks fire 🔥', sender: 'dev_sharma', timestamp: '9:15 AM' },
      { id: 'm2', text: 'Appreciate it! Check out the reels player too.', sender: 'me', timestamp: '9:20 AM' }
    ]
  }

  useEffect(() => {
    setMessages(mockMessages)
  }, [])

  const currentChat = mockChats.find(c => c.id === selectedChat) || mockChats[0]
  const currentMessages = messages[selectedChat] || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && selectedChat) {
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMessage]
      }))
      
      setMessage('')
      
      // Auto reply simulation
      setTimeout(() => {
        const replies = ['Awesome! 🙌', 'Love that!', 'Sounds great 👍', 'Check out my new post!']
        const autoReply = {
          id: (Date.now() + 1).toString(),
          text: replies[Math.floor(Math.random() * replies.length)],
          sender: currentChat.username,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), autoReply]
        }))
      }, 1500)
    }
  }

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const filteredChats = mockChats.filter(c =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black text-[#F5F5F5] z-40 flex pl-0 md:pl-60 lg:pl-64">
      
      {/* Left Chat List Panel */}
      <div className={`${selectedChat && 'hidden md:flex'} w-full md:w-80 lg:w-96 border-r border-[#262626] flex flex-col bg-black`}>
        
        {/* Header with Back Button */}
        <div className="p-4 border-b border-[#262626] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleBack} 
                className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#121212] border border-[#262626] transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h2 className="font-bold text-lg text-white tracking-tight ml-2">{user?.username || 'Messages'}</h2>
            </div>
            <button 
              onClick={() => setShowNewMessageModal(true)} 
              className="text-white hover:opacity-70 p-1"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-[#262626] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#363636]"
            />
          </div>
        </div>

        {/* Active Users Horizontal Bar */}
        <div className="p-3 border-b border-[#262626] overflow-x-auto custom-scrollbar flex space-x-4">
          {mockChats.map((chat) => (
            <div key={chat.id} onClick={() => setSelectedChat(chat.id)} className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0">
              <div className="relative">
                <img src={chat.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-1 ring-[#262626]" />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 truncate w-12 text-center">{chat.username}</span>
            </div>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => {
            const isSelected = selectedChat === chat.id
            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`flex items-center space-x-3 px-4 py-3.5 cursor-pointer transition ${
                  isSelected ? 'bg-[#121212]' : 'hover:bg-[#121212]'
                }`}
              >
                <div className="relative">
                  <img src={chat.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white truncate">{chat.username}</span>
                    <span className="text-[11px] text-gray-500">{chat.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-400 truncate max-w-[180px]">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="w-2 h-2 bg-[#0095F6] rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Chat Thread Pane */}
      {selectedChat && currentChat ? (
        <div className="flex-1 flex flex-col bg-black">
          
          {/* Chat Header */}
          <div className="bg-black border-b border-[#262626] px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <button onClick={() => setSelectedChat(null)} className="md:hidden text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <img src={currentChat.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-[#262626]" />
                {currentChat.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{currentChat.username}</h3>
                <p className="text-[11px] text-gray-400">{currentChat.online ? 'Active now' : 'Offline'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <button className="hover:opacity-70"><Phone className="w-5 h-5" /></button>
              <button className="hover:opacity-70"><Video className="w-5 h-5" /></button>
              <button onClick={() => setShowChatInfo(!showChatInfo)} className="hover:opacity-70">
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
            {currentMessages.map((msg) => {
              const isMe = msg.sender === 'me'
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-[#3797F0] text-white rounded-br-xs' 
                      : 'bg-[#262626] text-white rounded-bl-xs'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="block text-[9px] text-white/60 text-right mt-1">{msg.timestamp}</span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Bottom Input Bar */}
          <div className="p-4 bg-black border-t border-[#262626]">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2 bg-[#121212] border border-[#262626] rounded-full px-4 py-2">
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-white">
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder="Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />

              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-white">
                <Image className="w-5 h-5" />
              </button>

              {message.trim() ? (
                <button type="submit" className="text-[#0095F6] font-bold text-xs hover:text-white transition">
                  Send
                </button>
              ) : (
                <button type="button" className="text-gray-400 hover:text-white">
                  <Heart className="w-5 h-5" />
                </button>
              )}
            </form>

            {/* Emoji Picker Popup */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-20 left-6 bg-[#121212] border border-[#262626] rounded-xl shadow-2xl p-3 z-30"
                >
                  <div className="grid grid-cols-6 gap-2 text-xl">
                    {['😀', '😂', '😍', '🔥', '✨', '👍', '❤️', '👏', '🚀', '😎', '🙌', '💯'].map((emoji) => (
                      <button key={emoji} type="button" onClick={() => handleEmojiSelect(emoji)} className="hover:scale-125 transition">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col text-center p-6 space-y-3">
          <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center">
            <Send className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Your Messages</h3>
          <p className="text-xs text-gray-400 max-w-xs">Send private photos and messages to a friend or group.</p>
          <button onClick={() => setShowNewMessageModal(true)} className="bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-bold px-4 py-2 rounded-lg transition">
            Send Message
          </button>
        </div>
      )}
    </div>
  )
}

export default DirectMessages
