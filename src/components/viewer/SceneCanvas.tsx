'use client'
import { Suspense, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useViewerStore } from '@/store/viewerStore'
import { useDesignInteraction } from '@/hooks/useDesignInteraction'
import { HouseModel } from './HouseModel'

interface HandlerRefs {
  onPointerMove: (e: MouseEvent) => void
  onPointerUp: () => void
}

function Scene({ handlerRefs }: { handlerRefs: React.MutableRefObject<HandlerRefs> }) {
  const { viewMode } = useViewerStore()
  const isXray = viewMode === 'xray'
  const is2D = viewMode === '2d'

  const { gl, camera } = useThree()
  const { onPointerDown, onPointerMove, onPointerUp } = useDesignInteraction(gl, camera)

  // Sync latest handlers to ref without triggering re-renders
  handlerRefs.current.onPointerMove = onPointerMove
  handlerRefs.current.onPointerUp = onPointerUp

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={isXray ? 0.65 : 0.35} color="#FDF8E2" />
      <directionalLight
        position={[20, 40, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.001}
      />
      <hemisphereLight args={['#C4C3E3', '#A3B565', 0.4]} />

      {/* Floor grid */}
      {!is2D && <gridHelper args={[60, 60, 'rgba(80,78,118,0.08)', 'rgba(80,78,118,0.04)']} position={[0, -0.01, 0]} />}

      {/* Cameras — both always mounted, toggle makeDefault to avoid freeze on switch */}
      <PerspectiveCamera makeDefault={!is2D} position={[22, 18, 22]} fov={45} near={0.1} far={500} />
      <OrthographicCamera makeDefault={is2D} position={[0, 60, 0.01]} zoom={8} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.04}
        maxPolarAngle={is2D ? 0 : Math.PI / 2 - 0.02}
        enableRotate={!is2D}
      />

      <HouseModel
        onRoomPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </>
  )
}

interface Props {
  canvasRootId?: string
}

export function SceneCanvas({ canvasRootId = 'canvas-root' }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const handlerRefs = useRef<HandlerRefs>({
    onPointerMove: () => {},
    onPointerUp: () => {},
  })

  return (
    <div
      id={canvasRootId}
      ref={canvasRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onPointerMove={(e) => handlerRefs.current.onPointerMove(e.nativeEvent)}
      onPointerUp={() => handlerRefs.current.onPointerUp()}
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
        eventSource={typeof document !== 'undefined' ? document.getElementById(canvasRootId) ?? undefined : undefined}
        eventPrefix="client"
      >
        <Suspense fallback={null}>
          <Scene handlerRefs={handlerRefs} />
        </Suspense>
      </Canvas>

      {/* HTML overlay portal */}
      <div id="html-root" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
    </div>
  )
}
