import axios from 'axios'
import { ML_API_URL } from '../config/api'

// Comprehensive multilingual toxicity dictionary with severity weights (0.0 - 1.0)
const TOXIC_PATTERNS = {
  // English
  en: [
    { pattern: /\b(kill yourself|die in a fire|hope you die|i will kill you|murder you|sl slit)\b/i, score: 0.95, category: 'threat', rewrite: 'Let\'s keep the conversation respectful and safe.' },
    { pattern: /\b(fuck|fucking|fucker|motherfucker|cunt|cock|dickhead)\b/i, score: 0.88, category: 'obscene', rewrite: 'Let\'s express our thoughts without profanity.' },
    { pattern: /\b(bitch|slut|whore|bastard|asshole|dipshit|jerk)\b/i, score: 0.82, category: 'insult', rewrite: 'I disagree with your point, but let\'s be civil.' },
    { pattern: /\b(idiot|moron|stupid|dumb|loser|ugly|pathetic|worthless|trash)\b/i, score: 0.72, category: 'insult', rewrite: 'I see things differently here.' },
    { pattern: /\b(nigger|nigga|faggot|chink|kike|retard|retarded)\b/i, score: 0.98, category: 'hate_speech', rewrite: 'Let\'s treat everyone with dignity and respect.' },
    { pattern: /\b(shut up|get lost|nobody asked|trash opinion)\b/i, score: 0.58, category: 'harassment', rewrite: 'I have a different perspective on this.' },
  ],
  // Hinglish & Romanized Hindi
  'hi-en': [
    { pattern: /\b(chutiya|chutiye|chutye|chootiya|choot)\b/i, score: 0.92, category: 'insult', rewrite: 'Kripya tameez se baat karein.' },
    { pattern: /\b(bhenchod|bhen k lode|behenchod|bc|mc|madarchod|madar chod|bhosdike|bhosadi)\b/i, score: 0.95, category: 'severe_toxic', rewrite: 'Aapki baat se sehmat nahi hu, par shant rahein.' },
    { pattern: /\b(laude|lode|lauda|gaand|gandu|gaandu|tatte|lund)\b/i, score: 0.90, category: 'obscene', rewrite: 'Shishtachaar banaye rakhein.' },
    { pattern: /\b(kamina|kamine|kutta|kutte|harami|haramkhor|saale|saala|suar)\b/i, score: 0.78, category: 'insult', rewrite: 'Thoda shaanti aur sammaan se baat karein.' },
    { pattern: /\b(gadha|gadhe|bekaar|bakwaas|pagal|chup kar|dafa ho)\b/i, score: 0.65, category: 'harassment', rewrite: 'Mujhe lagta hai is vishay par dusra nazariya bhi hai.' },
    { pattern: /\b(maar dunga|jaan se marunga|khatam kar dunga|dekh lunga tujhe)\b/i, score: 0.96, category: 'threat', rewrite: 'Vivada ko bina hinsa ke suljhate hain.' },
  ],
  // Hindi (Devanagari)
  hi: [
    { pattern: /(मादरचोद|बहनचोद|भोसड़ीके|गांडू|लौड़े|चूतिया|कमीना|हरामी)/i, score: 0.95, category: 'severe_toxic', rewrite: 'कृपया शिष्ट भाषा का प्रयोग करें।' },
    { pattern: /(मार दूंगा|जान से मारूंगा|खत्म कर दूंगा|हत्या|काट दूंगा)/i, score: 0.95, category: 'threat', rewrite: 'विवाद को शांतिपूर्ण तरीके से हल करें।' },
    { pattern: /(बेवकूफ|पागल|गधा|कुत्ता|नालायक|झूठा|चुप रहो)/i, score: 0.68, category: 'insult', rewrite: 'मैं आपकी बात से पूरी तरह सहमत नहीं हूँ।' },
  ],
  // Telugu
  te: [
    { pattern: /(లంజాకోడి|దెంగు|పూకు|మద్ద|గుద్ద)/i, score: 0.95, category: 'severe_toxic', rewrite: 'దయచేసి గౌరవంగా మాట్లాడండి.' },
    { pattern: /(చంపేస్తాను|చావు|హత్య|నరుకుతాను)/i, score: 0.95, category: 'threat', rewrite: 'దయచేసి హింసను ప్రోత్సహించకండి.' },
    { pattern: /(పిచ్చి|దొంగ|మూర్ఖుడు|సిగ్గులేని)/i, score: 0.70, category: 'insult', rewrite: 'నేను మీ అభిప్రాయంతో విభేదిస్తున్నాను.' },
  ],
  // Spanish
  es: [
    { pattern: /\b(hijo de puta|puta|mierda|coño|maricón|gilipollas|pendejo|cabrón)\b/i, score: 0.90, category: 'obscene', rewrite: 'Por favor, mantengamos el respeto.' },
    { pattern: /\b(te voy a matar|muérete|matar|violencia)\b/i, score: 0.95, category: 'threat', rewrite: 'Hablemos con calma y sin agresividad.' },
    { pattern: /\b(idiota|estúpido|imbécil|tarado)\b/i, score: 0.72, category: 'insult', rewrite: 'Veo las cosas de otra manera.' },
  ],
}

export const toxicityService = {
  // Real-time toxicity detection with built-in multilingual engine and ML microservice fallback
  async detectToxicity(text, language = 'auto') {
    if (!text || typeof text !== 'string' || !text.trim()) {
      return { toxicity_score: 0, categories: {}, is_toxic: false, detected_keywords: [] }
    }

    const trimmed = text.trim()

    // 1. Try python ML microservice if accessible
    try {
      const response = await axios.post(`${ML_API_URL}/detect`, {
        text: trimmed,
        language: language || 'auto'
      }, { timeout: 1500 })
      
      if (response?.data && typeof response.data.toxicity_score === 'number') {
        return response.data
      }
    } catch (e) {
      // Microservice offline / not deployed: execute built-in real-time classifier
    }

    // 2. High-performance Built-in Rule & Keyword Engine
    return this.classifyLocal(trimmed)
  },

  // Built-in rule classifier
  classifyLocal(text) {
    let maxScore = 0.0
    const detectedCategories = {}
    const detectedKeywords = []

    for (const [lang, rules] of Object.entries(TOXIC_PATTERNS)) {
      for (const rule of rules) {
        const match = text.match(rule.pattern)
        if (match) {
          detectedKeywords.push(match[0])
          maxScore = Math.max(maxScore, rule.score)
          detectedCategories[rule.category] = Math.max(detectedCategories[rule.category] || 0, rule.score)
        }
      }
    }

    return {
      toxicity_score: Math.round(maxScore * 100) / 100,
      is_toxic: maxScore >= 0.5,
      categories: detectedCategories,
      detected_keywords: [...new Set(detectedKeywords)],
      language: 'multilingual'
    }
  },

  // Smart AI rewrite suggestions
  async suggestRewrite(text) {
    if (!text || typeof text !== 'string' || !text.trim()) return null

    const trimmed = text.trim()

    // Try microservice first
    try {
      const response = await axios.post(`${ML_API_URL}/suggest-rewrite`, { text: trimmed }, { timeout: 1500 })
      const suggestion = response?.data?.suggested_rewrite || response?.data?.suggestion
      if (suggestion) return suggestion
    } catch (e) {
      // fallback
    }

    // Built-in smart rewrites
    for (const [lang, rules] of Object.entries(TOXIC_PATTERNS)) {
      for (const rule of rules) {
        if (rule.pattern.test(trimmed) && rule.rewrite) {
          return rule.rewrite
        }
      }
    }

    return 'I appreciate your perspective, though I see this differently.'
  },

  // Level mapper
  getToxicityLevel(score) {
    if (score < 0.5) return { level: 'safe', color: 'green' }
    if (score < 0.75) return { level: 'warning', color: 'yellow' }
    return { level: 'blocked', color: 'red' }
  }
}
