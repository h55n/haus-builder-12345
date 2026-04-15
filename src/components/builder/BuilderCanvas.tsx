'use client'
import { useDroppable } from '@dnd-kit/core'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import { Suspense, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useBuilderStore } from '@/store/builderStore'
import { useViewerStore } from '@/store/viewerStore'
import { FurnitureFactory } from '@/components/viewer/FurnitureFactory'
import type { FurnitureItem } from '@/types'

const PRIMARY_BUTTON = 1

export function BuilderCanvas() {
  const { setNodeRef } = useDroppable({ id: 'canvas-drop-zone' })
  const { items, selectedId, selectItem, updateItem } = useBuilderStore()
  const { snapEnabled } = useViewerStore()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const snap = (v: number) => (snapEnabled ? Math.round(v * 2) / 2 : v)

  const handleDragStart = (id: string) => {
    selectItem(id)
    setDraggingId(id)
  }

  const handleDragMove = (x: number, z: number) => {
    if (!draggingId) return
    updateItem(draggingId, { position: { x: snap(x), z: snap(z) } })
  }

  const handleDragEnd = () => {
    setDraggingId(null)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ flex: 1, height: '100vh', position: 'relative' }}
    >
      <Canvas
        shadows="soft"
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        style={{ background: 'var(--viewer-bg)' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} color="#FDF8E2" />
          <directionalLight position={[20, 40, 15]} intensity={1.1} castShadow
            shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.001} />
          <hemisphereLight args={['#C4C3E3', '#A3B565', 0.35]} />

          <PerspectiveCamera makeDefault position={[22, 18, 22]} fov={45} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.04} enabled={!draggingId} />

          <gridHelper args={[60, 60, 'rgba(80,78,118,0.08)', 'rgba(80,78,118,0.04)']} position={[0, -0.01, 0]} />

          {/* Floor plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial color="#EDE8D0" roughness={0.9} />
          </mesh>

          {/* Placed items */}
          {items.map(item => (
            <BuilderItemMesh
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onSelect={() => selectItem(item.id === selectedId ? null : item.id)}
              onDragStart={() => handleDragStart(item.id)}
              onDragMove={(x, z) => handleDragMove(x, z)}
              onDragEnd={handleDragEnd}
            />
          ))}

          {draggingId && (
            <DragPlane
              onMove={(x, z) => handleDragMove(x, z)}
              onEnd={handleDragEnd}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Contextual hint */}
      {selectedId && (
        <div className="glass-sm" style={{
          position: 'absolute', bottom: 100, left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 14px', borderRadius: 8,
          fontFamily: 'var(--font-space-mono)',
          fontSize: 10, color: 'var(--text-muted)',
          letterSpacing: '0.06em', pointerEvents: 'none',
        }}>
          {draggingId ? 'MOVING — release to place' : 'DRAG TO MOVE · [ / ] OR R ROTATE · DELETE remove · ESC deselect'}
        </div>
      )}
    </div>
  )
}

function BuilderItemMesh({ item, selected, onSelect, onDragStart, onDragMove, onDragEnd }: {
  item: ReturnType<typeof useBuilderStore.getState>['items'][0]
  selected: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (x: number, z: number) => void
  onDragEnd: () => void
}) {
  const dragMoved = useRef(false)
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const dragPoint = useMemo(() => new THREE.Vector3(), [])
  const { w, d, h } = item.dimensions

  const isRoom = item.assetType === 'room'

  const furnitureItem: FurnitureItem = useMemo(() => ({
    id: item.id,
    type: item.assetId as any,
    position: { x: 0, z: 0 },
    rotation: item.rotation,
    dimensions: item.dimensions,
  }), [item])

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    dragMoved.current = false
    onDragStart()
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    // `buttons` is a bitmask; `& PRIMARY_BUTTON` checks that the primary button (left mouse / touch) is active.
    if ((e.buttons & PRIMARY_BUTTON) === 0) return
    e.stopPropagation()
    dragMoved.current = true
    if (e.ray.intersectPlane(groundPlane, dragPoint)) {
      onDragMove(dragPoint.x, dragPoint.z)
    }
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!dragMoved.current) onSelect()
    dragMoved.current = false
    onDragEnd()
  }

  return (
    <group
      position={[item.position.x, 0, item.position.z]}
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {isRoom ? (
        // Render room as colored box
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h * 0.04, d]} />
          <meshStandardMaterial
            color={item.color}
            roughness={0.85}
            emissive={selected ? new THREE.Color('#1A56DB') : new THREE.Color(0)}
            emissiveIntensity={selected ? 0.15 : 0}
          />
        </mesh>
      ) : (
        // Render furniture primitive
        <FurnitureFactory item={furnitureItem} floorY={0} />
      )}

      {/* Selection ring */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.6, Math.max(w, d) * 0.65, 32]} />
          <meshBasicMaterial color="#1A56DB" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  )
}

function DragPlane({ onMove, onEnd }: { onMove: (x: number, z: number) => void; onEnd: () => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.005, 0]}
      onPointerMove={(e) => {
        e.stopPropagation()
        onMove(e.point.x, e.point.z)
      }}
      onPointerUp={(e) => {
        e.stopPropagation()
        onEnd()
      }}
    >
      <planeGeometry args={[300, 300]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}
