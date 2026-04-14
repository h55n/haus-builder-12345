'use client'
import { ReactNode, CSSProperties } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md'
  disabled?: boolean
  style?: CSSProperties
}

const BASE: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: 6, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-space-grotesk)',
  fontWeight: 500, letterSpacing: '-0.01em', transition: 'all 150ms ease',
  borderRadius: 8, minHeight: 44,
}

const VARIANTS = {
  primary: {
    background: 'var(--accent)', color: '#fff',
    padding: '10px 20px',
  } as CSSProperties,
  ghost: {
    background: 'transparent', color: 'var(--text-secondary)',
    padding: '10px 16px', border: '1px solid var(--border)',
  } as CSSProperties,
  outline: {
    background: 'var(--surface)', color: 'var(--text-primary)',
    padding: '10px 18px', border: '1px solid var(--border-strong)',
  } as CSSProperties,
}

const SIZES = {
  sm: { fontSize: 13, minHeight: 36, padding: '6px 14px' } as CSSProperties,
  md: { fontSize: 15 } as CSSProperties,
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...BASE,
        ...VARIANTS[variant],
        ...SIZES[size],
        ...(disabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  )
}
