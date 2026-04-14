import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { BuilderItem, DesignSpec, FurnitureItem, Room3D } from '@/types'

const PALETTE = ['#C4C3E3','#504E76','#FDF8E2','#A3B565','#FCDD9D','#F1642E','#B8B4D0','#E8E4C8']

interface BuilderState {
  items: BuilderItem[]
  selectedId: string | null
  history: BuilderItem[][]
  historyIndex: number
  addItem: (item: Omit<BuilderItem, 'id' | 'color'>) => void
  removeItem: (id: string) => void
  updateItem: (id: string, patch: Partial<BuilderItem>) => void
  selectItem: (id: string | null) => void
  undo: () => void
  redo: () => void
  toDesignSpec: () => DesignSpec
  reset: () => void
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  items: [],
  selectedId: null,
  history: [[]],
  historyIndex: 0,

  addItem: (item) => set(s => {
    const color = PALETTE[s.items.length % PALETTE.length]
    const newItem = { ...item, id: uuid(), color }
    const next = [...s.items, newItem]
    const hist = s.history.slice(0, s.historyIndex + 1)
    return { items: next, history: [...hist, next].slice(-50), historyIndex: Math.min(s.historyIndex + 1, 49) }
  }),

  removeItem: (id) => set(s => {
    const next = s.items.filter(i => i.id !== id)
    const hist = s.history.slice(0, s.historyIndex + 1)
    return { items: next, selectedId: null, history: [...hist, next].slice(-50), historyIndex: Math.min(s.historyIndex + 1, 49) }
  }),

  updateItem: (id, patch) => set(s => {
    const next = s.items.map(i => i.id === id ? { ...i, ...patch } : i)
    return { items: next }
  }),

  selectItem: (id) => set({ selectedId: id }),

  undo: () => set(s => {
    if (s.historyIndex <= 0) return s
    const idx = s.historyIndex - 1
    return { items: s.history[idx], historyIndex: idx }
  }),

  redo: () => set(s => {
    if (s.historyIndex >= s.history.length - 1) return s
    const idx = s.historyIndex + 1
    return { items: s.history[idx], historyIndex: idx }
  }),

  toDesignSpec: (): DesignSpec => {
    const { items } = get()
    const rooms: Room3D[] = items
      .filter(i => i.assetType === 'room')
      .map(i => ({
        id: i.id,
        type: i.assetId as any,
        label: i.label,
        position: i.position,
        dimensions: { w: i.dimensions.w, d: i.dimensions.d },
        color: i.color,
        rotation: i.rotation,
        windows: [{ wall: 'south', offsetX: 0.5, width: 1.2, height: 1.2, sillHeight: 0.9 }],
        doors: [{ wall: 'north', offsetX: 0.5, width: 0.9, connectsTo: 'exterior', swingDirection: 'inward' as const }],
        furniture: items
          .filter(f => f.assetType === 'furniture')
          .map(f => ({
            id: f.id,
            type: f.assetId as any,
            position: { x: f.position.x - i.position.x, z: f.position.z - i.position.z },
            rotation: f.rotation,
            dimensions: f.dimensions,
          })) as FurnitureItem[],
      }))

    return {
      id: uuid(),
      version: 1,
      style: 'modernist',
      floors: [{ level: 0, height: 2.8, rooms }],
      roofType: 'flat',
      totalArea: rooms.reduce((a, r) => a + r.dimensions.w * r.dimensions.d, 0),
      generatedAt: new Date().toISOString(),
    }
  },

  reset: () => set({ items: [], selectedId: null, history: [[]], historyIndex: 0 }),
}))
