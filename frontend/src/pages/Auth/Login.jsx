import React, { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, X, CheckCircle, Lock } from 'lucide-react'

import { API_URL } from '../../config/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const { user, login, loading } = useAuthStore()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
      toast.success('Logged in successfully!')
    } catch (error) {
      toast.error('Login failed')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail || !newPassword) {
      toast.error('Please fill in all fields')
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, newPassword })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Password updated! Please log in.')
        setEmail(resetEmail)
        setPassword(newPassword)
        setShowForgotModal(false)
        setResetEmail('')
        setNewPassword('')
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (err) {
      toast.error('Network error during password reset')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between px-4 py-8 text-[#F5F5F5]">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[350px] space-y-3">
        {/* Main Instagram Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-black border border-[#262626] rounded-sm px-10 pt-10 pb-6 text-center"
        >
          {/* Cursive Brand Logo */}
          <h1 className="text-4xl font-ig-logo tracking-wider text-white mb-8">SocialHub</h1>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Phone number, username, or email"
                className="w-full bg-[#121212] border border-[#262626] rounded-[3px] px-2.5 py-2.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] transition"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#121212] border border-[#262626] rounded-[3px] px-2.5 py-2.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-[#0095F6] hover:bg-[#1877F2] disabled:opacity-40 text-white font-semibold text-xs py-2.5 rounded-lg transition duration-200 mt-2"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-[#262626]"></div>
            <span className="px-4 text-[11px] font-semibold text-[#A8A8A8] uppercase">OR</span>
            <div className="flex-1 border-t border-[#262626]"></div>
          </div>

          {/* Facebook Login Option */}
          <button className="flex items-center justify-center space-x-2 text-xs font-semibold text-[#385185] hover:text-white transition w-full py-1">
            <svg className="w-4 h-4 fill-current text-[#0095F6]" viewBox="0 0 24 24">
              <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
            </svg>
            <span className="text-[#0095F6]">Log in with Facebook</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setResetEmail(email)
              setShowForgotModal(true)
            }}
            className="block text-[11px] text-[#A8A8A8] hover:text-white mt-4 transition mx-auto"
          >
            Forgot password?
          </button>
        </motion.div>

        {/* Sign Up Switch Box */}
        <div className="w-full bg-black border border-[#262626] rounded-sm py-4 text-center text-xs text-[#F5F5F5]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#0095F6] font-semibold hover:underline">
            Sign up
          </Link>
        </div>

        <p className="text-[11px] text-gray-500 text-center pt-2">Get the app.</p>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#121212] border border-[#262626] p-6 rounded-xl space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto text-white">
                <Lock className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="font-bold text-white text-base">Trouble logging in?</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your email or username and set a new password to recover your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3 pt-2">
                <div>
                  <input
                    type="text"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Email address or username"
                    className="w-full bg-black border border-[#262626] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0095F6]"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full bg-black border border-[#262626] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0095F6]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail || !newPassword}
                  className="w-full bg-[#0095F6] hover:bg-[#1877F2] disabled:opacity-40 text-white font-semibold text-xs py-2.5 rounded-lg transition"
                >
                  {resetLoading ? 'Resetting Password...' : 'Reset Password & Log In'}
                </button>
              </form>

              <div className="border-t border-[#262626] pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="text-xs font-bold text-gray-400 hover:text-white"
                >
                  Back to Login
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Instagram Web Footer */}
      <footer className="w-full max-w-4xl pt-8 pb-4 text-center text-[11px] text-[#A8A8A8] space-y-3">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a href="#" className="hover:underline">Meta</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Blog</a>
          <a href="#" className="hover:underline">Jobs</a>
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">API</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Locations</a>
          <a href="#" className="hover:underline">Instagram Lite</a>
          <a href="#" className="hover:underline">Threads</a>
        </div>
        <div>
          <span>© 2026 SocialHub</span>
        </div>
      </footer>
    </div>
  )
}

export default Login
