'use client'
import { useEffect, useState } from 'react'

const STAGES = [
  'Reading your brief…',
  'Planning spaces…',
  'Placing structure…',
  'Measuring rooms…',
  'Furnishing interiors…',
  'Final touches…',
]

export function CinematicLoader({ onDone }: { onDone: () => void }) {
  const [stageIdx, setStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Cycle stage labels every 2s
    const stageTimer = setInterval(() => {
      setStageIdx(i => Math.min(i + 1, STAGES.length - 1))
    }, 2000)

    // Progress bar: fill over ~10s, then hold at 92% until done
    const start = Date.now()
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min((elapsed / 10000) * 92, 92)
      setProgress(p)
    }, 80)

    return () => {
      clearInterval(stageTimer)
      clearInterval(progressTimer)
    }
  }, [])

  // When design is ready, finish bar and call onDone
  useEffect(() => {
    if (done) return
    const check = setInterval(() => {
      // Check if design is in store
      try {
        const raw = localStorage.getItem('haus-design-ready')
        if (raw === 'true') {
          setProgress(100)
          setDone(true)
          localStorage.removeItem('haus-design-ready')
          setTimeout(onDone, 600)
          clearInterval(check)
        }
      } catch {}
    }, 300)
    return () => clearInterval(check)
  }, [done, onDone])

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
        {Math.round(progress)}%
      </p>
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
