import React, { useState } from 'react'
import { usePipelineStore } from '../store/pipelineStore'
import clsx from 'clsx'

export const RightSidebar: React.FC = () => {
  const {
    plaintext, setPlaintext, mode, setMode, runPipeline, testRoundTrip,
    nodes, results, isRunning, roundTripResult, exportPipeline, importPipeline,
    undo, redo, historyIndex, history, theme, toggleTheme
  } = usePipelineStore()

  const [copyLabel, setCopyLabel] = useState('📋 Copy')
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')

  const finalResult = results[results.length - 1]
  const finalOutput = finalResult && !finalResult.error ? finalResult.output : ''
  const hasError = results.some((r) => !!r.error)
  const canRun = nodes.length >= 3

  const accentColor = mode === 'decrypt' ? '#0088ff' : '#00fa9a'

  const handleCopy = () => {
    if (!finalOutput) return
    navigator.clipboard.writeText(finalOutput)
    setCopyLabel('✅ Copied!')
    setTimeout(() => setCopyLabel('📋 Copy'), 2000)
  }

  const handleExport = () => {
    const json = exportPipeline()
    navigator.clipboard.writeText(json)
    alert('Pipeline JSON copied to clipboard!')
  }

  const handleImport = () => {
    try {
      importPipeline(importText)
      setShowImport(false)
      setImportText('')
    } catch {
      alert('Invalid pipeline JSON.')
    }
  }

  const inputClass = clsx(
    'w-full flex-1 p-3 rounded-lg border resize-none text-sm mono transition-colors focus:outline-none',
    theme === 'dark'
      ? 'bg-black/40 border-white/10 text-gray-300 focus:border-[var(--accent)] shadow-inner'
      : 'bg-white border-gray-300 text-gray-800 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] shadow-inner'
  )

  const toolBtnClass = clsx(
    'flex-1 flex justify-center py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
    theme === 'dark'
      ? 'bg-[var(--surface)] border border-[var(--surface-border)] text-gray-300 hover:bg-white/5'
      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
  )

  return (
    <aside className={clsx(
      'w-80 flex-shrink-0 flex flex-col border-l backdrop-blur-xl h-full p-5 gap-5',
      theme === 'dark' ? 'bg-[var(--surface)] border-[var(--surface-border)]' : 'bg-white/70 border-gray-200'
    )}>
      {/* Top Controls: Theme & Undo/Redo */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={toggleTheme}
          className={clsx(
            'px-3 py-1.5 rounded-md text-xs border transition-colors',
            theme === 'dark'
              ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
        </button>

        <div className="flex gap-1">
          <button onClick={undo} disabled={historyIndex <= 0} className={toolBtnClass} title="Undo">↩</button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className={toolBtnClass} title="Redo">↪</button>
          <button onClick={handleExport} className={toolBtnClass} title="Export">⬆</button>
          <button onClick={() => setShowImport(!showImport)} className={toolBtnClass} title="Import">⬇</button>
        </div>
      </div>

      {showImport && (
        <div className="flex items-center gap-2 animate-slide-in">
          <input
            type="text"
            className={clsx(
              'flex-1 px-3 py-2 rounded-md border text-xs mono',
              theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-800'
            )}
            placeholder="Paste JSON…"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <button onClick={handleImport} className="px-3 py-2 rounded-md bg-[var(--accent)] text-black text-xs font-bold shadow-md">✓</button>
          <button onClick={() => setShowImport(false)} className="text-[var(--muted)] hover:text-white">✕</button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className={clsx(
        'flex rounded-lg overflow-hidden border p-1',
        theme === 'dark' ? 'bg-black/50 border-[var(--surface-border)]' : 'bg-gray-100 border-gray-200'
      )}>
        {(['encrypt', 'decrypt'] as const).map((m) => {
          const isActive = mode === m;
          const activeBg = m === 'encrypt' ? '#00fa9a' : '#0088ff';
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={clsx(
                'flex-1 py-2.5 uppercase tracking-widest text-xs font-bold rounded-md transition-all duration-300',
                isActive
                  ? 'text-black shadow-md'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'
              )}
              style={isActive ? { background: activeBg, boxShadow: `0 0 15px ${activeBg}50` } : {}}
            >
              {m}
            </button>
          )
        })}
      </div>

      {/* I/O Textareas */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-widest pl-1">
            {mode === 'encrypt' ? 'Plaintext Input' : 'Ciphertext Input'}
          </label>
          <textarea
            className={inputClass}
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder="Enter text to process…"
          />
        </div>

        <div className="flex items-center justify-center py-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] bg-[var(--surface)] border border-[var(--surface-border)]">
            {mode === 'encrypt' ? '↓' : '↑'}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between pl-1">
            <label className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-widest">Final Output</label>
            <button
              onClick={handleCopy}
              disabled={!finalOutput}
              className="text-[10px] px-2 py-0.5 rounded transition-colors disabled:opacity-30 font-bold tracking-wider"
              style={{ color: accentColor }}
            >
              {copyLabel}
            </button>
          </div>
          <textarea
            readOnly
            className={clsx(inputClass, hasError ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)_inset]' : '', 'bg-black/60')}
            value={finalOutput}
            placeholder={hasError ? '⚠ Pipeline error' : 'Output will appear here…'}
            style={{ color: hasError ? '#ef4444' : finalOutput ? accentColor : undefined }}
          />
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col gap-3 mt-2">
        {roundTripResult && (
          <div className={clsx(
            'px-3 py-2.5 rounded-lg text-xs font-mono text-center shadow-inner border tracking-wide',
            roundTripResult.success ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
          )}>
            {roundTripResult.success ? '✅ Perfect round-trip' : '❌ Integrity mismatch'}
          </div>
        )}

        <button
          onClick={() => runPipeline()}
          disabled={isRunning || !canRun}
          className="w-full py-4 rounded-lg text-sm text-black font-extrabold tracking-widest uppercase transition-all hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50"
          style={{ background: canRun ? accentColor : '#333', boxShadow: canRun ? `0 0 20px ${accentColor}40` : 'none' }}
        >
          {isRunning ? 'Running…' : `Run Pipeline`}
        </button>

        <button
          onClick={testRoundTrip}
          disabled={isRunning || nodes.length < 3}
          className={clsx(
            'w-full py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all',
            theme === 'dark' ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          Round-Trip Test
        </button>
      </div>
    </aside>
  )
}
