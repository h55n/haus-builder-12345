import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import type { Room3D, MaterialPreset } from '@/types'
import { WindowMesh, DoorMesh } from './WindowDoorMesh'
import { FurnitureFactory } from './FurnitureFactory'

const MATERIAL_TINT: Record<MaterialPreset, string> = {
  concrete: '#B8B8B8',
  timber:   '#C4914A',
  brick:    '#B85C42',
}

const MATERIAL_ROUGHNESS: Record<MaterialPreset, number> = {
  concrete: 0.88,
  timber:   0.72,
  brick:    0.94,
}

interface Props {
  room: Room3D
  floorY: number
  roomHeight: number
  selected: boolean
  selectedFurnitureId?: string | null
  xray: boolean
  materialPreset: MaterialPreset
  onSelect: () => void
  onRoomPointerDown?: (e: ThreeEvent<PointerEvent>, room: Room3D) => void
  onRoomPointerMove?: (e: ThreeEvent<PointerEvent>, room: Room3D) => void
  onRoomPointerUp?: (e: ThreeEvent<PointerEvent>, room: Room3D) => void
  onFurnitureSelect?: (roomId: string, furnitureId: string) => void
  onFurniturePointerDown?: (e: ThreeEvent<PointerEvent>, room: Room3D, furnitureId: string) => void
  onFurniturePointerMove?: (e: ThreeEvent<PointerEvent>, room: Room3D, furnitureId: string) => void
  onFurniturePointerUp?: (e: ThreeEvent<PointerEvent>, room: Room3D, furnitureId: string) => void
  showFurniture?: boolean
  showLabel: boolean
}

export const RoomMesh = memo(function RoomMesh({
  room,
  floorY,
  roomHeight,
  selected,
  selectedFurnitureId,
  xray,
  materialPreset,
  onSelect,
  onRoomPointerDown,
  onRoomPointerMove,
  onRoomPointerUp,
  onFurnitureSelect,
  onFurniturePointerDown,
  onFurniturePointerMove,
  onFurniturePointerUp,
  showFurniture = true,
  showLabel,
}: Props) {
  const { dimensions: { w, d }, position, color } = room
  const h = roomHeight

  const floorGeo   = useMemo(() => new THREE.PlaneGeometry(w, d), [w, d])
  const ceilGeo    = useMemo(() => new THREE.PlaneGeometry(w, d), [w, d])
  const wallNGeo   = useMemo(() => new THREE.BoxGeometry(w + 0.08, h, 0.08), [w, h])
  const wallSGeo   = useMemo(() => new THREE.BoxGeometry(w + 0.08, h, 0.08), [w, h])
  const wallEGeo   = useMemo(() => new THREE.BoxGeometry(0.08, h, d), [h, d])
  const wallWGeo   = useMemo(() => new THREE.BoxGeometry(0.08, h, d), [h, d])

  const tint = MATERIAL_TINT[materialPreset]
  const roughness = MATERIAL_ROUGHNESS[materialPreset]

  // Blend room color with material tint
  const blendedColor = useMemo(() => {
    const rc = new THREE.Color(color)
    const mc = new THREE.Color(tint)
    rc.lerp(mc, 0.28)
    return rc
  }, [color, tint])

  const emissiveIntensity = selected ? 0.18 : 0

  return (
    <group
      position={[position.x, floorY, position.z]}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      onPointerDown={(e) => onRoomPointerDown?.(e, room)}
      onPointerMove={(e) => onRoomPointerMove?.(e, room)}
      onPointerUp={(e) => onRoomPointerUp?.(e, room)}
    >
      {/* Floor */}
      <mesh geometry={floorGeo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color={blendedColor} roughness={roughness} metalness={0.02}
          emissive={selected ? new THREE.Color('#1A56DB') : new THREE.Color(0)}
          emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>

      {/* Ceiling */}
      <mesh geometry={ceilGeo} rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <meshStandardMaterial color={blendedColor} roughness={roughness}
          transparent opacity={xray ? 0 : 0.18} side={THREE.BackSide} />
      </mesh>

      {/* Walls */}
      {[
        { geo: wallNGeo, pos: [0, h / 2, -d / 2] as [number,number,number] },
        { geo: wallSGeo, pos: [0, h / 2,  d / 2] as [number,number,number] },
        { geo: wallEGeo, pos: [ w / 2, h / 2, 0] as [number,number,number] },
        { geo: wallWGeo, pos: [-w / 2, h / 2, 0] as [number,number,number] },
      ].map(({ geo, pos }, i) => (
        <mesh key={i} geometry={geo} position={pos} castShadow receiveShadow>
          <meshStandardMaterial
            color={blendedColor}
            roughness={roughness}
            metalness={0.02}
            transparent={xray}
            opacity={xray ? 0.2 : 1}
            emissive={selected ? new THREE.Color('#1A56DB') : new THREE.Color(0)}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
      ))}

      {/* Windows */}
      {room.windows.map((win, i) => (
        <WindowMesh key={i} win={win} roomW={w} roomD={d} roomH={h} />
      ))}

      {/* Doors */}
      {room.doors.map((door, i) => (
        <DoorMesh key={i} door={door} roomW={w} roomD={d} roomH={h} />
      ))}

      {/* Furniture */}
      {showFurniture && room.furniture.map(item => (
        <FurnitureFactory
          key={item.id}
          item={item}
          floorY={0}
          selected={selectedFurnitureId === item.id}
          onClick={(e) => {
            e.stopPropagation()
            onFurnitureSelect?.(room.id, item.id)
          }}
          onPointerDown={(e) => onFurniturePointerDown?.(e as ThreeEvent<PointerEvent>, room, item.id)}
          onPointerMove={(e) => onFurniturePointerMove?.(e as ThreeEvent<PointerEvent>, room, item.id)}
          onPointerUp={(e) => onFurniturePointerUp?.(e as ThreeEvent<PointerEvent>, room, item.id)}
        />
      ))}

      {/* Label */}
      {showLabel && (
        <Html position={[0, h + 0.3, 0]} center distanceFactor={14}>
          <div style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: 10, letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(8px)',
            padding: '3px 8px',
            borderRadius: 4,
            border: '1px solid var(--glass-border)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            textTransform: 'uppercase',
          }}>
            {room.label}
          </div>
        </Html>
      )}
    </group>
  )
})
