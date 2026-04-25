'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useArchitectAgent } from '@/hooks/useArchitectAgent'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ArrowLeft } from 'lucide-react'
import type { UserProfile, ArchStyle, BudgetTier } from '@/types'

const STYLES: ArchStyle[] = ['modernist', 'japandi', 'industrial', 'mediterranean', 'scandinavian', 'brutalist', 'mid-century', 'craftsman', 'biophilic']
const LIFESTYLES = ['minimalist', 'family', 'entertainer', 'work-from-home'] as const
const BUDGETS: BudgetTier[] = ['low', 'medium', 'high', 'luxury']

export function QuizShell() {
  const router = useRouter()
  const { generateDesign } = useArchitectAgent()

  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [spaceType, setSpaceType] = useState<'house' | 'room'>('house')
  const [roomType, setRoomType] = useState('')
  const [adults, setAdults] = useState<number>(2)
  const [children, setChildren] = useState<number>(0)
  const [lifestyle, setLifestyle] = useState<typeof LIFESTYLES[number]>('family')
  const [style, setStyle] = useState<ArchStyle>('modernist')
  const [budget, setBudget] = useState<BudgetTier>('medium')
  const [floors, setFloors] = useState<1 | 2 | 3>(1)
  const [outdoorPriority, setOutdoorPriority] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    const profile: UserProfile = {
      spaceType,
      roomType: spaceType === 'room' ? roomType : undefined,
      occupants: { adults, children },
      lifestyle,
      style,
      budget,
      ...(spaceType === 'house' ? { floors, outdoorPriority } : {})
    }

    try {
      const ready = await generateDesign(profile)
      if (ready) {
        // We go to viewer with a special flag indicating we came from AI creation
        // and we want to go straight to 2D view.
        router.push('/viewer?generating=true&view=2d')
      } else {
        setError('Failed to generate design')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (step === 0 && spaceType === 'room' && !roomType.trim()) return
    if (step < 4) setStep(s => s + 1)
    else handleSubmit()
  }

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1)
    else router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
        <button
          onClick={handleBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: 14,
          }}
        >
          <ArrowLeft size={16} /> {step === 0 ? 'Modes' : 'Back'}
        </button>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        maxWidth: 600, margin: '0 auto', width: '100%',
      }}>
        {error && (
          <div style={{
            padding: 16, background: 'rgba(241,100,46,0.1)',
            color: 'var(--orange)', borderRadius: 8, marginBottom: 24,
            width: '100%', textAlign: 'center',
            fontFamily: 'var(--font-space-grotesk)',
          }}>
            {error}
          </div>
        )}

        {isSubmitting ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 32, height: 32, border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: 'var(--text-primary)' }}>
              Generating your plan...
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>

            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 style={titleStyle}>What are we designing?</h2>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <ChoiceBtn active={spaceType === 'house'} onClick={() => setSpaceType('house')}>Whole House</ChoiceBtn>
                  <ChoiceBtn active={spaceType === 'room'} onClick={() => setSpaceType('room')}>Single Room</ChoiceBtn>
                </div>
                {spaceType === 'room' && (
                  <div>
                    <label style={labelStyle}>What kind of room?</label>
                    <input
                      type="text"
                      value={roomType}
                      onChange={e => setRoomType(e.target.value)}
                      placeholder="e.g. Master Bedroom, Home Office"
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 style={titleStyle}>Who is this space for?</h2>
                <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Adults</label>
                    <input type="number" min={1} value={adults} onChange={e => setAdults(parseInt(e.target.value)||1)} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Children</label>
                    <input type="number" min={0} value={children} onChange={e => setChildren(parseInt(e.target.value)||0)} style={inputStyle} />
                  </div>
                </div>

                <h2 style={titleStyle}>What&apos;s your lifestyle like?</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {LIFESTYLES.map(l => (
                    <ChoiceBtn key={l} active={lifestyle === l} onClick={() => setLifestyle(l)}>
                      {l.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </ChoiceBtn>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 style={titleStyle}>Choose an architectural style</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {STYLES.map(s => (
                    <ChoiceBtn key={s} active={style === s} onClick={() => setStyle(s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </ChoiceBtn>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 style={titleStyle}>What&apos;s the budget level?</h2>
                <p style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-muted)', marginBottom: 16 }}>
                  This affects room sizes, material quality, and overall footprint.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ChoiceBtn active={budget === 'low'} onClick={() => setBudget('low')}>Low (Compact, essential rooms)</ChoiceBtn>
                  <ChoiceBtn active={budget === 'medium'} onClick={() => setBudget('medium')}>Medium (Comfortable, well-furnished)</ChoiceBtn>
                  <ChoiceBtn active={budget === 'high'} onClick={() => setBudget('high')}>High (Spacious, quality finishes)</ChoiceBtn>
                  <ChoiceBtn active={budget === 'luxury'} onClick={() => setBudget('luxury')}>Luxury (Maximum space, premium everything)</ChoiceBtn>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                {spaceType === 'house' ? (
                  <>
                    <h2 style={titleStyle}>House Details</h2>
                    <div style={{ marginBottom: 32 }}>
                      <label style={labelStyle}>Number of Floors</label>
                      <div style={{ display: 'flex', gap: 12 }}>
                        {[1, 2, 3].map(n => (
                          <ChoiceBtn key={n} active={floors === n} onClick={() => setFloors(n as any)}>{n}</ChoiceBtn>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Outdoor Priority</label>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <ChoiceBtn active={outdoorPriority} onClick={() => setOutdoorPriority(true)}>High Priority</ChoiceBtn>
                        <ChoiceBtn active={!outdoorPriority} onClick={() => setOutdoorPriority(false)}>Standard</ChoiceBtn>
                      </div>
                    </div>
                  </>
                ) : (
                  <h2 style={titleStyle}>Ready to generate your room!</h2>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
              <button
                onClick={handleNext}
                disabled={step === 0 && spaceType === 'room' && !roomType.trim()}
                style={{
                  padding: '12px 24px', borderRadius: 10, border: 'none',
                  background: 'var(--accent)', color: '#fff',
                  fontFamily: 'var(--font-space-grotesk)', fontSize: 16, fontWeight: 600,
                  cursor: 'pointer', transition: 'opacity 200ms',
                  opacity: (step === 0 && spaceType === 'room' && !roomType.trim()) ? 0.5 : 1
                }}
              >
                {step === 4 ? 'Generate Plan' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 'auto' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i === step ? 'var(--accent)' : 'var(--border)',
            transition: 'background 300ms'
          }} />
        ))}
      </div>
    </div>
  )
}

function ChoiceBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 20px', borderRadius: 10,
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'var(--accent-soft)' : 'var(--surface)',
        color: active ? 'var(--accent)' : 'var(--text-primary)',
        fontFamily: 'var(--font-space-grotesk)', fontSize: 15, fontWeight: 500,
        cursor: 'pointer', transition: 'all 150ms ease',
        textAlign: 'left'
      }}
    >
      {children}
    </button>
  )
}

const titleStyle = {
  fontFamily: 'var(--font-cormorant)',
  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
  fontWeight: 600,
  color: 'var(--text-primary)',
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  marginBottom: 24,
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-space-mono)',
  fontSize: 12,
  letterSpacing: '0.08em',
  color: 'var(--text-secondary)',
  marginBottom: 8,
  textTransform: 'uppercase' as const,
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-space-grotesk)',
  fontSize: 15,
  outline: 'none',
}
