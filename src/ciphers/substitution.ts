import { Cipher } from '../types'

const DEFAULT_ALPHABET = 'zyxwvutsrqponmlkjihgfedcba'
const STANDARD = 'abcdefghijklmnopqrstuvwxyz'

export const substitution: Cipher = {
  name: 'Substitution',
  icon: '🔣',
  description: 'Replaces each letter with one from a custom 26-letter alphabet.',
  configFields: [
    {
      name: 'alphabet',
      label: 'Custom Alphabet (26 unique letters)',
      type: 'alphabet',
      placeholder: 'zyxwvutsrqponmlkjihgfedcba',
    },
  ],
  defaultConfig: { alphabet: DEFAULT_ALPHABET },
  validate: (c) => {
    const a = String(c.alphabet).toLowerCase()
    if (a.length !== 26) return 'Alphabet must be exactly 26 characters'
    if (new Set(a).size !== 26) return 'All 26 characters must be unique'
    if (!/^[a-z]+$/.test(a)) return 'Alphabet must contain only letters a-z'
    return null
  },
  encrypt: (text, config) => {
    const alpha = String(config.alphabet).toLowerCase()
    return text.split('').map((ch) => {
      const lower = ch.toLowerCase()
      const idx = STANDARD.indexOf(lower)
      if (idx === -1) return ch
      const sub = alpha[idx]
      return ch >= 'a' && ch <= 'z' ? sub : sub.toUpperCase()
    }).join('')
  },
  decrypt: (text, config) => {
    const alpha = String(config.alphabet).toLowerCase()
    return text.split('').map((ch) => {
      const lower = ch.toLowerCase()
      const idx = alpha.indexOf(lower)
      if (idx === -1) return ch
      const orig = STANDARD[idx]
      return ch >= 'a' && ch <= 'z' ? orig : orig.toUpperCase()
    }).join('')
  },
}
