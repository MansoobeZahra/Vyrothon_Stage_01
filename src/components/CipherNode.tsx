import React, { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PipelineNode, NodeResult } from '../types'
import { CIPHER_MAP } from '../ciphers'
import { usePipelineStore } from '../store/pipelineStore'
import { ConfigEditor } from './ConfigEditor'
import clsx from 'clsx'
import { GripVertical, X, ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { CipherIcons } from './CipherIcons'

interface Props {
  node: PipelineNode
  index: number
  result?: NodeResult
  isRunning: boolean
}

const TRUNCATE = 100

function truncate(s: string) {
  if (!s) return ''
  return s.length > TRUNCATE ? s.slice(0, TRUNCATE) + '…' : s
}

const cipherColors: Record<string, string> = {
  'Caesar': '#3b82f6', // blue
  'XOR': '#f97316',    // orange
  'Vigenère': '#a855f7', // purple
  'Rail Fence': '#10b981', // green
  'Substitution': '#ec4899', // pink
  'Columnar': '#eab308',   // yellow
  'Base64': '#6366f1',     // indigo
  'ROT13': '#14b8a6',      // teal
  'Reverse': '#f43f5e',    // rose
  'Atbash': '#0ea5e9'      // sky
}

export const CipherNode: React.FC<Props> = ({
  node, index, result, isRunning
}) => {
  const { removeNode, updateConfig, mode, theme } = usePipelineStore()
  const cipher = CIPHER_MAP[node.cipherName]
  const [showResult, setShowResult] = useState(true)
  const [flashing, setFlashing] = useState<'ok' | 'err' | null>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: node.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  const validationError = cipher?.validate ? cipher.validate(node.config) : null
  const hasError = !!result?.error
  const hasWarning = !!validationError && !hasError

  useEffect(() => {
    if (!result) return
    setFlashing(result.error ? 'err' : 'ok')
    const t = setTimeout(() => setFlashing(null), 800)
    return () => clearTimeout(t)
  }, [result])

  const headerColor = cipherColors[node.cipherName] || (mode === 'decrypt' ? '#0088ff' : '#00fa9a')
  const isDark = theme === 'dark'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'rounded-xl border transition-all duration-300 shadow-lg group w-full max-w-2xl mx-auto flex flex-col',
        flashing === 'ok' && 'animate-flash-ok',
        flashing === 'err' && 'animate-flash-err',
        hasError
          ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
          : isRunning
          ? `border-[${headerColor}] shadow-[0_0_25px_${headerColor}40]`
          : hasWarning
          ? 'border-yellow-500/50'
          : isDark ? 'border-white/10 hover:border-white/30' : 'border-gray-200 hover:border-gray-300',
        isDark ? 'bg-[var(--surface)] backdrop-blur-2xl' : 'bg-white/90 backdrop-blur-2xl'
      )}
    >
      {/* Header Bar */}
      <div 
        className={clsx(
          'flex items-center px-4 py-3 rounded-t-xl gap-3 transition-colors',
          isDark ? 'bg-black/30' : 'bg-gray-50/80'
        )}
        style={{ borderBottom: `2px solid ${headerColor}80` }}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[var(--muted)] hover:text-white transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>

        <span
          className="text-xs font-bold w-6 h-6 rounded-full flex flex-shrink-0 items-center justify-center shadow-md bg-[var(--surface)]"
          style={{ color: headerColor, border: `1px solid ${headerColor}50` }}
        >
          {index + 1}
        </span>

        <span className="flex items-center justify-center text-gray-400 p-1" aria-hidden>{CipherIcons[node.cipherName]}</span>
        
        <div className="flex-1 flex items-center gap-2">
          <h3 className="font-bold text-base tracking-wide" style={{ color: isDark ? '#fff' : '#111' }}>
            {node.cipherName}
          </h3>
          {hasWarning && (
            <span className="flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
              <AlertCircle size={10} /> {validationError}
            </span>
          )}
        </div>

        <button
          onClick={() => removeNode(node.id)}
          className={clsx(
            'p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100',
            isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
          )}
          title="Remove cipher"
        >
          <X size={16} />
        </button>
      </div>

      {/* Config Editor */}
      <div className="px-6 py-5">
        <ConfigEditor
          fields={cipher?.configFields ?? []}
          config={node.config}
          onChange={(field, value) => updateConfig(node.id, field, value)}
          theme={theme}
        />
      </div>

      {/* Intermediate Result Area */}
      {result && (
        <div className={clsx(
          'mx-4 mb-4 rounded-lg overflow-hidden border transition-colors',
          isDark ? 'border-white/10 bg-black/40' : 'border-gray-200 bg-gray-50/50'
        )}>
          <button
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
            onClick={() => setShowResult(!showResult)}
          >
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">
              {showResult ? <ChevronDown size={14} /> : <ChevronRight size={14} />} 
              {mode === 'encrypt' ? 'Encryption Trace' : 'Decryption Trace'}
            </div>
            {result.error
              ? <span className="flex items-center gap-1 text-red-500 text-[10px] font-bold tracking-widest uppercase"><X size={12}/> Failed</span>
              : <span style={{ color: headerColor }} className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase"><CheckCircle2 size={12}/> Success</span>
            }
          </button>
          
          {showResult && (
            <div className="px-5 pb-4 pt-1 font-mono text-xs flex flex-col gap-3">
              {result.error ? (
                <div className="text-red-400 bg-red-400/10 p-3 rounded border border-red-500/20 leading-relaxed font-semibold">
                  {result.error}
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-[var(--muted)] tracking-widest font-semibold">INPUT</span>
                    <span className={clsx('break-all leading-relaxed p-2 rounded-md', isDark ? 'bg-white/5 text-gray-300' : 'bg-white border text-gray-600')}>
                      {truncate(result.input) || <span className="text-[var(--muted)] italic">Empty string</span>}
                    </span>
                  </div>
                  <div className="flex justify-center -my-3 z-10 opacity-50 text-[var(--muted)]">
                    ↓
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] tracking-widest font-bold" style={{ color: headerColor }}>OUTPUT</span>
                    <span className={clsx('break-all leading-relaxed p-2 rounded-md font-semibold border', isDark ? 'bg-black/40 text-gray-100 border-white/5' : 'bg-white text-gray-900 border-gray-100')}>
                      {truncate(result.output) || <span className="text-[var(--muted)] italic opacity-50 font-normal">Empty string</span>}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
