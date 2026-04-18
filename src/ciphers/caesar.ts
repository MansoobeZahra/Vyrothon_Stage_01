import { Cipher } from '../types'

export const caesar: Cipher = {
  name: 'Caesar',
  description: 'Shifts each letter by a fixed amount.',
  configFields: [
    { name: 'shift', label: 'Shift Amount', type: 'number', placeholder: '3', min: -25, max: 25 },
  ],
  defaultConfig: { shift: 3 },
  validate: (c) => {
    const s = parseInt(String(c.shift))
    if (isNaN(s)) return 'Shift must be a number'
    return null
  },
  encrypt: (text, config) => {
    const shift = ((parseInt(String(config.shift)) % 26) + 26) % 26
    return text.replace(/[a-zA-Z]/g, (ch) => {
      const base = ch >= 'a' ? 97 : 65
      return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26) + base)
    })
  },
  decrypt: (text, config) => {
    const shift = ((parseInt(String(config.shift)) % 26) + 26) % 26
    return text.replace(/[a-zA-Z]/g, (ch) => {
      const base = ch >= 'a' ? 97 : 65
      return String.fromCharCode(((ch.charCodeAt(0) - base - shift + 26) % 26) + base)
    })
  },
}
