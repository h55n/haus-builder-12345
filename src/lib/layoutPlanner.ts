import { v4 as uuid } from 'uuid'
import type { DesignSpec, Door3D, FurnitureItem, Room3D, UserProfile, WallSide } from '@/types'

const GRID = 0.5
const EPS = 0.05
const MIN_SHARED_OPENING = 1
const COLORS = ['#C4C3E3', '#504E76', '#FDF8E2', '#A3B565', '#FCDD9D', '#F1642E', '#B8B4D0', '#E8E4C8', '#D4C9A8', '#8B9E6A']

function snap(v: number) {
  return Math.round(v / GRID) * GRID
}

function normalizeRotation(rotation: number) {
  return ((Math.round(rotation / 90) * 90) % 360 + 360) % 360
}

function roomBounds(room: Pick<Room3D, 'position' | 'dimensions'>) {
  const minX = room.position.x - room.dimensions.w / 2
  const maxX = room.position.x + room.dimensions.w / 2
  const minZ = room.position.z - room.dimensions.d / 2
  const maxZ = room.position.z + room.dimensions.d / 2
  return { minX, maxX, minZ, maxZ }
}

function toOffset(value: number, min: number, size: number) {
  return Math.max(0.1, Math.min(0.9, (value - min) / size))
}

function createDoor(wall: WallSide, offsetX: number, width: number, connectsTo: string): Door3D {
  return { wall, offsetX: Math.max(0.1, Math.min(0.9, offsetX)), width, connectsTo, swingDirection: 'inward' }
}

function buildFurniture(room: Room3D): FurnitureItem[] {
  const { w, d } = room.dimensions
  const againstNorth = -d / 2
  const againstSouth = d / 2
  const againstEast = w / 2
  const againstWest = -w / 2

  if (room.type === 'living') {
    return [
      { id: uuid(), type: 'sofa', position: { x: 0, z: againstSouth - 0.7 }, rotation: 0, dimensions: { w: 2.2, d: 0.9, h: 0.85 } },
      { id: uuid(), type: 'table-top', position: { x: 0, z: againstNorth + 0.4 }, rotation: 180, dimensions: { w: 1.4, d: 0.45, h: 0.5 } },
      { id: uuid(), type: 'lamp', position: { x: againstEast - 0.4, z: againstNorth + 0.4 }, rotation: 0, dimensions: { w: 0.3, d: 0.3, h: 1.6 } },
      { id: uuid(), type: 'plant', position: { x: againstWest + 0.4, z: againstNorth + 0.4 }, rotation: 0, dimensions: { w: 0.4, d: 0.4, h: 1.2 } },
    ]
  }
  if (room.type === 'dining') {
    return [
      { id: uuid(), type: 'dining-set', position: { x: 0, z: 0 }, rotation: 0, dimensions: { w: 1.6, d: 1.0, h: 0.75 } },
    ]
  }
  if (room.type === 'kitchen') {
    return [
      { id: uuid(), type: 'kitchen-counter', position: { x: 0, z: againstNorth + 0.35 }, rotation: 0, dimensions: { w: Math.min(2.6, w - 0.6), d: 0.6, h: 0.9 } },
      { id: uuid(), type: 'kitchen-counter', position: { x: againstEast - 0.35, z: 0 }, rotation: 90, dimensions: { w: Math.min(2.2, d - 0.6), d: 0.6, h: 0.9 } },
      { id: uuid(), type: 'refrigerator', position: { x: againstWest + 0.5, z: againstNorth + 0.45 }, rotation: 0, dimensions: { w: 0.92, d: 0.74, h: 1.95 } },
    ]
  }
  if (room.type === 'bathroom') {
    return [
      { id: uuid(), type: 'toilet', position: { x: againstWest + 0.35, z: 0 }, rotation: 90, dimensions: { w: 0.5, d: 0.7, h: 0.8 } },
      { id: uuid(), type: 'bathtub', position: { x: 0, z: againstNorth + 0.45 }, rotation: 0, dimensions: { w: 1.7, d: 0.8, h: 0.6 } },
    ]
  }
  if (room.type === 'office') {
    return [
      { id: uuid(), type: 'desk', position: { x: 0, z: againstNorth + 0.45 }, rotation: 180, dimensions: { w: 1.4, d: 0.7, h: 0.75 } },
      { id: uuid(), type: 'bookshelf', position: { x: againstEast - 0.2, z: 0 }, rotation: 90, dimensions: { w: 0.9, d: 0.3, h: 1.8 } },
      { id: uuid(), type: 'lamp', position: { x: againstWest + 0.3, z: againstSouth - 0.3 }, rotation: 0, dimensions: { w: 0.3, d: 0.3, h: 1.6 } },
    ]
  }
  if (room.type === 'hallway') {
    return [
      { id: uuid(), type: 'plant', position: { x: 0, z: 0 }, rotation: 0, dimensions: { w: 0.4, d: 0.4, h: 1.2 } },
    ]
  }
  if (room.type === 'patio' || room.type === 'terrace' || room.type === 'garden' || room.type === 'courtyard') {
    return [
      { id: uuid(), type: 'plant', position: { x: 0, z: 0 }, rotation: 0, dimensions: { w: 0.4, d: 0.4, h: 1.2 } },
      { id: uuid(), type: 'plant', position: { x: againstEast - 0.5, z: againstNorth + 0.5 }, rotation: 0, dimensions: { w: 0.4, d: 0.4, h: 1.2 } },
    ]
  }
  if (room.type === 'bedroom' || room.type === 'master-bedroom') {
    return [
      { id: uuid(), type: room.type === 'master-bedroom' ? 'bed-king' : 'bed-single', position: { x: 0, z: againstNorth + 1.1 }, rotation: 180, dimensions: room.type === 'master-bedroom' ? { w: 2.0, d: 2.1, h: 0.55 } : { w: 1.0, d: 2.0, h: 0.55 } },
      { id: uuid(), type: 'wardrobe', position: { x: againstEast - 0.35, z: 0 }, rotation: 90, dimensions: { w: 1.8, d: 0.6, h: 2.1 } },
      { id: uuid(), type: 'lamp', position: { x: againstWest + 0.3, z: againstNorth + 0.5 }, rotation: 0, dimensions: { w: 0.3, d: 0.3, h: 1.6 } },
    ]
  }
  return [{ id: uuid(), type: 'plant', position: { x: 0, z: 0 }, rotation: 0, dimensions: { w: 0.4, d: 0.4, h: 1.2 } }]
}

function sharedWallDoors(a: Room3D, b: Room3D): [Door3D, Door3D] | null {
  const ra = roomBounds(a)
  const rb = roomBounds(b)

  const overlapZ = Math.min(ra.maxZ, rb.maxZ) - Math.max(ra.minZ, rb.minZ)
  const overlapX = Math.min(ra.maxX, rb.maxX) - Math.max(ra.minX, rb.minX)

  if (Math.abs(ra.maxX - rb.minX) <= EPS && overlapZ >= MIN_SHARED_OPENING) {
    const doorLineZ = (Math.max(ra.minZ, rb.minZ) + Math.min(ra.maxZ, rb.maxZ)) / 2
    return [
      createDoor('east', toOffset(doorLineZ, ra.minZ, a.dimensions.d), 0.9, b.id),
      createDoor('west', toOffset(doorLineZ, rb.minZ, b.dimensions.d), 0.9, a.id),
    ]
  }
  if (Math.abs(rb.maxX - ra.minX) <= EPS && overlapZ >= MIN_SHARED_OPENING) {
    const doorLineZ = (Math.max(ra.minZ, rb.minZ) + Math.min(ra.maxZ, rb.maxZ)) / 2
    return [
      createDoor('west', toOffset(doorLineZ, ra.minZ, a.dimensions.d), 0.9, b.id),
      createDoor('east', toOffset(doorLineZ, rb.minZ, b.dimensions.d), 0.9, a.id),
    ]
  }
  if (Math.abs(ra.maxZ - rb.minZ) <= EPS && overlapX >= MIN_SHARED_OPENING) {
    const doorLineX = (Math.max(ra.minX, rb.minX) + Math.min(ra.maxX, rb.maxX)) / 2
    return [
      createDoor('south', toOffset(doorLineX, ra.minX, a.dimensions.w), 0.9, b.id),
      createDoor('north', toOffset(doorLineX, rb.minX, b.dimensions.w), 0.9, a.id),
    ]
  }
  if (Math.abs(rb.maxZ - ra.minZ) <= EPS && overlapX >= MIN_SHARED_OPENING) {
    const doorLineX = (Math.max(ra.minX, rb.minX) + Math.min(ra.maxX, rb.maxX)) / 2
    return [
      createDoor('north', toOffset(doorLineX, ra.minX, a.dimensions.w), 0.9, b.id),
      createDoor('south', toOffset(doorLineX, rb.minX, b.dimensions.w), 0.9, a.id),
    ]
  }
  return null
}

export function rebuildDoorsForRooms(rooms: Room3D[]) {
  const byRoom = new Map<string, Door3D[]>()
  const sharedWalls = new Map<string, Set<WallSide>>()

  rooms.forEach((room) => {
    byRoom.set(room.id, [])
    sharedWalls.set(room.id, new Set())
  })

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const doors = sharedWallDoors(rooms[i], rooms[j])
      if (!doors) continue
      byRoom.get(rooms[i].id)!.push(doors[0])
      byRoom.get(rooms[j].id)!.push(doors[1])
      sharedWalls.get(rooms[i].id)!.add(doors[0].wall)
      sharedWalls.get(rooms[j].id)!.add(doors[1].wall)
    }
  }

  const priority: WallSide[] = ['south', 'west', 'north', 'east']

  return rooms.map((room) => {
    const current = byRoom.get(room.id) ?? []
    const usedWalls = sharedWalls.get(room.id) ?? new Set<WallSide>()
    const exteriorWall = priority.find((wall) => !usedWalls.has(wall)) ?? 'south'
    const hasExterior = current.some((door) => door.connectsTo === 'exterior')
    const withExterior = hasExterior ? current : [...current, createDoor(exteriorWall, 0.5, 1.0, 'exterior')]
    return { ...room, doors: withExterior }
  })
}

function plannedRooms(profile: UserProfile): Room3D[] {
  const wantsOffice = profile.lifestyle === 'work-from-home'
  const hasKids = profile.occupants.children > 0
  const extraBedroom = hasKids || profile.occupants.adults > 2 || profile.budget === 'high' || profile.budget === 'luxury'
  const needsMaster = profile.budget === 'high' || profile.budget === 'luxury'

  const rooms: Room3D[] = [
    { id: uuid(), type: 'living', label: 'Living Room', position: { x: -4, z: 1 }, dimensions: { w: 6, d: 6 }, color: COLORS[0], rotation: 0, windows: [{ wall: 'south', offsetX: 0.5, width: 2.4, height: 1.6, sillHeight: 0.5 }], doors: [], furniture: [] },
    { id: uuid(), type: 'dining', label: 'Dining Room', position: { x: 3, z: 1 }, dimensions: { w: 4, d: 4 }, color: COLORS[1], rotation: 0, windows: [{ wall: 'south', offsetX: 0.5, width: 1.8, height: 1.4, sillHeight: 0.8 }], doors: [], furniture: [] },
    { id: uuid(), type: 'kitchen', label: 'Kitchen', position: { x: 7, z: 1 }, dimensions: { w: 4, d: 4 }, color: COLORS[2], rotation: 0, windows: [{ wall: 'east', offsetX: 0.5, width: 1.8, height: 1.4, sillHeight: 0.8 }], doors: [], furniture: [] },
    { id: uuid(), type: 'hallway', label: 'Hallway', position: { x: 0, z: 4 }, dimensions: { w: 2, d: 8 }, color: COLORS[3], rotation: 0, windows: [], doors: [], furniture: [] },
    { id: uuid(), type: 'bedroom', label: 'Bedroom', position: { x: -2, z: 10 }, dimensions: { w: 4, d: 4 }, color: COLORS[4], rotation: 0, windows: [{ wall: 'north', offsetX: 0.5, width: 1.6, height: 1.4, sillHeight: 0.9 }], doors: [], furniture: [] },
    { id: uuid(), type: 'bathroom', label: 'Bathroom', position: { x: -5, z: 10 }, dimensions: { w: 3, d: 3 }, color: COLORS[5], rotation: 0, windows: [], doors: [], furniture: [] },
    { id: uuid(), type: 'patio', label: 'Patio', position: { x: -4, z: -4 }, dimensions: { w: 6, d: 4 }, color: COLORS[6], rotation: 0, windows: [], doors: [], furniture: [] },
  ]

  if (extraBedroom) {
    rooms.push({
      id: uuid(),
      type: 'bedroom',
      label: 'Bedroom 2',
      position: { x: 2, z: 10 },
      dimensions: { w: 4, d: 4 },
      color: COLORS[7],
      rotation: 0,
      windows: [{ wall: 'north', offsetX: 0.5, width: 1.6, height: 1.4, sillHeight: 0.9 }],
      doors: [],
      furniture: [],
    })
  }

  if (needsMaster) {
    rooms.push({
      id: uuid(),
      type: 'master-bedroom',
      label: 'Master Bedroom',
      position: { x: 6.5, z: 10 },
      dimensions: { w: 5, d: 4.5 },
      color: COLORS[8],
      rotation: 0,
      windows: [{ wall: 'north', offsetX: 0.5, width: 2.0, height: 1.5, sillHeight: 0.8 }],
      doors: [],
      furniture: [],
    })
    rooms.push({
      id: uuid(),
      type: 'bathroom',
      label: 'Master Bath',
      position: { x: 9.25, z: 10 },
      dimensions: { w: 2.5, d: 3 },
      color: COLORS[9],
      rotation: 0,
      windows: [],
      doors: [],
      furniture: [],
    })
  }

  if (wantsOffice) {
    rooms.push({
      id: uuid(),
      type: 'office',
      label: 'Office',
      position: { x: 2, z: 6 },
      dimensions: { w: 4, d: 4 },
      color: COLORS[(rooms.length + 1) % COLORS.length],
      rotation: 0,
      windows: [{ wall: 'east', offsetX: 0.5, width: 1.4, height: 1.3, sillHeight: 0.9 }],
      doors: [],
      furniture: [],
    })
  }

  return rooms.map((room) => ({
    ...room,
    position: { x: snap(room.position.x), z: snap(room.position.z) },
    dimensions: { w: snap(room.dimensions.w), d: snap(room.dimensions.d) },
    rotation: normalizeRotation(room.rotation),
  }))
}

export function finalizeFloorLayout(rooms: Room3D[]) {
  const withFurniture = rooms.map((room) => ({
    ...room,
    rotation: normalizeRotation(room.rotation),
    position: { x: snap(room.position.x), z: snap(room.position.z) },
    furniture: room.furniture?.length ? room.furniture : buildFurniture(room),
  }))
  return rebuildDoorsForRooms(withFurniture)
}

export function buildPlannedDesign(profile: UserProfile): DesignSpec {
  const rooms = finalizeFloorLayout(plannedRooms(profile))
  const totalArea = rooms.reduce((sum, room) => sum + room.dimensions.w * room.dimensions.d, 0)

  return {
    id: uuid(),
    version: 1,
    style: profile.style,
    floors: [{ level: 0, height: 2.8, rooms }],
    roofType: profile.style === 'scandinavian' || profile.style === 'craftsman' ? 'gabled' : 'flat',
    totalArea,
    generatedAt: new Date().toISOString(),
  }
}

