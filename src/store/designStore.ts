import { create } from 'zustand'
import type { DesignSpec, UserProfile } from '@/types'

interface DesignState {
  design: DesignSpec | null
  profile: UserProfile | null
  history: DesignSpec[]
  isGenerating: boolean
  error: string | null
  setDesign: (d: DesignSpec) => void
  setProfile: (p: UserProfile | null) => void
  setGenerating: (v: boolean) => void
  setError: (e: string | null) => void
  clearDesign: () => void
}

export const useDesignStore = create<DesignState>((set) => ({
  design: null,
  profile: null,
  history: [],
  isGenerating: false,
  error: null,
  setDesign: (d) => set(s => ({ design: d, history: [...s.history, d].slice(-20) })),
  setProfile: (p) => set({ profile: p }),
  setGenerating: (v) => set({ isGenerating: v }),
  setError: (e) => set({ error: e }),
  clearDesign: () => set({ design: null, profile: null, history: [] }),
}))
