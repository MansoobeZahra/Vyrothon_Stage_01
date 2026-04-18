import { PipelineNode } from '../types'

export interface Preset {
  name: string
  description: string
  plaintext: string
  nodes: Omit<PipelineNode, 'id'>[]
}

export const PRESETS: Preset[] = [
  {
    name: 'Classic',
    description: 'Caesar → XOR → Vigenère',
    plaintext: 'Hello World',
    nodes: [
      { cipherName: 'Caesar', config: { shift: 3 } },
      { cipherName: 'XOR', config: { key: 'vyro' } },
      { cipherName: 'Vigenère', config: { keyword: 'hackathon' } },
    ],
  },
  {
    name: 'Advanced',
    description: 'Rail Fence → Substitution → Caesar',
    plaintext: 'CipherStack 2026! @VYRO',
    nodes: [
      { cipherName: 'Rail Fence', config: { rails: 3 } },
      { cipherName: 'Substitution', config: { alphabet: 'zyxwvutsrqponmlkjihgfedcba' } },
      { cipherName: 'Caesar', config: { shift: 5 } },
    ],
  },
  {
    name: 'Full Stack',
    description: 'XOR → Reverse → XOR → Rail Fence',
    plaintext: 'The quick brown fox jumps over the lazy dog',
    nodes: [
      { cipherName: 'XOR', config: { key: 'hackathon' } },
      { cipherName: 'Reverse', config: {} },
      { cipherName: 'XOR', config: { key: 'hackathon' } },
      { cipherName: 'Rail Fence', config: { rails: 4 } },
    ],
  },
  {
    name: 'Multi-Layer',
    description: 'Base64 → Columnar → Vigenère → Caesar → Atbash',
    plaintext: 'Amna from Islamabad',
    nodes: [
      { cipherName: 'Base64', config: {} },
      { cipherName: 'Columnar', config: { keyword: 'vyro' } },
      { cipherName: 'Vigenère', config: { keyword: 'cipher' } },
      { cipherName: 'Caesar', config: { shift: 7 } },
      { cipherName: 'Atbash', config: {} },
    ],
  },
]
