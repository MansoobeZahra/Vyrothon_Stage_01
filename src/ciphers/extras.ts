import { Cipher } from '../types'

export const base64: Cipher = {
  name: 'Base64',
  description: 'Encodes as Base64 (no config needed).',
  configFields: [],
  defaultConfig: {},
  encrypt: (text) => btoa(unescape(encodeURIComponent(text))),
  decrypt: (text) => {
    try { return decodeURIComponent(escape(atob(text.trim()))) }
    catch { throw new Error('Invalid Base64 input') }
  },
}

export const rot13: Cipher = {
  name: 'ROT13',
  description: 'Rotates letters by 13 (self-inverting).',
  configFields: [],
  defaultConfig: {},
  encrypt: (text) => text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch >= 'a' ? 97 : 65
    return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base)
  }),
  decrypt: (text) => rot13.encrypt(text, {}),
}

export const reverse: Cipher = {
  name: 'Reverse',
  description: 'Reverses the entire string (self-inverting).',
  configFields: [],
  defaultConfig: {},
  encrypt: (text) => text.split('').reverse().join(''),
  decrypt: (text) => text.split('').reverse().join(''),
}

export const atbash: Cipher = {
  name: 'Atbash',
  description: 'Maps A↔Z, B↔Y, … (self-inverting).',
  configFields: [],
  defaultConfig: {},
  encrypt: (text) => text.replace(/[a-zA-Z]/g, (ch) => {
    const isUpper = ch >= 'A' && ch <= 'Z'
    const base = isUpper ? 65 : 97
    return String.fromCharCode(base + (25 - (ch.charCodeAt(0) - base)))
  }),
  decrypt: (text) => atbash.encrypt(text, {}),
}
