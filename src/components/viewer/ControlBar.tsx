'use client'
import { useTransition } from 'react'
import { useViewerStore } from '@/store/viewerStore'
import { useDesignStore } from '@/store/designStore'
import { RotateCcw, Layers, Eye, Boxes, Grid2x2, Download } from 'lucide-react'

const ICONS = {
  '3d':      <RotateCcw size={16} />,
  exploded:  <Layers size={16} />,
  xray:      <Eye size={16} />,
  '2d':      <Grid2x2 size={16} />,
}

export function ControlBar() {
  const { viewMode, setViewMode, materialPreset, cycleMaterial, snapEnabled, toggleSnap } = useViewerStore()
  const design = useDesignStore(s => s.design)
  const [, startTransition] = useTransition()

  const exportPNG = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `haus-builder-${design?.style ?? 'custom'}-${Date.now()}.png`
    a.click()
  }

  return (
    <div
      className="glass"
      style={{
        position: 'fixed', bottom: 24,
        left: '50%', transform: 'translateX(-50%)',
        borderRadius: 14,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        zIndex: 50,
      }}
    >
      {/* View modes */}
      {(['3d', 'exploded', 'xray', '2d'] as const).map(mode => (
        <BarButton
          key={mode}
          active={viewMode === mode}
          onClick={() => startTransition(() => setViewMode(mode))}
          label={mode.toUpperCase().replace('-', ' ')}
          icon={ICONS[mode]}
        />
      ))}

      <Divider />

      {/* Material cycle */}
      <BarButton
        active={false}
        onClick={cycleMaterial}
        label={materialPreset.toUpperCase()}
        icon={<Boxes size={16} />}
      />

      {/* Snap */}
      <BarButton
        active={snapEnabled}
        onClick={toggleSnap}
        label="SNAP"
        icon={<Grid2x2 size={16} />}
      />

      <Divider />

      {/* Export */}
      <BarButton
        active={false}
        onClick={exportPNG}
        label="EXPORT"
        icon={<Download size={16} />}
      />
    </div>
  )
}

function BarButton({
  icon, label, active, onClick
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 4,
        padding: '8px 12px',
        borderRadius: 10,
        border: 'none',
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        minWidth: 52,
        minHeight: 44,
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.color = 'var(--text-muted)'
      }}
    >
      {icon}
      <span style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: 9, letterSpacing: '0.08em',
      }}>
        {label}
      </span>
    </button>
  )
}

function Divider() {
  return (
    <div style={{
      width: 1, height: 28,
      background: 'var(--border)',
      margin: '0 4px',
    }} />
  )
}
