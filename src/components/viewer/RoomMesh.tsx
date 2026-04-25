import { memo, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import type { Room3D, MaterialPreset, FurnitureItem } from '@/types'
import { WindowMesh, DoorMesh } from './WindowDoorMesh'
import { FurnitureFactory } from './FurnitureFactory'
import { useDesignStore } from '@/store/designStore'
import { useViewerStore } from '@/store/viewerStore'

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
  selected: boolean
  xray: boolean
  materialPreset: MaterialPreset
  onSelect: () => void
  showLabel: boolean
  onPointerDown?: (e: MouseEvent) => void
}

export const RoomMesh = memo(function RoomMesh({
  room, floorY, selected, xray, materialPreset, onSelect, showLabel, onPointerDown
}: Props) {
  const { dimensions: { w, d }, position, color } = room
  const h = 2.8 // default ceiling height, overridden by floor.height in parent

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
      onPointerDown={(e) => { e.stopPropagation(); onPointerDown?.(e.nativeEvent) }}
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
      {room.furniture.map(item => (
        <FurnitureDraggable
          key={item.id}
          item={item}
          roomId={room.id}
          roomDims={room.dimensions}
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
}, (prev, next) =>
  prev.room.id === next.room.id &&
  prev.room.color === next.room.color &&
  prev.selected === next.selected &&
  prev.xray === next.xray &&
  prev.materialPreset === next.materialPreset &&
  prev.floorY === next.floorY &&
  prev.showLabel === next.showLabel &&
  prev.room.position.x === next.room.position.x &&
  prev.room.position.z === next.room.position.z &&
  prev.room.furniture === next.room.furniture
)

function FurnitureDraggable({ item, roomId, roomDims }: {
  item: FurnitureItem
  roomId: string
  roomDims: { w: number; d: number }
}) {
  const { moveFurniture, rotateFurniture } = useDesignStore()
  const { snapEnabled } = useViewerStore()
  const isDragging = useRef(false)
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const dragPoint = useRef(new THREE.Vector3())
  const dragOffset = useRef({ x: 0, z: 0 })
  const snap = (v: number) => snapEnabled ? Math.round(v / 0.5) * 0.5 : v
  const clamp = (v: number, half: number, objHalf: number) =>
    Math.max(-(half - objHalf - 0.04), Math.min(half - objHalf - 0.04, v))

  return (
    <group
      position={[item.position.x, 0, item.position.z]}
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onPointerDown={(e) => {
        e.stopPropagation()
        isDragging.current = false
        if (e.ray.intersectPlane(groundPlane, dragPoint.current)) {
          dragOffset.current = { x: dragPoint.current.x - item.position.x, z: dragPoint.current.z - item.position.z }
        }
      }}
      onPointerMove={(e) => {
        if ((e.buttons & 1) === 0) return
        e.stopPropagation()
        isDragging.current = true
        if (e.ray.intersectPlane(groundPlane, dragPoint.current)) {
          const nx = clamp(snap(dragPoint.current.x - dragOffset.current.x), roomDims.w / 2, item.dimensions.w / 2)
          const nz = clamp(snap(dragPoint.current.z - dragOffset.current.z), roomDims.d / 2, item.dimensions.d / 2)
          moveFurniture(roomId, item.id, nx, nz)
        }
      }}
      onPointerUp={(e) => {
        e.stopPropagation()
        if (!isDragging.current) {
          rotateFurniture(roomId, item.id, 90)
        }
        isDragging.current = false
      }}
    >
      <FurnitureFactory item={{ ...item, position: { x: 0, z: 0 }, rotation: 0 }} floorY={0} />
    </group>
  )
}
