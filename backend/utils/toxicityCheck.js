// Comprehensive backend multilingual toxicity check patterns
const TOXIC_PATTERNS = [
  // English Profanity & Hate
  /\b(kill yourself|die in a fire|hope you die|i will kill you|murder you|sl slit)\b/i,
  /\b(fuck|fucking|fucker|motherfucker|cunt|cock|dickhead|bitch|slut|whore|bastard|asshole|dipshit|jerk)\b/i,
  /\b(idiot|moron|stupid|dumb|loser|ugly|pathetic|worthless|trash)\b/i,
  /\b(nigger|nigga|faggot|chink|kike|retard|retarded)\b/i,
  
  // Hinglish & Romanized Hindi
  /\b(chutiya|chutiye|chutye|chootiya|choot|bhenchod|behenchod|bc|mc|madarchod|bhosdike|bhosadi)\b/i,
  /\b(laude|lode|lauda|gaand|gandu|gaandu|tatte|lund|kamina|kamine|kutta|kutte|harami|saale|saala|suar)\b/i,
  /\b(gadha|gadhe|bekaar|bakwaas|pagal|maar dunga|jaan se marunga|khatam kar dunga)\b/i,

  // Hindi Devanagari
  /(मादरचोद|बहनचोद|भोसड़ीके|गांडू|लौड़े|चूतिया|कमीना|हरामी|मार दूंगा|जान से मारूंगा|खत्म कर दूंगा|बेवकूफ|पागल|गधा|कुत्ता)/i,

  // Telugu
  /(లంజాకోడి|దెంగు|పూకు|మద్ద|గుద్ద|చంపేస్తాను|చావు|హత్య|పిచ్చి|దొంగ|మూర్ఖుడు)/i,

  // Spanish & French
  /\b(hijo de puta|puta|mierda|coño|maricón|gilipollas|pendejo|cabrón|idiota|estúpido|tuer|merde|connard|enculé)\b/i
]

export function checkIsToxic(text) {
  if (!text || typeof text !== 'string') return { isToxic: false, score: 0, matched: [] }

  const trimmed = text.trim()
  const matched = []
  let maxScore = 0

  for (const pattern of TOXIC_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) {
      matched.push(match[0])
      maxScore = Math.max(maxScore, 0.85)
    }
  }

  return {
    isToxic: matched.length > 0 || maxScore >= 0.5,
    score: maxScore,
    matched: [...new Set(matched)]
  }
}
