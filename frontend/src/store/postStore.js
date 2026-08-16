import { create } from 'zustand'
import axios from 'axios'
import { API_URL } from '../config/api'

export const usePostStore = create((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true })
    try {
      const response = await axios.get(`${API_URL}/posts`)
      const fetched = Array.isArray(response.data) ? response.data : []
      
      // Deduplicate posts strictly by unique ID
      const seen = new Set()
      const deduped = fetched.filter(p => {
        const id = p._id || p.id
        if (!id || seen.has(id)) return false
        seen.add(id)
        return true
      })

      set({ posts: deduped, error: null })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch posts' })
    } finally {
      set({ loading: false })
    }
  },

  createPost: async (postData) => {
    try {
      const response = await axios.post(`${API_URL}/posts`, postData)
      const newPost = response.data
      const newId = newPost._id || newPost.id

      // Replace or prepend without duplicates
      const currentPosts = get().posts
      const filtered = currentPosts.filter(p => (p._id || p.id) !== newId)
      set({ posts: [newPost, ...filtered] })
      return newPost
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create post' })
      throw err
    }
  },

  createComment: async (postId, text) => {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, { text })
      const posts = get().posts.map(post => {
        if ((post._id || post.id) === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), response.data]
          }
        }
        return post
      })
      set({ posts })
      return response.data
    } catch (err) {
      throw err
    }
  },

  likePost: async (postId) => {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/like`)
      const posts = get().posts.map(p =>
        (p._id || p.id) === postId ? { ...p, likes: response.data.likes ?? (p.likes + 1) } : p
      )
      set({ posts })
      return response.data
    } catch (err) {
      throw err
    }
  },

  unlikePost: async (postId) => {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/unlike`)
      const posts = get().posts.map(p =>
        (p._id || p.id) === postId ? { ...p, likes: response.data.likes ?? Math.max(0, p.likes - 1) } : p
      )
      set({ posts })
      return response.data
    } catch (err) {
      throw err
    }
  },

  deletePost: async (postId) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}`)
      const posts = get().posts.filter(p => (p._id || p.id) !== postId)
      set({ posts })
      return postId
    } catch (err) {
      throw err
    }
  }
}))
