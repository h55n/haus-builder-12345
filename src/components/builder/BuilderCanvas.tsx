'use client'
import { useDroppable } from '@dnd-kit/core'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { useBuilderStore } from '@/store/builderStore'
import { useViewerStore } from '@/store/viewerStore'
import { FurnitureFactory } from '@/components/viewer/FurnitureFactory'
import type { FurnitureItem } from '@/types'

export function BuilderCanvas() {
  const { setNodeRef } = useDroppable({ id: 'canvas-drop-zone' })
  const { items, selectedId, selectItem } = useBuilderStore()

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
          <OrbitControls makeDefault enableDamping dampingFactor={0.04} />

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
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Keyboard hint */}
      {selectedId && (
        <div className="glass-sm" style={{
          position: 'absolute', bottom: 100, left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 14px', borderRadius: 8,
          fontFamily: 'var(--font-space-mono)',
          fontSize: 10, color: 'var(--text-muted)',
          letterSpacing: '0.06em', pointerEvents: 'none',
        }}>
          DELETE — remove · ESC — deselect
        </div>
      )}
    </div>
  )
}

function BuilderItemMesh({ item, selected, onSelect }: {
  item: ReturnType<typeof useBuilderStore.getState>['items'][0]
  selected: boolean
  onSelect: () => void
}) {
  const { removeItem, updateItem } = useBuilderStore()
  const { w, d, h } = item.dimensions

  const isRoom = item.assetType === 'room'

  const furnitureItem: FurnitureItem = useMemo(() => ({
    id: item.id,
    type: item.assetId as any,
    position: { x: 0, z: 0 },
    rotation: item.rotation,
    dimensions: item.dimensions,
  }), [item])

  return (
    <group
      position={[item.position.x, 0, item.position.z]}
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
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
