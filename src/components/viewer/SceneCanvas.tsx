'use client'
import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useViewerStore } from '@/store/viewerStore'
import { HouseModel } from './HouseModel'

function SceneReadyNotifier() {
  const { setSceneRendered } = useViewerStore()
  const { gl } = useThree()

  useEffect(() => {
    let frameId: number
    let frames = 0
    // Wait for a few frames to ensure shaders are compiled and geometry is rendered
    const checkReady = () => {
      if (frames > 3) {
        setSceneRendered(true)
      } else {
        frames++
        frameId = requestAnimationFrame(checkReady)
      }
    }
    frameId = requestAnimationFrame(checkReady)

    return () => {
      cancelAnimationFrame(frameId)
      setSceneRendered(false)
    }
  }, [setSceneRendered, gl])

  return null
}

function Scene() {
  const { viewMode } = useViewerStore()
  const isXray = viewMode === 'xray'
  const is2D = viewMode === '2d'

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

      {/* Camera */}
      {is2D ? (
        <OrthographicCamera makeDefault position={[0, 60, 0.01]} zoom={8} />
      ) : (
        <PerspectiveCamera makeDefault position={[22, 18, 22]} fov={45} near={0.1} far={500} />
      )}

      <OrbitControls
        makeDefault
        enableDamping={!is2D}
        dampingFactor={0.04}
        minPolarAngle={is2D ? 0 : 0}
        maxPolarAngle={is2D ? 0 : Math.PI / 2 - 0.02}
        enableRotate={!is2D}
        enablePan
      />

      <HouseModel />
      <SceneReadyNotifier />
    </>
  )
}

interface Props {
  canvasRootId?: string
}

export function SceneCanvas({ canvasRootId = 'canvas-root' }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const { viewMode } = useViewerStore()
  const is2D = viewMode === '2d'

  return (
    <div
      id={canvasRootId}
      ref={canvasRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Canvas
        shadows={is2D ? false : 'soft'}
        dpr={is2D ? 1 : [1, 1.5]}
        frameloop={is2D ? 'demand' : 'always'}
        gl={{
          antialias: !is2D,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        style={{ background: 'var(--viewer-bg)' }}
        eventSource={typeof document !== 'undefined' ? document.getElementById(canvasRootId) ?? undefined : undefined}
        eventPrefix="client"
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* HTML overlay portal */}
      <div id="html-root" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
    </div>
  )
}
