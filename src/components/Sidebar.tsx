import React from 'react'
import { CIPHER_LIBRARY } from '../ciphers'
import { usePipelineStore } from '../store/pipelineStore'
import { PRESETS } from '../presets/presets'
import clsx from 'clsx'

export const Sidebar: React.FC = () => {
  const { addNode, loadPreset, theme } = usePipelineStore()

  const CATEGORIES = [
    { label: 'Configurable Ciphers', names: ['Caesar', 'XOR', 'Vigenère', 'Rail Fence', 'Substitution', 'Columnar'] },
    { label: 'Bonus Ciphers', names: ['Base64', 'ROT13', 'Reverse', 'Atbash'] },
  ]

  return (
    <aside
      className={clsx(
        'w-64 flex-shrink-0 flex flex-col border-r overflow-y-auto backdrop-blur-xl',
        theme === 'dark' ? 'bg-[var(--surface)] border-[var(--surface-border)]' : 'bg-white/70 border-gray-200'
      )}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="text-[var(--accent)] font-bold text-xl tracking-wider mono">
          ◈ CipherStack
        </div>
        <div className="text-[var(--muted)] text-xs mt-1">Node-Based Encryption Builder</div>
      </div>

      {/* Presets */}
      <div className="p-4 border-b border-white/5">
        <div className="text-[var(--muted)] text-[10px] uppercase tracking-widest mb-3">Presets</div>
        <div className="flex flex-col gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className={clsx(
                'text-left px-3 py-2 rounded text-xs border transition-all duration-200',
                theme === 'dark'
                  ? 'border-white/10 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-gray-300'
                  : 'border-gray-200 hover:border-[var(--accent)] hover:bg-green-50 text-gray-700'
              )}
            >
              <div className="font-semibold">{preset.name}</div>
              <div className="text-[var(--muted)] text-[10px] mt-0.5">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cipher Library */}
      <div className="p-4 flex-1">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="mb-5">
            <div className="text-[var(--muted)] text-[10px] uppercase tracking-widest mb-3">
              {cat.label}
            </div>
            <div className="flex flex-col gap-2">
              {CIPHER_LIBRARY.filter((c) => cat.names.includes(c.name)).map((cipher) => (
                <button
                  key={cipher.name}
                  onClick={() => addNode(cipher.name)}
                  title={cipher.description}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded border text-left',
                    'transition-all duration-200 cursor-pointer group',
                    theme === 'dark'
                      ? 'border-[var(--surface-border)] bg-[#111111]/40 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5'
                      : 'border-gray-200 bg-white/60 hover:border-[var(--accent)] hover:bg-green-50'
                  )}
                >
                  <span className="text-lg flex-shrink-0">{cipher.icon}</span>
                  <div className="min-w-0">
                    <div className={clsx(
                      'text-xs font-semibold group-hover:text-[var(--accent)] transition-colors',
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    )}>
                      {cipher.name}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] truncate">{cipher.description}</div>
                  </div>
                  <span className="ml-auto text-[var(--muted)] text-base opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
