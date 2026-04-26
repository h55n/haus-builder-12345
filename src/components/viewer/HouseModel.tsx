'use client'
import { useRef } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { Html } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useDesignStore } from '@/store/designStore'
import { useViewerStore } from '@/store/viewerStore'
import { RoomMesh } from './RoomMesh'
import { rebuildDoorsForRooms } from '@/lib/layoutPlanner'
import type { Room3D } from '@/types'

const PRIMARY_BUTTON = 1
const SNAP = 0.5

function snap(v: number) {
  return Math.round(v / SNAP) * SNAP
}

export function HouseModel() {
  const design = useDesignStore((s) => s.design)
  const setDesign = useDesignStore((s) => s.setDesign)
  const version = design?.version ?? 0
  const { viewMode, materialPreset, selectedId, selectedType, setSelected, snapEnabled } = useViewerStore()
  const dragState = useRef<{
    kind: 'room' | 'furniture'
    floorLevel: number
    roomId: string
    furnitureId?: string
    offsetX: number
    offsetZ: number
  } | null>(null)

  const isExploded = viewMode === 'exploded'
  const isXray = viewMode === 'xray'
  const is2D = viewMode === '2d'

  if (!design) return null

  const updateFloorRooms = (floorLevel: number, updater: (rooms: Room3D[]) => Room3D[]) => {
    const updated = {
      ...design,
      version: design.version + 1,
      floors: design.floors.map((floor) => floor.level === floorLevel ? { ...floor, rooms: updater(floor.rooms) } : floor),
    }
    setDesign(updated)
  }

  const startRoomDrag = (event: ThreeEvent<PointerEvent>, floorLevel: number, roomId: string, roomPos: { x: number; z: number }) => {
    if ((event.buttons & PRIMARY_BUTTON) === 0) return
    event.stopPropagation()
    setSelected(roomId, 'room')
    dragState.current = {
      kind: 'room',
      floorLevel,
      roomId,
      offsetX: event.point.x - roomPos.x,
      offsetZ: event.point.z - roomPos.z,
    }
  }

  const startFurnitureDrag = (event: ThreeEvent<PointerEvent>, floorLevel: number, roomId: string, furnitureId: string) => {
    if ((event.buttons & PRIMARY_BUTTON) === 0) return
    event.stopPropagation()
    const room = design.floors.find((floor) => floor.level === floorLevel)?.rooms.find((entry) => entry.id === roomId)
    const furniture = room?.furniture.find((entry) => entry.id === furnitureId)
    if (!room || !furniture) return
    const worldX = room.position.x + furniture.position.x
    const worldZ = room.position.z + furniture.position.z
    setSelected(furnitureId, 'furniture')
    dragState.current = {
      kind: 'furniture',
      floorLevel,
      roomId,
      furnitureId,
      offsetX: event.point.x - worldX,
      offsetZ: event.point.z - worldZ,
    }
  }

  const moveDragged = (event: ThreeEvent<PointerEvent>) => {
    if (!dragState.current || (event.buttons & PRIMARY_BUTTON) === 0) return
    event.stopPropagation()
    const targetX = snapEnabled ? snap(event.point.x - dragState.current.offsetX) : event.point.x - dragState.current.offsetX
    const targetZ = snapEnabled ? snap(event.point.z - dragState.current.offsetZ) : event.point.z - dragState.current.offsetZ

    if (dragState.current.kind === 'room') {
      updateFloorRooms(dragState.current.floorLevel, (rooms) => {
        const moved = rooms.map((room) => room.id === dragState.current?.roomId ? { ...room, position: { x: targetX, z: targetZ } } : room)
        return rebuildDoorsForRooms(moved)
      })
      return
    }

    updateFloorRooms(dragState.current.floorLevel, (rooms) => rooms.map((room) => {
      if (room.id !== dragState.current?.roomId) return room
      return {
        ...room,
        furniture: room.furniture.map((item) => {
          if (item.id !== dragState.current?.furnitureId) return item
          const relX = targetX - room.position.x
          const relZ = targetZ - room.position.z
          const maxX = room.dimensions.w / 2 - item.dimensions.w / 2 - 0.1
          const maxZ = room.dimensions.d / 2 - item.dimensions.d / 2 - 0.1
          return {
            ...item,
            position: {
              x: Math.max(-maxX, Math.min(maxX, relX)),
              z: Math.max(-maxZ, Math.min(maxZ, relZ)),
            },
          }
        }),
      }
    }))
  }

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (dragState.current) {
      event.stopPropagation()
      dragState.current = null
    }
  }

  // Compute cumulative floor Y positions
  const floorBaseY: number[] = []
  let acc = 0
  for (const fl of design.floors) {
    floorBaseY.push(acc)
    acc += fl.height
  }

  return (
    <group key={`house-v${version}`}>
      {design.floors.map((floor, fi) => (
        <FloorGroup
          key={floor.level}
          baseY={floorBaseY[fi]}
          exploded={isExploded}
          explodeOffset={fi * 6.5}
        >
          {floor.rooms.map((room) => (
            <RoomMesh
              key={room.id}
              room={room}
              floorY={0}
              roomHeight={is2D ? 0.12 : floor.height}
              selected={selectedId === room.id && selectedType === 'room'}
              selectedFurnitureId={selectedType === 'furniture' ? selectedId : null}
              xray={isXray}
              materialPreset={materialPreset}
              onSelect={() => setSelected(selectedId === room.id && selectedType === 'room' ? null : room.id, 'room')}
              onRoomPointerDown={(e, activeRoom) => startRoomDrag(e, floor.level, activeRoom.id, activeRoom.position)}
              onRoomPointerMove={moveDragged}
              onRoomPointerUp={endDrag}
              onFurnitureSelect={(_, furnitureId) => setSelected(furnitureId, 'furniture')}
              onFurniturePointerDown={(e, activeRoom, furnitureId) => startFurnitureDrag(e, floor.level, activeRoom.id, furnitureId)}
              onFurniturePointerMove={moveDragged}
              onFurniturePointerUp={endDrag}
              showFurniture={!is2D}
              showLabel={isExploded || isXray || is2D}
            />
          ))}

          {/* Floor label in exploded mode */}
          {isExploded && (
            <Html position={[-20, 2, 0]} distanceFactor={20}>
              <div style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: 12, letterSpacing: '0.12em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                animation: 'fadeSlideIn 400ms ease both',
                animationDelay: `${fi * 120}ms`,
              }}>
                <div>FLOOR {floor.level}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {floor.rooms.length} ROOMS
                </div>
              </div>
            </Html>
          )}
        </FloorGroup>
      ))}

      {/* Dashed corner lines in exploded mode */}
      {isExploded && <ExplodeLines floors={design.floors.length} />}
    </group>
  )
}

function FloorGroup({
  children, baseY, exploded, explodeOffset
}: {
  children: React.ReactNode
  baseY: number
  exploded: boolean
  explodeOffset: number
}) {
  const { y } = useSpring({
    y: baseY + (exploded ? explodeOffset : 0),
    config: { tension: 50, friction: 18 },
  })

  return (
    <animated.group position-y={y}>
      {children}
    </animated.group>
  )
}

function ExplodeLines({ floors }: { floors: number }) {
  return (
    <group>
      {Array.from({ length: 4 }).map((_, i) => {
        const x = i < 2 ? -12 : 12
        const z = i % 2 === 0 ? -12 : 12
        return (
          <lineSegments key={i} position={[x, 0, z]}>
            <bufferGeometry attach="geometry" {...createDashedLine(floors * 8)} />
            <lineDashedMaterial
              color="#1A56DB"
              dashSize={0.18}
              gapSize={0.12}
              transparent
              opacity={0.7}
            />
          </lineSegments>
        )
      })}
    </group>
  )
}

function createDashedLine(height: number) {
  const points = [
    new THREE.Vector3(),
    new THREE.Vector3(0, height, 0),
  ]
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  return geo
}
