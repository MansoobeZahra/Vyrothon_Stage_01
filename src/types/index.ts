// ─── Shared Types ────────────────────────────────────────────────────────────

export type FieldType = 'number' | 'text' | 'alphabet'

export interface ConfigField {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  min?: number
  max?: number
}

export interface Cipher {
  name: string
  description: string
  configFields: ConfigField[]
  defaultConfig: Record<string, string | number>
  encrypt: (input: string, config: Record<string, string | number>) => string
  decrypt: (input: string, config: Record<string, string | number>) => string
  validate?: (config: Record<string, string | number>) => string | null
}

export interface PipelineNode {
  id: string
  cipherName: string
  config: Record<string, string | number>
}

export interface NodeResult {
  nodeId: string
  input: string
  output: string
  error?: string
}

export type RunMode = 'encrypt' | 'decrypt'

export interface RoundTripResult {
  success: boolean
  original: string
  recovered: string
}
