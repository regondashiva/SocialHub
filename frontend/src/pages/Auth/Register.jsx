import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      navigate('/')
      toast.success('Registered successfully!')
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Registration failed'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between px-4 py-8 text-[#F5F5F5]">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[350px] space-y-3">
        {/* Main Instagram Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-black border border-[#262626] rounded-sm px-8 pt-8 pb-6 text-center"
        >
          {/* Cursive Brand Logo */}
          <h1 className="text-4xl font-ig-logo tracking-wider text-white mb-3">SocialHub</h1>
          <p className="text-xs font-semibold text-[#A8A8A8] mb-4 leading-normal">
            Sign up to see photos and videos from your friends.
          </p>

          {/* Facebook Login Option */}
          <button className="flex items-center justify-center space-x-2 bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-xs py-2 rounded-lg transition w-full mb-4">
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
            </svg>
            <span>Log in with Facebook</span>
          </button>

          {/* OR Divider */}
          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-[#262626]"></div>
            <span className="px-3 text-[11px] font-semibold text-[#A8A8A8] uppercase">OR</span>
            <div className="flex-1 border-t border-[#262626]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Mobile Number or Email"
                className="w-full bg-[#121212] border border-[#262626] rounded-[3px] px-2.5 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] transition"
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full bg-[#121212] border border-[#262626] rounded-[3px] px-2.5 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] transition"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full bg-[#121212] border border-[#262626] rounded-[3px] px-2.5 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] transition"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full bg-[#121212] border border-[#262626] rounded-[3px] px-2.5 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] transition"
                required
              />
            </div>

            <p className="text-[10px] text-[#A8A8A8] text-center my-2 leading-relaxed">
              People who use our service may have uploaded your contact information to SocialHub.
            </p>

            <button
              type="submit"
              disabled={loading || !formData.email || !formData.username || !formData.password}
              className="w-full bg-[#0095F6] hover:bg-[#1877F2] disabled:opacity-40 text-white font-semibold text-xs py-2 rounded-lg transition duration-200 mt-2"
            >
              {loading ? 'Creating Account...' : 'Sign up'}
            </button>
          </form>
        </motion.div>

        {/* Sign In Switch Box */}
        <div className="w-full bg-black border border-[#262626] rounded-sm py-4 text-center text-xs text-[#F5F5F5]">
          Have an account?{' '}
          <Link to="/login" className="text-[#0095F6] font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>

      {/* Official SocialHub Web Footer */}
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
        </div>
        <div>
          <span>© 2026 SocialHub</span>
        </div>
      </footer>
    </div>
  )
}

export default Register
