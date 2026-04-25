'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { useArchitectAgent } from '@/hooks/useArchitectAgent'
import { useQuizAgent } from '@/hooks/useQuizAgent'
import { ProgressDots } from './ProgressDots'
import { ChoiceInput } from './ChoiceInput'
import { TextInput } from './TextInput'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ArrowLeft } from 'lucide-react'

export function QuizShell() {
  const router = useRouter()
  const { currentQuestion, questionCount, isLoading, isComplete, profile, error } = useQuizStore()
  const { startQuiz, sendAnswer } = useQuizAgent()
  const { generateDesign } = useArchitectAgent()
  const hasStarted = useRef(false)
  const hasNavigated = useRef(false)

  // Start quiz on mount
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    startQuiz()
  }, [startQuiz])

  // When complete — kick off design generation and go to cinematic
  useEffect(() => {
    if (isComplete && profile && !hasNavigated.current) {
      hasNavigated.current = true
      ;(async () => {
        const ready = await generateDesign(profile)
        if (ready) {
          router.push('/viewer?generating=true')
        } else {
          hasNavigated.current = false
        }
      })()
    }
  }, [isComplete, profile, router, generateDesign])

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
          onClick={() => router.push('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: 14,
          }}
        >
          <ArrowLeft size={16} /> Modes
        </button>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        maxWidth: 600, margin: '0 auto', width: '100%',
      }}>
        <ProgressDots total={7} current={questionCount} />

        <div style={{ marginTop: 40, width: '100%' }}>
          {isLoading && !currentQuestion && (
            <p style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 28, color: 'var(--text-muted)',
              textAlign: 'center',
            }}>
              Thinking…
            </p>
          )}

          {error && !isLoading && (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: 14,
                color: 'var(--orange)',
                marginBottom: 16,
              }}>
                Quiz failed — {error}
              </p>
              <button
                onClick={() => startQuiz()}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-space-grotesk)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          )}

          {currentQuestion && (
            <div>
              <h2 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                marginBottom: 32,
              }}>
                {currentQuestion.content}
              </h2>

              {currentQuestion.inputType === 'choice' && currentQuestion.options && (
                <ChoiceInput
                  options={currentQuestion.options}
                  onSelect={(v) => !isLoading && sendAnswer(v)}
                />
              )}

              {currentQuestion.inputType === 'text' && (
                <TextInput
                  onSubmit={(v) => !isLoading && sendAnswer(v)}
                  placeholder="Your answer…"
                />
              )}

              {currentQuestion.inputType === 'number' && (
                <TextInput
                  type="number"
                  onSubmit={(v) => !isLoading && sendAnswer(v)}
                  placeholder="Enter a number…"
                />
              )}

              {isLoading && (
                <div style={{
                  marginTop: 20,
                  display: 'flex', alignItems: 'center', gap: 10,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-space-grotesk)',
                  fontSize: 13,
                }}>
                  <Spinner /> Processing…
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Question counter */}
      <p style={{
        textAlign: 'center',
        fontFamily: 'var(--font-space-mono)',
        fontSize: 11, color: 'var(--text-muted)',
        letterSpacing: '0.08em',
      }}>
        {questionCount > 0 ? `Q${questionCount} OF 7 MAX` : ''}
      </p>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 700ms linear infinite',
    }} />
  )
}
