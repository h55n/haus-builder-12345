import { create } from 'zustand'
import type { DesignSpec } from '@/types'

interface DesignState {
  design: DesignSpec | null
  history: DesignSpec[]
  isGenerating: boolean
  error: string | null
  setDesign: (d: DesignSpec) => void
  setGenerating: (v: boolean) => void
  setError: (e: string | null) => void
  clearDesign: () => void
}

export const useDesignStore = create<DesignState>((set) => ({
  design: null,
  history: [],
  isGenerating: false,
  error: null,
  setDesign: (d) => set(s => ({ design: d, history: [...s.history, d].slice(-20) })),
  setGenerating: (v) => set({ isGenerating: v }),
  setError: (e) => set({ error: e }),
  clearDesign: () => set({ design: null, history: [] }),
}))
