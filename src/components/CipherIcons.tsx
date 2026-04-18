import { 
  Type, 
  Binary, 
  KeyRound, 
  GitMerge, 
  Shuffle, 
  Columns, 
  Box, 
  RefreshCcw, 
  ArrowLeftRight, 
  Repeat
} from 'lucide-react'
import React from 'react'

export const CipherIcons: Record<string, React.ReactNode> = {
  'Caesar': <Type size={20} />,
  'XOR': <Binary size={20} />,
  'Vigenère': <KeyRound size={20} />,
  'Rail Fence': <GitMerge size={20} />,
  'Substitution': <Shuffle size={20} />,
  'Columnar': <Columns size={20} />,
  'Base64': <Box size={20} />,
  'ROT13': <RefreshCcw size={20} />,
  'Reverse': <ArrowLeftRight size={20} />,
  'Atbash': <Repeat size={20} />
}
