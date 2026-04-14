import { create } from 'zustand'
import type { ChatMessage, UserProfile, QuizQuestion } from '@/types'

interface QuizState {
  messages: ChatMessage[]
  currentQuestion: QuizQuestion | null
  questionCount: number
  isLoading: boolean
  isComplete: boolean
  profile: UserProfile | null
  addMessage: (msg: ChatMessage) => void
  setQuestion: (q: QuizQuestion) => void
  setComplete: (p: UserProfile) => void
  setLoading: (v: boolean) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  messages: [],
  currentQuestion: null,
  questionCount: 0,
  isLoading: false,
  isComplete: false,
  profile: null,
  addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
  setQuestion: (q) => set(s => ({ currentQuestion: q, questionCount: s.questionCount + 1 })),
  setComplete: (p) => set({ isComplete: true, profile: p }),
  setLoading: (v) => set({ isLoading: v }),
  reset: () => set({ messages: [], currentQuestion: null, questionCount: 0, isLoading: false, isComplete: false, profile: null }),
}))
