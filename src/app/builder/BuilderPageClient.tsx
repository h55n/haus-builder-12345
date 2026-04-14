'use client'
import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { useBuilderStore } from '@/store/builderStore'
import { useDesignStore } from '@/store/designStore'
import { useViewerStore } from '@/store/viewerStore'
import { BuilderSidebar } from '@/components/builder/BuilderSidebar'
import { BuilderCanvas } from '@/components/builder/BuilderCanvas'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ArrowLeft, Undo2, Redo2, Grid2x2, Sparkles } from 'lucide-react'

export default function BuilderPage() {
  const router = useRouter()
  const { addItem, undo, redo, selectedId, removeItem, toDesignSpec } = useBuilderStore()
  const { setDesign } = useDesignStore()
  const { snapEnabled, toggleSnap } = useViewerStore()

  // Handle drop from sidebar
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { over, active } = event
    if (!over || over.id !== 'canvas-drop-zone') return

    const data = active.data.current as { asset: { id: string; label: string; w: number; d: number; h?: number }; category: string }
    if (!data) return

    const assetType = data.category === 'ROOMS' ? 'room' : data.category === 'FURNITURE' ? 'furniture' : 'wall'

    addItem({
      assetType,
      assetId: data.asset.id,
      label: data.asset.label,
      position: { x: Math.random() * 4 - 2, z: Math.random() * 4 - 2 },
      rotation: 0,
      scale: 1,
      dimensions: { w: data.asset.w, d: data.asset.d, h: data.asset.h ?? 2.8 },
    })
  }, [addItem])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedId) removeItem(selectedId) }
      if (e.key === 'Escape') { useBuilderStore.getState().selectItem(null) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, selectedId, removeItem])

  const handleRefineWithAI = async () => {
    const spec = toDesignSpec()
    setDesign(spec)
    router.push('/viewer')
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>

        {/* Sidebar */}
        <BuilderSidebar />

        {/* Canvas area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <BuilderCanvas />

          {/* Top toolbar */}
          <div style={{
            position: 'absolute', top: 16, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 6,
            zIndex: 50,
          }}>
            <div className="glass" style={{
              borderRadius: 12, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {/* Back */}
              <ToolBtn onClick={() => router.push('/')} title="Back">
                <ArrowLeft size={15} />
              </ToolBtn>

              <ToolDivider />

              {/* Undo / Redo */}
              <ToolBtn onClick={undo} title="Undo (⌘Z)"><Undo2 size={15} /></ToolBtn>
              <ToolBtn onClick={redo} title="Redo (⌘⇧Z)"><Redo2 size={15} /></ToolBtn>

              <ToolDivider />

              {/* Snap */}
              <ToolBtn onClick={toggleSnap} title="Toggle snap" active={snapEnabled}>
                <Grid2x2 size={15} />
                <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: 9, letterSpacing: '0.08em' }}>
                  SNAP
                </span>
              </ToolBtn>
            </div>

            {/* Refine with AI */}
            <button
              onClick={handleRefineWithAI}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                border: 'none', background: 'var(--accent)',
                color: '#fff', cursor: 'pointer',
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: 13, fontWeight: 600,
                boxShadow: '0 4px 16px rgba(26,86,219,0.3)',
              }}
            >
              <Sparkles size={15} /> View in 3D
            </button>
          </div>

          {/* Theme toggle */}
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 50 }}>
            <ThemeToggle />
          </div>

          {/* Mode badge */}
          <div className="glass-sm" style={{
            position: 'absolute', top: 16, left: 16,
            padding: '6px 12px', borderRadius: 8, zIndex: 50,
            fontFamily: 'var(--font-space-mono)',
            fontSize: 11, letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
          }}>
            Manual Mode
          </div>
        </div>
      </div>
    </DndContext>
  )
}

function ToolBtn({ children, onClick, title, active }: {
  children: React.ReactNode
  onClick: () => void
  title: string
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '6px 10px', borderRadius: 8, border: 'none',
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        cursor: 'pointer', transition: 'all 150ms', minHeight: 36,
      }}
    >
      {children}
    </button>
  )
}

function ToolDivider() {
  return <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />
}
