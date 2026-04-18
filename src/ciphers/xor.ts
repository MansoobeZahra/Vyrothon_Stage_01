import { Cipher } from '../types'

/**
 * XOR Cipher
 * encrypt: XORs each char with repeating key chars → outputs lowercase hex string
 * decrypt: reads hex pairs, XORs with repeating key → returns original string
 *
 * Round-trip guarantee:
 *   encrypt(x) outputs hex.
 *   decrypt(hex) recovers x exactly — regardless of x containing non-ASCII or hex chars.
 */
export const xor: Cipher = {
  name: 'XOR',
  icon: '⊕',
  description: 'XORs each character with a repeating key. Outputs hex.',
  configFields: [
    { name: 'key', label: 'Key (string)', type: 'text', placeholder: 'hackathon' },
  ],
  defaultConfig: { key: 'vyro' },
  validate: (c) => {
    if (!String(c.key).trim()) return 'Key cannot be empty'
    return null
  },
  encrypt: (text, config) => {
    const key = String(config.key)
    if (!key) return text
    let hex = ''
    for (let i = 0; i < text.length; i++) {
      const xored = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      hex += xored.toString(16).padStart(4, '0') // 4 hex digits to handle full unicode range
    }
    return hex
  },
  decrypt: (hex, config) => {
    const key = String(config.key)
    if (!key) return hex
    // Each char is encoded as 4 hex digits
    if (hex.length % 4 !== 0) throw new Error('Invalid XOR hex input (length not multiple of 4)')
    let result = ''
    for (let i = 0; i < hex.length; i += 4) {
      const code = parseInt(hex.slice(i, i + 4), 16)
      if (isNaN(code)) throw new Error(`Invalid hex at position ${i}: "${hex.slice(i, i + 4)}"`)
      const charIdx = i / 4
      result += String.fromCharCode(code ^ key.charCodeAt(charIdx % key.length))
    }
    return result
  },
}
