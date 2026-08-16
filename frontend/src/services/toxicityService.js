import axios from 'axios'
import { ML_API_URL } from '../config/api'

export const toxicityService = {
  async detectToxicity(text, language = 'en') {
    if (!text || !text.trim()) {
      return { toxicity_score: 0, categories: {}, is_toxic: false }
    }
    try {
      const response = await axios.post(`${ML_API_URL}/detect`, {
        text,
        language
      })
      return response.data
    } catch (error) {
      console.warn('ML Service detect warning:', error.message)
      return {
        toxicity_score: 0,
        categories: {},
        is_toxic: false
      }
    }
  },

  async suggestRewrite(text) {
    if (!text || !text.trim()) return null
    try {
      const response = await axios.post(`${ML_API_URL}/suggest-rewrite`, { text })
      return response.data.suggested_rewrite || response.data.suggestion || response.data.suggested || null
    } catch (error) {
      console.warn('ML Service rewrite warning:', error.message)
      return null
    }
  },

  getToxicityLevel(score) {
    if (score < 0.5) return { level: 'safe', color: 'green' }
    if (score < 0.75) return { level: 'warning', color: 'yellow' }
    return { level: 'toxic', color: 'red' }
  }
}
