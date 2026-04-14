'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDesignStore } from '@/store/designStore'
import { useViewerStore } from '@/store/viewerStore'
import { SceneCanvas } from '@/components/viewer/SceneCanvas'
import { ControlBar } from '@/components/viewer/ControlBar'
import { CinematicLoader } from '@/components/cinematic/CinematicLoader'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ArrowLeft } from 'lucide-react'

function ViewerContent() {
  const router = useRouter()
  const params = useSearchParams()
  const design = useDesignStore(s => s.design)
  const isGenerating = useDesignStore(s => s.isGenerating)
  const error = useDesignStore(s => s.error)
  const { viewMode } = useViewerStore()

  const isAIMode = params.get('generating') === 'true'
  const [showCinematic, setShowCinematic] = useState(isAIMode)

  // If not AI mode (manual builder redirect), show viewer directly
  useEffect(() => {
    if (!isAIMode) setShowCinematic(false)
  }, [isAIMode])

  const styleLabel = design?.style
    ? design.style.charAt(0).toUpperCase() + design.style.slice(1).replace('-', ' ')
    : ''

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: 'var(--viewer-bg)' }}>

      {/* Cinematic overlay */}
      {showCinematic && (
        <CinematicLoader onDone={() => setShowCinematic(false)} />
      )}

      {/* 3D Scene */}
      {!showCinematic && (
        <>
          <SceneCanvas />

          {/* Top-left back button */}
          <button
            onClick={() => router.push('/')}
            className="glass-sm"
            style={{
              position: 'fixed', top: 20, left: 20,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              borderRadius: 10,
              border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: 13, fontWeight: 500,
              zIndex: 50,
            }}
          >
            <ArrowLeft size={15} /> Modes
          </button>

          {/* Top-right badges + theme */}
          <div style={{
            position: 'fixed', top: 20, right: 20,
            display: 'flex', gap: 10, alignItems: 'center',
            zIndex: 50,
          }}>
            {styleLabel && (
              <div
                className="glass-sm"
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: 11, letterSpacing: '0.1em',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                {styleLabel}
              </div>
            )}
            <div
              className="glass-sm"
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontFamily: 'var(--font-space-mono)',
                fontSize: 11, letterSpacing: '0.1em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
              }}
            >
              {isAIMode ? `AI MODE · V${design?.version ?? 1}` : 'MANUAL'}
            </div>
            <ThemeToggle />
          </div>

          {/* Generating spinner (backup if cinematic dismissed early) */}
          {isGenerating && !design && (
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 16, zIndex: 40,
            }}>
              <div style={{
                width: 24, height: 24,
                border: '2px solid var(--border)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 700ms linear infinite',
              }} />
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: 12, color: 'var(--text-muted)',
                letterSpacing: '0.08em',
              }}>
                Finishing your space…
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{
              position: 'fixed', top: 80, left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(241,100,46,0.08)',
              border: '1px solid var(--orange)',
              borderRadius: 10, padding: '10px 20px',
              color: 'var(--orange)',
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: 13, zIndex: 50,
            }}>
              Generation failed — {error}
            </div>
          )}

          {/* Empty state */}
          {!isGenerating && !design && !error && (
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              textAlign: 'center', zIndex: 10,
            }}>
              <p style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 28, color: 'var(--text-muted)',
              }}>
                No design loaded
              </p>
              <p style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: 14, color: 'var(--text-muted)',
                marginTop: 8,
              }}>
                Go back and build something
              </p>
            </div>
          )}

          <ControlBar />
        </>
      )}

      {/* Global keyframe for spinners */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export default function ViewerPage() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100vh', background: 'var(--viewer-bg)' }} />}>
      <ViewerContent />
    </Suspense>
  )
}
