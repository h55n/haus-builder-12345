import { v4 as uuid } from 'uuid'
import type { DesignSpec, Room3D, UserProfile } from '@/types'

const ROOM_COLORS = ['#C4C3E3', '#FDF8E2', '#A3B565', '#B8B4D0']

function roomFurniture(roomType: Room3D['type']) {
  if (roomType === 'living') {
    return [
      { id: uuid(), type: 'sofa', position: { x: 0, z: 0.7 }, rotation: 180, dimensions: { w: 2.2, d: 0.9, h: 0.85 } },
      { id: uuid(), type: 'lamp', position: { x: -1.0, z: -0.8 }, rotation: 0, dimensions: { w: 0.3, d: 0.3, h: 1.6 } },
    ]
  }
  if (roomType === 'kitchen') {
    return [
      { id: uuid(), type: 'kitchen-counter', position: { x: 0, z: -1.0 }, rotation: 0, dimensions: { w: 2.5, d: 0.6, h: 0.9 } },
      { id: uuid(), type: 'refrigerator', position: { x: 1.4, z: -1.0 }, rotation: 0, dimensions: { w: 0.92, d: 0.74, h: 1.95 } },
    ]
  }
  if (roomType === 'bathroom') {
    return [
      { id: uuid(), type: 'toilet', position: { x: -0.4, z: 0.2 }, rotation: 90, dimensions: { w: 0.5, d: 0.7, h: 0.8 } },
      { id: uuid(), type: 'bathtub', position: { x: 0.5, z: -0.2 }, rotation: 0, dimensions: { w: 1.7, d: 0.8, h: 0.6 } },
    ]
  }
  return [
    { id: uuid(), type: 'bed-king', position: { x: 0, z: 0.5 }, rotation: 180, dimensions: { w: 2.0, d: 2.1, h: 0.55 } },
    { id: uuid(), type: 'wardrobe', position: { x: 1.2, z: -1.0 }, rotation: 90, dimensions: { w: 1.8, d: 0.6, h: 2.1 } },
  ]
}

export function buildFallbackDesign(profile: UserProfile): DesignSpec {
  const rooms: Room3D[] = [
    { id: uuid(), type: 'living', label: 'Living Room', position: { x: 0, z: 0 }, dimensions: { w: 5.5, d: 5.0 }, color: ROOM_COLORS[0], rotation: 0, windows: [{ wall: 'south', offsetX: 0.5, width: 2.4, height: 1.8, sillHeight: 0.4 }], doors: [{ wall: 'north', offsetX: 0.55, width: 0.9, connectsTo: 'exterior', swingDirection: 'inward' }], furniture: [] },
    { id: uuid(), type: 'kitchen', label: 'Kitchen', position: { x: 4.5, z: 0 }, dimensions: { w: 3.5, d: 4.0 }, color: ROOM_COLORS[1], rotation: 0, windows: [{ wall: 'east', offsetX: 0.5, width: 2.0, height: 1.5, sillHeight: 0.8 }], doors: [{ wall: 'west', offsetX: 0.5, width: 0.9, connectsTo: 'living', swingDirection: 'inward' }], furniture: [] },
    { id: uuid(), type: 'bedroom', label: 'Bedroom', position: { x: 0, z: 5.0 }, dimensions: { w: 4.0, d: 4.5 }, color: ROOM_COLORS[2], rotation: 0, windows: [{ wall: 'north', offsetX: 0.5, width: 1.8, height: 1.4, sillHeight: 0.9 }], doors: [{ wall: 'south', offsetX: 0.5, width: 0.9, connectsTo: 'living', swingDirection: 'inward' }], furniture: [] },
    { id: uuid(), type: 'bathroom', label: 'Bathroom', position: { x: 4.0, z: 4.8 }, dimensions: { w: 2.4, d: 3.0 }, color: ROOM_COLORS[3], rotation: 0, windows: [], doors: [{ wall: 'south', offsetX: 0.5, width: 0.8, connectsTo: 'bedroom', swingDirection: 'inward' }], furniture: [] },
  ]

  rooms.forEach((room) => {
    room.furniture = roomFurniture(room.type as Room3D['type']) as Room3D['furniture']
  })

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
