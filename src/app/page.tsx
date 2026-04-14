'use client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Sparkles, PenLine } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
    }}>

      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 24, right: 24 }}>
        <ThemeToggle />
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Haus Builder
        </p>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          marginBottom: 20,
        }}>
          Design your home.<br />Instantly.
        </h1>
        <p style={{
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: 17,
          color: 'var(--text-secondary)',
          maxWidth: 420,
          lineHeight: 1.6,
        }}>
          From blank page to furnished 3D home in under 3 minutes. No CAD skills. No sign-up.
        </p>
      </div>

      {/* Mode cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
        width: '100%',
        maxWidth: 720,
      }}>
        <ModeCard
          icon={<Sparkles size={24} />}
          tag="AI MODE"
          title="Build with AI"
          description="Answer 5–7 questions. Our architect agent designs a complete furnished home for you."
          cta="Start Quiz"
          accent
          onClick={() => router.push('/quiz')}
        />
        <ModeCard
          icon={<PenLine size={24} />}
          tag="MANUAL"
          title="Build Yourself"
          description="Drag rooms, walls, and furniture onto a blank canvas. Full control, zero friction."
          cta="Open Canvas"
          onClick={() => router.push('/builder')}
        />
      </div>

      {/* Footer note */}
      <p style={{
        position: 'absolute', bottom: 24,
        fontFamily: 'var(--font-space-mono)',
        fontSize: 11, color: 'var(--text-muted)',
        letterSpacing: '0.06em',
      }}>
        DESKTOP ONLY · PNG EXPORT · NO SIGN-UP
      </p>
    </main>
  )
}

function ModeCard({
  icon, tag, title, description, cta, accent, onClick
}: {
  icon: React.ReactNode
  tag: string
  title: string
  description: string
  cta: string
  accent?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: accent ? 'var(--accent)' : 'var(--surface)',
        border: `1px solid ${accent ? 'transparent' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '32px 28px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = accent
          ? '0 12px 40px rgba(26,86,219,0.35)'
          : '0 8px 32px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      <div style={{ color: accent ? 'rgba(255,255,255,0.8)' : 'var(--accent)' }}>
        {icon}
      </div>
      <p style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: 10, letterSpacing: '0.14em',
        color: accent ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)',
        textTransform: 'uppercase',
      }}>
        {tag}
      </p>
      <h2 style={{
        fontFamily: 'var(--font-cormorant)',
        fontSize: 28, fontWeight: 600,
        color: accent ? '#fff' : 'var(--text-primary)',
        lineHeight: 1.1, letterSpacing: '-0.01em',
      }}>
        {title}
      </h2>
      <p style={{
        fontFamily: 'var(--font-space-grotesk)',
        fontSize: 14, lineHeight: 1.6,
        color: accent ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
      }}>
        {description}
      </p>
      <div style={{
        marginTop: 8,
        fontFamily: 'var(--font-space-grotesk)',
        fontSize: 14, fontWeight: 600,
        color: accent ? '#fff' : 'var(--accent)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {cta} →
      </div>
    </button>
  )
}
