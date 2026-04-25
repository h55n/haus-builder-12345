'use client'
import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDesignStore } from '@/store/designStore'
import { useViewerStore } from '@/store/viewerStore'
import { SceneCanvas } from '@/components/viewer/SceneCanvas'
import { ControlBar } from '@/components/viewer/ControlBar'
import { CinematicLoader } from '@/components/cinematic/CinematicLoader'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ArrowLeft, Sparkles, Send } from 'lucide-react'
import { useArchitectAgent } from '@/hooks/useArchitectAgent'

function ViewerContent() {
  const router = useRouter()
  const params = useSearchParams()
  const design = useDesignStore(s => s.design)
  const isGenerating = useDesignStore(s => s.isGenerating)
  const error = useDesignStore(s => s.error)
  const { viewMode, setViewMode } = useViewerStore()
  const { refineDesign } = useArchitectAgent()

  const isAIMode = params.get('generating') === 'true'
  const is2DInit = params.get('view') === '2d'
  const [showCinematic, setShowCinematic] = useState(isAIMode && !is2DInit)

  // Split view state
  const [isSplitView, setIsSplitView] = useState(isAIMode && is2DInit)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'assistant', text: string}[]>([])

  // If not AI mode (manual builder redirect), show viewer directly
  useEffect(() => {
    if (!isAIMode) setShowCinematic(false)
  }, [isAIMode])

  useEffect(() => {
    if (isSplitView && viewMode !== '2d') {
      setViewMode('2d')
    }
  }, [isSplitView, viewMode, setViewMode])

  const handleApproveBuild3D = () => {
    setIsSplitView(false)
    setViewMode('3d')
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || isGenerating) return
    const msg = chatInput.trim()
    setChatInput('')
    setChatHistory(h => [...h, { role: 'user', text: msg }])

    // Fallback profile if none found
    const dummyProfile = {
      spaceType: 'house' as const,
      occupants: { adults: 2, children: 0 },
      lifestyle: 'family' as const,
      style: design?.style || 'modernist',
      budget: 'medium' as const,
    }

    await refineDesign(dummyProfile, msg)

    setChatHistory(h => [...h, { role: 'assistant', text: 'I updated the layout based on your instruction.' }])
  }

  const styleLabel = design?.style
    ? design.style.charAt(0).toUpperCase() + design.style.slice(1).replace('-', ' ')
    : ''

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: 'var(--viewer-bg)', display: 'flex' }}>

      {/* Cinematic overlay */}
      {showCinematic && (
        <CinematicLoader onDone={() => setShowCinematic(false)} />
      )}

      {/* Main Container */}
      {!showCinematic && (
        <>
          {/* Canvas Area */}
          <div style={{ flex: 1, position: 'relative' }}>
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
              position: 'fixed', top: 20, right: isSplitView ? 340 : 20,
              display: 'flex', gap: 10, alignItems: 'center',
              zIndex: 50,
              transition: 'right 300ms ease',
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
                position: 'absolute', top: '50%', left: '50%',
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
                position: 'absolute', top: 80, left: '50%',
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
                position: 'absolute', top: '50%', left: '50%',
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

            {/* In split mode, the control bar should still be visible but centered in the canvas half */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              pointerEvents: 'none',
              display: 'flex', justifyContent: 'center'
            }}>
              <div style={{ pointerEvents: 'auto' }}>
                <ControlBar />
              </div>
            </div>
          </div>

          {/* Right Sidebar (Chat & Approve) */}
          {isSplitView && (
            <div style={{
              width: 320, height: '100%',
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              zIndex: 60,
              boxShadow: '-4px 0 24px rgba(0,0,0,0.05)',
            }}>
              <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, color: 'var(--text-primary)' }}>
                  Blueprint Generated
                </h2>
                <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  You can move rooms around manually, or ask the AI to make changes.
                </p>
              </div>

              {/* Chat History */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: 10, color: 'var(--text-muted)' }}>AI ASSISTANT</span>
                  <div style={{
                    background: 'var(--bg)', padding: '10px 14px', borderRadius: '0 12px 12px 12px',
                    fontFamily: 'var(--font-space-grotesk)', fontSize: 14, color: 'var(--text-primary)'
                  }}>
                    Here is your floor plan! Let me know if you want to add, remove, or change anything.
                  </div>
                </div>

                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                      {msg.role === 'user' ? 'YOU' : 'AI ASSISTANT'}
                    </span>
                    <div style={{
                      background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg)',
                      color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '12px 0 12px 12px' : '0 12px 12px 12px',
                      fontFamily: 'var(--font-space-grotesk)', fontSize: 14,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', alignSelf: 'flex-start', background: 'var(--bg)', padding: '10px 14px', borderRadius: '0 12px 12px 12px' }}>
                    <div style={{ width: 12, height: 12, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 13, color: 'var(--text-muted)' }}>Thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder="e.g. Make the kitchen larger"
                    disabled={isGenerating}
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--bg)',
                      color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)',
                      fontSize: 14, outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || isGenerating}
                    style={{
                      padding: '0 14px', borderRadius: 8, border: 'none',
                      background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                      opacity: (!chatInput.trim() || isGenerating) ? 0.5 : 1
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Approve Button */}
              <div style={{ padding: '16px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleApproveBuild3D}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10,
                    border: 'none', background: 'var(--text-primary)',
                    color: 'var(--surface)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'var(--font-space-grotesk)', fontSize: 15, fontWeight: 600,
                  }}
                >
                  <Sparkles size={18} /> Approve & Build 3D
                </button>
              </div>
            </div>
          )}
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
