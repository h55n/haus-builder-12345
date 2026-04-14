'use client'
import { useCallback } from 'react'
import { useQuizStore } from '@/store/quizStore'
import type { QuizResponse } from '@/types'

type QuizErrorResponse = { type: 'error'; message: string }
type QuizAgentResponse = QuizResponse | QuizErrorResponse

export function useQuizAgent() {
  const { messages, addMessage, setQuestion, setComplete, setLoading, setError } = useQuizStore()

  const sendAnswer = useCallback(async (answer: string) => {
    const userMsg = { role: 'user' as const, content: answer }
    addMessage(userMsg)
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/agent/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data: QuizAgentResponse = await res.json()

      if (!res.ok || data.type === 'error') {
        const message = data.type === 'error' ? data.message : `Request failed (HTTP ${res.status})`
        setError(message)
        return
      }

      if (data.type === 'question') {
        addMessage({ role: 'assistant', content: JSON.stringify(data) })
        setQuestion(data)
      } else if (data.type === 'complete') {
        addMessage({ role: 'assistant', content: JSON.stringify(data) })
        setComplete(data.profile)
      }
    } catch (e) {
      console.error('[useQuizAgent]', e)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [messages, addMessage, setQuestion, setComplete, setLoading, setError])

  const startQuiz = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/agent/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      })
      const data: QuizAgentResponse = await res.json()
      if (!res.ok || data.type === 'error') {
        const message = data.type === 'error' ? data.message : `Request failed (HTTP ${res.status})`
        setError(message)
        return
      }
      if (data.type === 'question') {
        addMessage({ role: 'assistant', content: JSON.stringify(data) })
        setQuestion(data)
      }
    } catch (e) {
      console.error('[startQuiz]', e)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [addMessage, setQuestion, setLoading, setError])

  return { sendAnswer, startQuiz }
}
