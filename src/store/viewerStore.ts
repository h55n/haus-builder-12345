import { create } from 'zustand'
import type { ViewMode, MaterialPreset } from '@/types'

interface ViewerState {
  viewMode: ViewMode
  materialPreset: MaterialPreset
  snapEnabled: boolean
  selectedId: string | null
  selectedType: 'room' | 'furniture' | null
  sceneRendered: boolean
  setViewMode: (m: ViewMode) => void
  setSceneRendered: (rendered: boolean) => void
  cycleMaterial: () => void
  toggleSnap: () => void
  setSelected: (id: string | null, type?: 'room' | 'furniture' | null) => void
}

const MATERIALS: MaterialPreset[] = ['concrete', 'timber', 'brick']

export const useViewerStore = create<ViewerState>((set) => ({
  viewMode: '3d',
  materialPreset: 'concrete',
  snapEnabled: false,
  selectedId: null,
  selectedType: null,
  sceneRendered: false,
  setViewMode: (m) => set({ viewMode: m }),
  setSceneRendered: (rendered) => set({ sceneRendered: rendered }),
  cycleMaterial: () => set(s => {
    const i = MATERIALS.indexOf(s.materialPreset)
    return { materialPreset: MATERIALS[(i + 1) % MATERIALS.length] }
  }),
  toggleSnap: () => set(s => ({ snapEnabled: !s.snapEnabled })),
  setSelected: (id, type = null) => set({ selectedId: id, selectedType: type }),
}))
