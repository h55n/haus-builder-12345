import { v4 as uuid } from 'uuid'
import type { DesignSpec, Room3D, FurnitureItem, Door3D } from '@/types'

// ── Wall-position helpers (relative to room center) ──────────────────
const northZ = (roomD: number, furD: number) => -(roomD / 2) + furD / 2 + 0.04
const southZ = (roomD: number, furD: number) =>  (roomD / 2) - furD / 2 - 0.04
const eastX  = (roomW: number, furW: number) =>  (roomW / 2) - furW / 2 - 0.04
const westX  = (roomW: number, furW: number) => -(roomW / 2) + furW / 2 + 0.04

// ── Furniture factory per room type ──────────────────────────────────
function makeFurniture(room: Room3D): FurnitureItem[] {
  const { w, d } = room.dimensions

  switch (room.type) {
    case 'bedroom':
    case 'master-bedroom':
      return [
        { id: uuid(), type: 'bed-king',  position: { x: 0, z: northZ(d, 2.1) }, rotation: 0, dimensions: { w: 2.0, d: 2.1, h: 0.55 } },
        { id: uuid(), type: 'wardrobe',  position: { x: eastX(w, 0.6), z: 0 },  rotation: 0, dimensions: { w: 1.8, d: 0.6, h: 2.1 } },
        { id: uuid(), type: 'lamp',      position: { x: eastX(w, 0.3), z: northZ(d, 0.3) }, rotation: 0, dimensions: { w: 0.3, d: 0.3, h: 1.6 } },
      ]

    case 'living':
      return [
        { id: uuid(), type: 'sofa',      position: { x: 0, z: southZ(d, 0.9) }, rotation: 180, dimensions: { w: 2.2, d: 0.9, h: 0.85 } },
        { id: uuid(), type: 'bookshelf', position: { x: eastX(w, 0.3), z: 0 },  rotation: 0,   dimensions: { w: 0.9, d: 0.3, h: 1.8 } },
        { id: uuid(), type: 'plant',     position: { x: westX(w, 0.4), z: northZ(d, 0.4) }, rotation: 0, dimensions: { w: 0.4, d: 0.4, h: 1.2 } },
        { id: uuid(), type: 'lamp',      position: { x: eastX(w, 0.3), z: northZ(d, 0.3) }, rotation: 0, dimensions: { w: 0.3, d: 0.3, h: 1.6 } },
      ]

    case 'kitchen': {
      const items: FurnitureItem[] = [
        { id: uuid(), type: 'kitchen-counter', position: { x: 0, z: northZ(d, 0.6) },         rotation: 0, dimensions: { w: 2.5, d: 0.6, h: 0.9 } },
        { id: uuid(), type: 'refrigerator',    position: { x: eastX(w, 0.92), z: northZ(d, 0.74) }, rotation: 0, dimensions: { w: 0.92, d: 0.74, h: 1.95 } },
      ]
      if (d >= 4) {
        items.push({ id: uuid(), type: 'kitchen-counter', position: { x: 0, z: southZ(d, 0.6) }, rotation: 0, dimensions: { w: 2.5, d: 0.6, h: 0.9 } })
      }
      return items
    }

    case 'dining':
      return [
        { id: uuid(), type: 'dining-set', position: { x: 0, z: 0 }, rotation: 0, dimensions: { w: 1.6, d: 1.0, h: 0.75 } },
      ]

    case 'bathroom': {
      const items: FurnitureItem[] = [
        { id: uuid(), type: 'toilet', position: { x: eastX(w, 0.5), z: northZ(d, 0.7) }, rotation: 90, dimensions: { w: 0.5, d: 0.7, h: 0.8 } },
      ]
      if (w >= 2.2 && d >= 2.4) {
        items.push({ id: uuid(), type: 'bathtub', position: { x: 0, z: northZ(d, 0.8) }, rotation: 0, dimensions: { w: 1.7, d: 0.8, h: 0.6 } })
      }
      return items
    }

    case 'office':
      return [
        { id: uuid(), type: 'desk',      position: { x: eastX(w, 0.7), z: 0 },  rotation: 90, dimensions: { w: 1.4, d: 0.7, h: 0.75 } },
        { id: uuid(), type: 'bookshelf', position: { x: westX(w, 0.3), z: 0 },  rotation: 0,  dimensions: { w: 0.9, d: 0.3, h: 1.8 } },
        { id: uuid(), type: 'lamp',      position: { x: eastX(w, 0.3), z: northZ(d, 0.3) }, rotation: 0, dimensions: { w: 0.3, d: 0.3, h: 1.6 } },
      ]

    case 'hallway':
      return [
        { id: uuid(), type: 'plant', position: { x: 0, z: 0 }, rotation: 0, dimensions: { w: 0.4, d: 0.4, h: 1.2 } },
      ]

    case 'staircase':
      return [
        { id: uuid(), type: 'stair', position: { x: 0, z: 0 }, rotation: 0, dimensions: { w: 1.0, d: 3.0, h: 3.0 } },
      ]

    default:
      return []
  }
}

// ── Bounding box ──────────────────────────────────────────────────────
function bb(r: Room3D) {
  return {
    minX: r.position.x - r.dimensions.w / 2,
    maxX: r.position.x + r.dimensions.w / 2,
    minZ: r.position.z - r.dimensions.d / 2,
    maxZ: r.position.z + r.dimensions.d / 2,
  }
}

function overlaps(a: Room3D, b: Room3D): boolean {
  const A = bb(a), B = bb(b)
  return A.minX < B.maxX && A.maxX > B.minX && A.minZ < B.maxZ && A.maxZ > B.minZ
}

// ── Overlap fixer ─────────────────────────────────────────────────────
function fixOverlaps(rooms: Room3D[]): Room3D[] {
  // Sort by area descending; largest rooms are anchors
  const sorted = [...rooms].sort(
    (a, b) => b.dimensions.w * b.dimensions.d - a.dimensions.w * a.dimensions.d
  )

  const placed: Room3D[] = [{ ...sorted[0], position: { ...sorted[0].position } }]

  for (let i = 1; i < sorted.length; i++) {
    const room: Room3D = { ...sorted[i], position: { ...sorted[i].position } }

    // Try pushing east (+x)
    let resolved = false
    for (let iter = 0; iter < 30; iter++) {
      const ov = placed.find(p => overlaps(room, p))
      if (!ov) { resolved = true; break }
      const push = (ov.position.x + ov.dimensions.w / 2) - (room.position.x - room.dimensions.w / 2) + 0.01
      room.position = { ...room.position, x: room.position.x + push }
    }

    if (!resolved) {
      // Reset and try pushing south (+z)
      room.position = { ...sorted[i].position }
      for (let iter = 0; iter < 30; iter++) {
        const ov = placed.find(p => overlaps(room, p))
        if (!ov) break
        const push = (ov.position.z + ov.dimensions.d / 2) - (room.position.z - room.dimensions.d / 2) + 0.01
        room.position = { ...room.position, z: room.position.z + push }
      }
    }

    placed.push(room)
  }

  return placed
}

// ── Door fixer ────────────────────────────────────────────────────────
const TOL = 0.2

function fixDoors(rooms: Room3D[]): Room3D[] {
  const updated = rooms.map(r => ({ ...r, doors: [] as Door3D[] }))

  for (let i = 0; i < updated.length; i++) {
    for (let j = i + 1; j < updated.length; j++) {
      const A = updated[i], B = updated[j]
      const a = bb(A), b = bb(B)

      // A east = B west
      if (Math.abs(a.maxX - b.minX) < TOL && a.minZ < b.maxZ && a.maxZ > b.minZ) {
        updated[i].doors.push({ wall: 'east', offsetX: 0.5, width: 0.9, connectsTo: B.id, swingDirection: 'inward' })
        updated[j].doors.push({ wall: 'west', offsetX: 0.5, width: 0.9, connectsTo: A.id, swingDirection: 'inward' })
        continue
      }

      // B east = A west
      if (Math.abs(b.maxX - a.minX) < TOL && a.minZ < b.maxZ && a.maxZ > b.minZ) {
        updated[j].doors.push({ wall: 'east', offsetX: 0.5, width: 0.9, connectsTo: A.id, swingDirection: 'inward' })
        updated[i].doors.push({ wall: 'west', offsetX: 0.5, width: 0.9, connectsTo: B.id, swingDirection: 'inward' })
        continue
      }

      // A south = B north
      if (Math.abs(a.maxZ - b.minZ) < TOL && a.minX < b.maxX && a.maxX > b.minX) {
        updated[i].doors.push({ wall: 'south', offsetX: 0.5, width: 0.9, connectsTo: B.id, swingDirection: 'inward' })
        updated[j].doors.push({ wall: 'north', offsetX: 0.5, width: 0.9, connectsTo: A.id, swingDirection: 'inward' })
        continue
      }

      // B south = A north
      if (Math.abs(b.maxZ - a.minZ) < TOL && a.minX < b.maxX && a.maxX > b.minX) {
        updated[j].doors.push({ wall: 'south', offsetX: 0.5, width: 0.9, connectsTo: A.id, swingDirection: 'inward' })
        updated[i].doors.push({ wall: 'north', offsetX: 0.5, width: 0.9, connectsTo: B.id, swingDirection: 'inward' })
      }
    }
  }

  // Ensure every room has at least one door
  for (const room of updated) {
    if (room.doors.length === 0) {
      room.doors.push({ wall: 'north', offsetX: 0.5, width: 0.9, connectsTo: 'exterior', swingDirection: 'inward' })
    }
  }

  return updated
}

// ── Main export ───────────────────────────────────────────────────────
export function planLayout(design: DesignSpec): DesignSpec {
  const floors = design.floors.map(floor => {
    let rooms = fixOverlaps(floor.rooms)
    rooms = rooms.map(room => ({ ...room, furniture: makeFurniture(room) }))
    rooms = fixDoors(rooms)
    return { ...floor, rooms }
  })
  return { ...design, floors }
}
