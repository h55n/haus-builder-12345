'use client'
import { useCallback } from 'react'
import { useQuizStore } from '@/store/quizStore'
import type { QuizResponse } from '@/types'

export function useQuizAgent() {
  const { messages, addMessage, setQuestion, setComplete, setLoading } = useQuizStore()

  const sendAnswer = useCallback(async (answer: string) => {
    const userMsg = { role: 'user' as const, content: answer }
    addMessage(userMsg)
    setLoading(true)

    try {
      const res = await fetch('/api/agent/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data: QuizResponse = await res.json()

      if (data.type === 'question') {
        addMessage({ role: 'assistant', content: JSON.stringify(data) })
        setQuestion(data)
      } else if (data.type === 'complete') {
        addMessage({ role: 'assistant', content: JSON.stringify(data) })
        setComplete(data.profile)
      }
    } catch (e) {
      console.error('[useQuizAgent]', e)
    } finally {
      setLoading(false)
    }
  }, [messages, addMessage, setQuestion, setComplete, setLoading])

  const startQuiz = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/agent/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      })
      const data: QuizResponse = await res.json()
      if (data.type === 'question') {
        addMessage({ role: 'assistant', content: JSON.stringify(data) })
        setQuestion(data)
      }
    } catch (e) {
      console.error('[startQuiz]', e)
    } finally {
      setLoading(false)
    }
  }, [addMessage, setQuestion, setLoading])

  return { sendAnswer, startQuiz }
}
