// ─── Architecture Styles ────────────────────────────────────────────
export type ArchStyle =
  | 'modernist' | 'japandi' | 'industrial' | 'mediterranean'
  | 'scandinavian' | 'brutalist' | 'mid-century' | 'craftsman' | 'biophilic'

export type RoofType = 'flat' | 'gabled' | 'monopitch' | 'butterfly' | 'hipped'
export type MaterialPreset = 'concrete' | 'timber' | 'brick'
export type ViewMode = '3d' | '2d' | 'exploded' | 'xray'
export type WallSide = 'north' | 'south' | 'east' | 'west'
export type SwingDir = 'inward' | 'outward'
export type BudgetTier = 'low' | 'medium' | 'high' | 'luxury'

export type RoomType =
  | 'bedroom' | 'master-bedroom' | 'living' | 'kitchen' | 'dining'
  | 'bathroom' | 'office' | 'hallway' | 'garage' | 'patio'
  | 'garden' | 'terrace' | 'staircase' | 'tatami' | 'engawa'
  | 'courtyard' | 'mezzanine' | 'atrium' | 'mudroom' | 'pantry'

export type FurnitureType =
  | 'bed-king' | 'bed-single' | 'sofa' | 'desk' | 'dining-set'
  | 'kitchen-counter' | 'bathtub' | 'toilet' | 'wardrobe'
  | 'bookshelf' | 'plant' | 'lamp' | 'stair'
  | 'refrigerator' | 'dining-chair' | 'mirror'
  | 'table-top' | 'kitchen-top'
  | 'generic'

// ─── User Profile (quiz output) ─────────────────────────────────────
export interface UserProfile {
  spaceType: 'house' | 'room'
  roomType?: string
  occupants: { adults: number; children: number }
  lifestyle: 'minimalist' | 'family' | 'entertainer' | 'work-from-home'
  style: ArchStyle
  budget: BudgetTier
  floors?: 1 | 2 | 3
  outdoorPriority?: boolean
}

// ─── Design Spec (architect agent output → 3D renderer) ─────────────
export interface Window3D {
  wall: WallSide
  offsetX: number      // 0–1 normalized along wall
  width: number
  height: number
  sillHeight: number   // from floor, typically 0.9
}

export interface Door3D {
  wall: WallSide
  offsetX: number
  width: number        // 0.9 standard, 1.2 double
  connectsTo: string   // room id or 'exterior'
  swingDirection: SwingDir
}

export interface FurnitureItem {
  id: string
  type: FurnitureType
  position: { x: number; z: number }   // relative to room center
  rotation: number
  dimensions: { w: number; d: number; h: number }
}

export interface Room3D {
  id: string
  type: RoomType
  label: string
  position: { x: number; z: number }
  dimensions: { w: number; d: number }
  color: string
  rotation: number     // Y-axis: 0 | 90 | 180 | 270
  windows: Window3D[]
  doors: Door3D[]
  furniture: FurnitureItem[]
}

export interface Floor {
  level: number        // 0 = ground
  height: number       // ceiling height in meters
  rooms: Room3D[]
}

export interface DesignSpec {
  id: string
  version: number
  style: ArchStyle
  floors: Floor[]
  roofType: RoofType
  totalArea: number
  generatedAt: string
}

// ─── Builder Mode ────────────────────────────────────────────────────
export interface BuilderItem {
  id: string
  assetType: 'room' | 'furniture' | 'wall' | 'opening'
  assetId: string
  label: string
  position: { x: number; z: number }
  rotation: number
  scale: number
  color: string
  dimensions: { w: number; d: number; h: number }
}

// ─── Quiz ────────────────────────────────────────────────────────────
export type InputType = 'choice' | 'text' | 'number'

export interface QuizQuestion {
  type: 'question'
  content: string
  inputType: InputType
  options?: string[]
}

export interface QuizComplete {
  type: 'complete'
  profile: UserProfile
}

export type QuizResponse = QuizQuestion | QuizComplete

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
