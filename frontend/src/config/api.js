import axios from 'axios'
import Cookie from 'js-cookie'

// Direct default URL to deployed Render backend for production fallback
const PRODUCTION_API_URL = 'https://socialhub-g091.onrender.com/api'

export const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : PRODUCTION_API_URL
)

// ML toxicity detection microservice URL
export const ML_API_URL = import.meta.env.VITE_ML_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://socialhub-g091.onrender.com/ml-api'
)

// Axios instance with default configuration and automatic JWT token attachment
const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
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
      Cookie.remove('token')
      if (typeof localStorage !== 'undefined') localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export default api
