import { caesar } from './caesar'
import { xor } from './xor'
import { vigenere } from './vigenere'
import { railFence } from './railfence'
import { substitution } from './substitution'
import { columnar } from './columnar'
import { base64, rot13, reverse, atbash } from './extras'
import { Cipher } from '../types'

export const CIPHER_LIBRARY: Cipher[] = [
  caesar,
  xor,
  vigenere,
  railFence,
  substitution,
  columnar,
  base64,
  rot13,
  reverse,
  atbash,
]

export const CIPHER_MAP: Record<string, Cipher> = Object.fromEntries(
  CIPHER_LIBRARY.map((c) => [c.name, c])
)
