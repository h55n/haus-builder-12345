'use client'
import { useState } from 'react'

export function ChoiceInput({ options, onSelect }: { options: string[]; onSelect: (v: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          onMouseEnter={() => setHovered(opt)}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: `1px solid ${hovered === opt ? 'var(--accent)' : 'var(--border)'}`,
            background: hovered === opt ? 'var(--accent-soft)' : 'var(--surface)',
            color: hovered === opt ? 'var(--accent)' : 'var(--text-primary)',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: 14, fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            minHeight: 44,
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
