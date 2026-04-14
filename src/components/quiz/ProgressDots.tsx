'use client'

export function ProgressDots({ total = 7, current }: { total?: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i < current ? 20 : 8,
          height: 8,
          borderRadius: 4,
          background: i < current ? 'var(--accent)' : 'var(--border)',
          transition: 'all 300ms ease',
        }} />
      ))}
    </div>
  )
}
