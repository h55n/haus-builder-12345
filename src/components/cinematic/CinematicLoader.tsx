'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDesignStore } from '@/store/designStore'

const STAGES = [
  'Reading your brief…',
  'Planning spaces…',
  'Placing structure…',
  'Measuring rooms…',
  'Furnishing interiors…',
  'Final touches…',
]
const GENERATION_TIMEOUT_MS = 90000
const FAST_PROGRESS_MS = 10000
const FAST_PROGRESS_CAP = 92
const SLOW_PROGRESS_CAP = 99
const CREEP_DECAY_MS = 8000

export function CinematicLoader({ onDone }: { onDone: () => void }) {
  const router = useRouter()
  const design = useDesignStore(s => s.design)
  const isGenerating = useDesignStore(s => s.isGenerating)
  const designError = useDesignStore(s => s.error)
  const [stageIdx, setStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sawGenerating = useRef(false)

  useEffect(() => {
    // Cycle stage labels every 2s
    const stageTimer = setInterval(() => {
      setStageIdx(i => Math.min(i + 1, STAGES.length - 1))
    }, 2000)

    // Progress bar: fill quickly to 92%, then keep slowly moving so it doesn't look stuck
    const start = Date.now()
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start
      if (elapsed <= FAST_PROGRESS_MS) {
        const p = Math.min((elapsed / FAST_PROGRESS_MS) * FAST_PROGRESS_CAP, FAST_PROGRESS_CAP)
        setProgress(prev => Math.max(prev, p))
        return
      }

      const creepElapsed = Math.min(elapsed - FAST_PROGRESS_MS, GENERATION_TIMEOUT_MS - FAST_PROGRESS_MS)
      const creepRange = SLOW_PROGRESS_CAP - FAST_PROGRESS_CAP
      const p = SLOW_PROGRESS_CAP - creepRange * Math.exp(-creepElapsed / CREEP_DECAY_MS)
      setProgress(prev => Math.max(prev, Math.min(p, SLOW_PROGRESS_CAP)))
    }, 80)

    return () => {
      clearInterval(stageTimer)
      clearInterval(progressTimer)
    }
  }, [])

  // When design is ready, finish bar and call onDone
  useEffect(() => {
    if (done || error) return
    if (isGenerating) {
      sawGenerating.current = true
      return
    }
    if (design) {
      setProgress(100)
      setDone(true)
      const timer = setTimeout(onDone, 600)
      return () => clearTimeout(timer)
    }
    if (designError) {
      setError(designError)
      return
    }
    if (sawGenerating.current && !design) {
      const timer = setTimeout(() => {
        setError('Design generation did not complete.')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [done, error, design, isGenerating, designError, onDone])

  useEffect(() => {
    if (done || error || design) return
    const timer = setTimeout(() => {
      setError(`Design generation timed out after ${Math.floor(GENERATION_TIMEOUT_MS / 1000)} seconds.`)
    }, GENERATION_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [done, error, design])

  if (error) {
    return <ErrorScreen error={error} onRetry={() => router.push('/quiz')} onHome={() => router.push('/')} />
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0E0D14',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }}>
      {/* Logo */}
      <p style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: 11, letterSpacing: '0.18em',
        color: 'rgba(196,195,227,0.35)',
        textTransform: 'uppercase',
        marginBottom: 64,
      }}>
        Haus Builder
      </p>

      {/* Animated blueprint grid */}
      <BlueprintGrid />

      {/* Stage label */}
      <p style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: 13, letterSpacing: '0.08em',
        color: '#A3B565',
        marginTop: 48,
        marginBottom: 24,
        minHeight: 24,
        transition: 'opacity 300ms',
      }}>
        {STAGES[stageIdx]}
      </p>

      {/* Progress bar */}
      <div style={{
        width: 320, height: 2,
        background: 'rgba(196,195,227,0.12)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--accent)',
          borderRadius: 2,
          transition: 'width 300ms ease',
        }} />
      </div>

      <p style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: 10, letterSpacing: '0.06em',
        color: 'rgba(196,195,227,0.25)',
        marginTop: 16,
      }}>
        {progress.toFixed(1)}%
      </p>
    </div>
  )
}

function ErrorScreen({ error, onRetry, onHome }: { error: string; onRetry: () => void; onHome: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0E0D14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 24,
    }}>
      <p style={{
        fontFamily: 'var(--font-cormorant)',
        fontSize: 36,
        color: 'var(--text-primary)',
        marginBottom: 10,
      }}>
        Generation failed
      </p>
      <p style={{
        fontFamily: 'var(--font-space-grotesk)',
        fontSize: 14,
        color: 'var(--orange)',
        marginBottom: 24,
        textAlign: 'center',
      }}>
        {error}
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onRetry}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Try again
        </button>
        <button
          onClick={onHome}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: 13,
          }}
        >
          Home
        </button>
      </div>
    </div>
  )
}

function BlueprintGrid() {
  return (
    <svg width="260" height="160" viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Grid */}
      {[0,1,2,3,4,5,6].map(i => (
        <line key={`v${i}`} x1={i*40+10} y1="10" x2={i*40+10} y2="150"
          stroke="rgba(196,195,227,0.08)" strokeWidth="1" />
      ))}
      {[0,1,2,3,4].map(i => (
        <line key={`h${i}`} x1="10" y1={i*35+10} x2="250" y2={i*35+10}
          stroke="rgba(196,195,227,0.08)" strokeWidth="1" />
      ))}
      {/* Animated room outlines */}
      <rect x="10" y="10" width="80" height="70" stroke="#1A56DB" strokeWidth="1.5"
        fill="rgba(26,86,219,0.06)" strokeDasharray="200" strokeDashoffset="200">
        <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.2s" fill="freeze" />
      </rect>
      <rect x="90" y="10" width="60" height="70" stroke="#A3B565" strokeWidth="1.5"
        fill="rgba(163,181,101,0.06)" strokeDasharray="200" strokeDashoffset="200">
        <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.2s" begin="0.3s" fill="freeze" />
      </rect>
      <rect x="150" y="10" width="100" height="35" stroke="#C4C3E3" strokeWidth="1.5"
        fill="rgba(196,195,227,0.05)" strokeDasharray="300" strokeDashoffset="300">
        <animate attributeName="stroke-dashoffset" from="300" to="0" dur="1.2s" begin="0.6s" fill="freeze" />
      </rect>
      <rect x="150" y="45" width="100" height="35" stroke="#FCDD9D" strokeWidth="1.5"
        fill="rgba(252,221,157,0.05)" strokeDasharray="270" strokeDashoffset="270">
        <animate attributeName="stroke-dashoffset" from="270" to="0" dur="1.2s" begin="0.9s" fill="freeze" />
      </rect>
      <rect x="10" y="80" width="240" height="70" stroke="#504E76" strokeWidth="1.5"
        fill="rgba(80,78,118,0.07)" strokeDasharray="640" strokeDashoffset="640">
        <animate attributeName="stroke-dashoffset" from="640" to="0" dur="1.5s" begin="1.2s" fill="freeze" />
      </rect>
      {/* Blinking cursor */}
      <rect x="252" y="148" width="6" height="2" fill="#1A56DB">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}
