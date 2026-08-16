import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { usePostStore } from '../store/postStore'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import StoriesBar from '../components/StoriesBar'
import ReelsSection from '../components/ReelsSection'
import DirectMessages from '../components/DirectMessages'
import RightPanel from '../components/RightPanel'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Feed({ activeView = 'feed', onViewChange, showNewPostModal, setShowNewPostModal }) {
  const { posts, loading, fetchPosts, createPost } = usePostStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentView, setCurrentView] = useState(activeView)

  useEffect(() => {
    setCurrentView(activeView)
  }, [activeView])

  const optimizedFetchPosts = useCallback(() => {
    fetchPosts()
  }, [fetchPosts])

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts
    return posts.filter(post =>
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [posts, searchQuery])

  useEffect(() => {
    optimizedFetchPosts()
    const interval = setInterval(optimizedFetchPosts, 30000)
    return () => clearInterval(interval)
  }, [optimizedFetchPosts])

  const handleNewPost = async (postData) => {
    await createPost(postData)
    setShowNewPostModal(false)
  }

  if (currentView === 'reels') {
    return <ReelsSection onBackToHome={() => onViewChange ? onViewChange('feed') : setCurrentView('feed')} />
  }

  if (currentView === 'messages') {
    return <DirectMessages onBackToHome={() => onViewChange ? onViewChange('feed') : setCurrentView('feed')} onViewChange={onViewChange || setCurrentView} />
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 md:pb-10 pt-16 md:pt-4">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main Feed Column (Center Grid 8 cols on Desktop) */}
        <main className="lg:col-span-8 max-w-ig-feed mx-auto w-full space-y-3 sm:space-y-4">

          {/* Instagram Stories Bar */}
          <StoriesBar />

          {/* Create Post Modal Trigger */}
          <CreatePost
            isOpen={showNewPostModal}
            onClose={() => setShowNewPostModal(false)}
            onPostCreated={handleNewPost}
          />

          {/* Search Bar */}
          {activeView === 'search' && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#363636]"
              />
            </div>
          )}

          {/* Loading Shimmer State */}
          {loading && posts.length === 0 ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-black border border-[#262626] p-4 space-y-3 rounded-lg skeleton-shimmer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#262626]"></div>
                    <div className="h-3 w-1/4 bg-[#262626] rounded"></div>
                  </div>
                  <div className="h-64 bg-[#262626] rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            /* Posts Feed */
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-black border border-[#262626] rounded-lg">
                    <p className="text-gray-400 text-sm">No posts to display.</p>
                  </div>
                ) : (
                  filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id || post._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* Right Widget Panel Column (Desktop 4 cols) */}
        <RightPanel />

      </div>
    </div>
  )
}

export default Feed
