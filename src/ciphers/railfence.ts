import { Cipher } from '../types'

/**
 * Rail Fence Cipher (Zigzag Transposition)
 *
 * Encrypt: distribute chars across `rails` rows in a zigzag pattern, then read rows L→R.
 *
 * Decrypt: reconstruct the zigzag index pattern on the ciphertext,
 *          then read characters back in zigzag order.
 *          Uses explicit index-tracking to handle all edge cases (rails > length, etc.)
 */
export const railFence: Cipher = {
  name: 'Rail Fence',
  icon: '🚂',
  description: 'Zigzag transposition cipher.',
  configFields: [
    { name: 'rails', label: 'Number of Rails (≥ 2)', type: 'number', placeholder: '3', min: 2, max: 20 },
  ],
  defaultConfig: { rails: 3 },
  validate: (c) => {
    const r = parseInt(String(c.rails))
    if (isNaN(r) || r < 2) return 'Rails must be an integer ≥ 2'
    return null
  },
  encrypt: (text, config) => {
    const rails = parseInt(String(config.rails))
    if (isNaN(rails) || rails < 2) throw new Error('Rails must be ≥ 2')
    if (text.length === 0) return ''
    if (rails >= text.length) return text // degenerate: each char on own rail → no permutation

    const fence: string[][] = Array.from({ length: rails }, () => [])
    const indices = zigzagIndices(text.length, rails)
    indices.forEach((rail, i) => fence[rail].push(text[i]))
    return fence.map((r) => r.join('')).join('')
  },
  decrypt: (text, config) => {
    const rails = parseInt(String(config.rails))
    if (isNaN(rails) || rails < 2) throw new Error('Rails must be ≥ 2')
    if (text.length === 0) return ''
    if (rails >= text.length) return text

    const indices = zigzagIndices(text.length, rails)

    // Count chars per rail
    const railLengths: number[] = Array(rails).fill(0)
    indices.forEach((r) => railLengths[r]++)

    // Slice ciphertext into rails
    const railStrings: string[] = []
    let pos = 0
    for (let r = 0; r < rails; r++) {
      railStrings.push(text.slice(pos, pos + railLengths[r]))
      pos += railLengths[r]
    }

    // Read back in zigzag order
    const railPointers = Array(rails).fill(0)
    let result = ''
    indices.forEach((r) => {
      result += railStrings[r][railPointers[r]++]
    })
    return result
  },
}

/** Returns an array of rail indices in zigzag order for `len` chars and `rails` rails */
function zigzagIndices(len: number, rails: number): number[] {
  const out: number[] = []
  let r = 0
  let dir = 1
  for (let i = 0; i < len; i++) {
    out.push(r)
    if (r === 0) dir = 1
    else if (r === rails - 1) dir = -1
    r += dir
  }
  return out
}
