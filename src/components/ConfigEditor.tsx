import React from 'react'
import { ConfigField } from '../types'
import clsx from 'clsx'

interface Props {
  fields: ConfigField[]
  config: Record<string, string | number>
  onChange: (field: string, value: string | number) => void
  theme: 'dark' | 'light'
}

export const ConfigEditor: React.FC<Props> = ({ fields, config, onChange, theme }) => {
  if (fields.length === 0) {
    return (
      <div className="text-[var(--muted)] text-xs italic py-1">No configuration needed.</div>
    )
  }

  const inputClass = clsx(
    'w-full px-3 py-1.5 rounded border text-sm mono transition-colors',
    theme === 'dark'
      ? 'bg-[#1a1a1a] border-white/10 text-gray-200 focus:border-[var(--accent)] focus:outline-none'
      : 'bg-white border-gray-300 text-gray-800 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]'
  )

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1.5">
            {field.label}
          </label>
          {field.type === 'alphabet' ? (
            <input
              type="text"
              maxLength={26}
              className={clsx(inputClass, 'tracking-widest')}
              value={String(config[field.name] ?? '')}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.name, e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
            />
          ) : field.type === 'number' ? (
            <input
              type="number"
              className={inputClass}
              value={config[field.name] ?? ''}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              onChange={(e) => onChange(field.name, e.target.value === '' ? '' : Number(e.target.value))}
            />
          ) : (
            <input
              type="text"
              className={inputClass}
              value={String(config[field.name] ?? '')}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
