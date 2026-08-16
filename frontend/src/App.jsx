import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Explore from './pages/Explore'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import './App.css'

const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  const { user, checkAuth } = useAuthStore()
  const [activeView, setActiveView] = useState('feed')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    let isMounted = true
    const initAuth = async () => {
      try {
        await checkAuth()
      } catch (e) {
        console.error(e)
      } finally {
        if (isMounted) setAuthChecking(false)
      }
    }

    const fallbackTimer = setTimeout(() => {
      if (isMounted) setAuthChecking(false)
    }, 1200)

    initAuth()

    return () => {
      isMounted = false
      clearTimeout(fallbackTimer)
    }
  }, [checkAuth])

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4 text-white">
        <h1 className="text-4xl font-ig-logo tracking-wider text-white animate-pulse">SocialHub</h1>
        <div className="w-6 h-6 border-2 border-[#0095F6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-[#0095F6] selection:text-white">
        {user && (
          <>
            {/* Desktop Left Navigation Sidebar */}
            <Sidebar 
              activeView={activeView} 
              onViewChange={(view) => setActiveView(view)} 
              onOpenCreatePost={() => setShowNewPostModal(true)}
            />

            {/* Mobile Top & Bottom Navigation Bars */}
            <Navbar 
              activeView={activeView} 
              onViewChange={(view) => setActiveView(view)} 
              onOpenCreatePost={() => setShowNewPostModal(true)}
            />
          </>
        )}

        <main className={user ? 'md:pl-64 lg:pl-72 transition-all duration-300' : ''}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Feed 
                    activeView={activeView} 
                    onViewChange={(view) => setActiveView(view)}
                    showNewPostModal={showNewPostModal}
                    setShowNewPostModal={setShowNewPostModal}
                  />
                </PrivateRoute>
              } 
            />
            <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          </Routes>
        </main>
        
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#121824',
              color: '#F3F4F6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
            }
          }}
        />
      </div>
    </Router>
  )
}

export default App
