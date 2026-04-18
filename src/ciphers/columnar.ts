import { Cipher } from '../types'

/**
 * Columnar Transposition Cipher
 * 1. Write plaintext into rows of width = keyword.length
 * 2. Pad with underscores if needed
 * 3. Sort columns by alphabetical order of keyword letters
 * 4. Read columns top-to-bottom in sorted order → ciphertext
 *
 * Decrypt reverses: reconstruct columns in sorted order, then read rows.
 */
export const columnar: Cipher = {
  name: 'Columnar',
  description: 'Columnar transposition using a keyword for column ordering.',
  configFields: [
    { name: 'keyword', label: 'Column Keyword', type: 'text', placeholder: 'secret' },
  ],
  defaultConfig: { keyword: 'secret' },
  validate: (c) => {
    const k = String(c.keyword).trim()
    if (!k) return 'Keyword cannot be empty'
    return null
  },
  encrypt: (text, config) => {
    const key = String(config.keyword).toLowerCase().replace(/\s/g, '')
    if (!key) return text
    const numCols = key.length
    const padded = text.padEnd(Math.ceil(text.length / numCols) * numCols, '\0')
    const numRows = padded.length / numCols

    // Build grid
    const grid: string[][] = []
    for (let r = 0; r < numRows; r++) {
      grid.push(padded.slice(r * numCols, (r + 1) * numCols).split(''))
    }

    // Sorted column order
    const order = getSortedOrder(key)

    // Read columns in sorted order
    let result = ''
    for (const col of order) {
      for (let r = 0; r < numRows; r++) result += grid[r][col]
    }
    return result
  },
  decrypt: (text, config) => {
    const key = String(config.keyword).toLowerCase().replace(/\s/g, '')
    if (!key) return text
    const numCols = key.length
    const numRows = Math.ceil(text.length / numCols)
    const order = getSortedOrder(key)

    // Fill each column in sorted order
    const colLengths = Array(numCols).fill(numRows)
    const grid: string[][] = Array.from({ length: numRows }, () => Array(numCols).fill(''))

    let pos = 0
    for (const col of order) {
      for (let r = 0; r < colLengths[col]; r++) {
        grid[r][col] = text[pos++] ?? ''
      }
    }

    // Read rows
    return grid.map((row) => row.join('')).join('').replace(/\0/g, '')
  },
}

function getSortedOrder(key: string): number[] {
  return key
    .split('')
    .map((ch, i) => ({ ch, i }))
    .sort((a, b) => a.ch.localeCompare(b.ch) || a.i - b.i)
    .map((x) => x.i)
}
