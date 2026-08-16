import axios from 'axios'
import Cookie from 'js-cookie'

// In production, VITE_API_URL can be set to the deployed backend URL (e.g., https://socialhub-api.onrender.com/api)
// In local development or same-origin proxy, it defaults to /api or http://localhost:5000/api
export const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api'
)

// ML toxicity detection microservice URL
export const ML_API_URL = import.meta.env.VITE_ML_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : '/ml-api'
)

// Axios instance with default configuration and automatic JWT token attachment
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach auth token from Cookie or localStorage
api.interceptors.request.use(
  (config) => {
    const token = Cookie.get('token') || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 unauthenticated errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid / expired
      Cookie.remove('token')
      if (typeof localStorage !== 'undefined') localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export default api
