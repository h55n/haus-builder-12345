'use client'
import { useEffect } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { Html } from '@react-three/drei'
import { useDesignStore } from '@/store/designStore'
import { useViewerStore } from '@/store/viewerStore'
import { RoomMesh } from './RoomMesh'

interface HouseModelProps {
  onRoomPointerDown: (roomId: string, roomPos: { x: number; z: number }, e: MouseEvent) => void
  onPointerMove: (e: MouseEvent) => void
  onPointerUp: () => void
}

export function HouseModel({ onRoomPointerDown }: HouseModelProps) {
  const design = useDesignStore(s => s.design)
  const rotateRoom = useDesignStore(s => s.rotateRoom)
  const version = design?.version ?? 0
  const { viewMode, materialPreset, selectedId, setSelected } = useViewerStore()

  // R-key rotates the currently selected room by 90°
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'r') return
      if (!selectedId) return
      rotateRoom(selectedId, 90)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, rotateRoom])

  if (!design) return null

  const isExploded = viewMode === 'exploded'
  const isXray = viewMode === 'xray'

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
          floorIndex={fi}
          baseY={floorBaseY[fi]}
          exploded={isExploded}
          explodeOffset={fi * 6.5}
        >
          {floor.rooms.map(room => (
            <RoomMesh
              key={room.id}
              room={room}
              floorY={0}
              selected={selectedId === room.id}
              xray={isXray}
              materialPreset={materialPreset}
              onSelect={() => setSelected(selectedId === room.id ? null : room.id)}
              showLabel={isExploded || isXray}
              onPointerDown={(e: MouseEvent) => onRoomPointerDown(room.id, room.position, e)}
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
  children, floorIndex, baseY, exploded, explodeOffset
}: {
  children: React.ReactNode
  floorIndex: number
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
    new (require('three').Vector3)(0, 0, 0),
    new (require('three').Vector3)(0, height, 0),
  ]
  const geo = new (require('three').BufferGeometry)().setFromPoints(points)
  return geo
}
