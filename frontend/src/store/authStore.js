import { create } from 'zustand'
import axios from 'axios'
import Cookie from 'js-cookie'
import { API_URL } from '../config/api'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        username: email.trim(),
        password
      })
      const { token, user } = response.data
      Cookie.set('token', token, { expires: 7 })
      if (typeof localStorage !== 'undefined') localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      set({ user, error: null })
      return user
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Login failed'
      set({ error: errorMsg })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      const { token, user } = response.data
      Cookie.set('token', token, { expires: 7 })
      if (typeof localStorage !== 'undefined') localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      set({ user, error: null })
      return user
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed'
      set({ error: errorMsg })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    Cookie.remove('token')
    if (typeof localStorage !== 'undefined') localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    set({ user: null })
  },

  checkAuth: async () => {
    const token = Cookie.get('token') || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      try {
        const response = await axios.get(`${API_URL}/auth/me`)
        set({ user: response.data })
      } catch (err) {
        Cookie.remove('token')
        if (typeof localStorage !== 'undefined') localStorage.removeItem('token')
      }
    }
  }
}))
