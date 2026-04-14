import { z } from 'zod'

export const WallSideZ = z.enum(['north', 'south', 'east', 'west'])
export const SwingDirZ = z.enum(['inward', 'outward'])
export const RoofTypeZ = z.enum(['flat', 'gabled', 'monopitch', 'butterfly', 'hipped'])
export const ArchStyleZ = z.enum([
  'modernist', 'japandi', 'industrial', 'mediterranean',
  'scandinavian', 'brutalist', 'mid-century', 'craftsman', 'biophilic'
])
export const BudgetTierZ = z.enum(['low', 'medium', 'high', 'luxury'])

export const Window3DZ = z.object({
  wall: WallSideZ,
  offsetX: z.number().min(0).max(1),
  width: z.number().min(0.4).max(4),
  height: z.number().min(0.4).max(3),
  sillHeight: z.number().min(0).max(2),
})

export const Door3DZ = z.object({
  wall: WallSideZ,
  offsetX: z.number().min(0).max(1),
  width: z.number().min(0.7).max(1.8),
  connectsTo: z.string(),
  swingDirection: SwingDirZ,
})

export const FurnitureItemZ = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), z: z.number() }),
  rotation: z.number(),
  dimensions: z.object({ w: z.number(), d: z.number(), h: z.number() }),
})

export const Room3DZ = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  position: z.object({ x: z.number(), z: z.number() }),
  dimensions: z.object({
    w: z.number().min(1.8).max(12),
    d: z.number().min(1.8).max(12),
  }),
  color: z.string(),
  rotation: z.number(),
  windows: z.array(Window3DZ),
  doors: z.array(Door3DZ).min(1),
  furniture: z.array(FurnitureItemZ),
})

export const FloorZ = z.object({
  level: z.number().int().min(0).max(4),
  height: z.number().min(2.2).max(4.5),
  rooms: z.array(Room3DZ).min(1),
})

export const DesignSpecZ = z.object({
  id: z.string(),
  version: z.number().int().min(1),
  style: ArchStyleZ,
  floors: z.array(FloorZ).min(1),
  roofType: RoofTypeZ,
  totalArea: z.number().positive(),
  generatedAt: z.string(),
})

export const UserProfileZ = z.object({
  spaceType: z.enum(['house', 'room']),
  roomType: z.string().optional(),
  occupants: z.object({ adults: z.number().int().min(1), children: z.number().int().min(0) }),
  lifestyle: z.enum(['minimalist', 'family', 'entertainer', 'work-from-home']),
  style: ArchStyleZ,
  budget: BudgetTierZ,
  floors: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  outdoorPriority: z.boolean().optional(),
})
