import { Cipher } from '../types'

/**
 * Vigenère Cipher
 * Polyalphabetic substitution — only shifts A-Z / a-z.
 * Non-letter chars pass through unchanged but do NOT advance the key index.
 */
export const vigenere: Cipher = {
  name: 'Vigenère',
  icon: '🔑',
  description: 'Polyalphabetic substitution using a keyword.',
  configFields: [
    { name: 'keyword', label: 'Keyword (letters only)', type: 'text', placeholder: 'secret' },
  ],
  defaultConfig: { keyword: 'hackathon' },
  validate: (c) => {
    const k = String(c.keyword).replace(/[^a-zA-Z]/g, '')
    if (!k) return 'Keyword must contain at least one letter'
    return null
  },
  encrypt: (text, config) => {
    const key = String(config.keyword).toLowerCase().replace(/[^a-z]/g, '')
    if (!key) return text
    let ki = 0
    return text.split('').map((ch) => {
      const code = ch.charCodeAt(0)
      const isUpper = code >= 65 && code <= 90
      const isLower = code >= 97 && code <= 122
      if (!isUpper && !isLower) return ch
      const base = isUpper ? 65 : 97
      const shift = key.charCodeAt(ki % key.length) - 97
      ki++
      return String.fromCharCode(((code - base + shift + 26) % 26) + base)
    }).join('')
  },
  decrypt: (text, config) => {
    const key = String(config.keyword).toLowerCase().replace(/[^a-z]/g, '')
    if (!key) return text
    let ki = 0
    return text.split('').map((ch) => {
      const code = ch.charCodeAt(0)
      const isUpper = code >= 65 && code <= 90
      const isLower = code >= 97 && code <= 122
      if (!isUpper && !isLower) return ch
      const base = isUpper ? 65 : 97
      const shift = key.charCodeAt(ki % key.length) - 97
      ki++
      return String.fromCharCode(((code - base - shift + 26) % 26) + base)
    }).join('')
  },
}
