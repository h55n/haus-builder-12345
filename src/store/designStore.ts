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
  moveFurniture: (roomId: string, furnitureId: string, x: number, z: number) => void
  rotateFurniture: (roomId: string, furnitureId: string, delta: number) => void
  rotateRoom: (roomId: string, delta: number) => void
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

  moveFurniture: (roomId, furnitureId, x, z) => set(s => {
    if (!s.design) return s
    return {
      design: {
        ...s.design,
        floors: s.design.floors.map(f => ({
          ...f,
          rooms: f.rooms.map(r =>
            r.id !== roomId ? r : {
              ...r,
              furniture: r.furniture.map(fi =>
                fi.id !== furnitureId ? fi : { ...fi, position: { x, z } }
              ),
            }
          ),
        })),
      },
    }
  }),

  rotateFurniture: (roomId, furnitureId, delta) => set(s => {
    if (!s.design) return s
    return {
      design: {
        ...s.design,
        floors: s.design.floors.map(f => ({
          ...f,
          rooms: f.rooms.map(r =>
            r.id !== roomId ? r : {
              ...r,
              furniture: r.furniture.map(fi =>
                fi.id !== furnitureId ? fi : { ...fi, rotation: normalizeAngle(fi.rotation + delta) }
              ),
            }
          ),
        })),
      },
    }
  }),

  rotateRoom: (roomId, delta) => set(s => {
    if (!s.design) return s
    return {
      design: {
        ...s.design,
        floors: s.design.floors.map(f => ({
          ...f,
          rooms: f.rooms.map(r =>
            r.id !== roomId ? r : { ...r, rotation: normalizeAngle(r.rotation + delta) }
          ),
        })),
      },
    }
  }),
}))
