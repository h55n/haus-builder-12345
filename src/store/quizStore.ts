import { create } from 'zustand'
import type { ChatMessage, UserProfile, QuizQuestion } from '@/types'

interface QuizState {
  messages: ChatMessage[]
  currentQuestion: QuizQuestion | null
  questionCount: number
  isLoading: boolean
  isComplete: boolean
  profile: UserProfile | null
  error: string | null
  addMessage: (msg: ChatMessage) => void
  setQuestion: (q: QuizQuestion) => void
  setComplete: (p: UserProfile) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  messages: [],
  currentQuestion: null,
  questionCount: 0,
  isLoading: false,
  isComplete: false,
  profile: null,
  error: null,
  addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
  setQuestion: (q) => set(s => ({ currentQuestion: q, questionCount: s.questionCount + 1, error: null })),
  setComplete: (p) => set({ isComplete: true, profile: p, error: null }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
  reset: () => set({ messages: [], currentQuestion: null, questionCount: 0, isLoading: false, isComplete: false, profile: null, error: null }),
}))
