'use client'
import { useState, KeyboardEvent } from 'react'

export function TextInput({
  onSubmit,
  placeholder = 'Type your answer…',
  type = 'text',
}: {
  onSubmit: (v: string) => void
  placeholder?: string
  type?: 'text' | 'number'
}) {
  const [val, setVal] = useState('')

  const submit = () => {
    if (!val.trim()) return
    onSubmit(val.trim())
    setVal('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <input
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: '12px 16px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: 15,
          outline: 'none',
          minHeight: 44,
        }}
      />
      <button
        onClick={submit}
        disabled={!val.trim()}
        style={{
          padding: '12px 22px',
          borderRadius: 10,
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: 14, fontWeight: 600,
          cursor: 'pointer',
          minHeight: 44,
          opacity: val.trim() ? 1 : 0.4,
          transition: 'opacity 150ms',
        }}
      >
        →
      </button>
    </div>
  )
}
