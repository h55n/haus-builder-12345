'use client'
import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { useViewerStore } from '@/store/viewerStore'
import { useDesignStore } from '@/store/designStore'
import type { DesignSpec } from '@/types'

const SNAP = 0.5

function snapVal(v: number) {
  return Math.round(v / SNAP) * SNAP
}

export function useDesignInteraction(gl: THREE.WebGLRenderer | null, camera: THREE.Camera | null) {
  const { selectedId, setSelected, snapEnabled } = useViewerStore()
  const { design, setDesign } = useDesignStore()
  const dragOffset = useRef<{ x: number; z: number } | null>(null)
  const isDragging = useRef(false)

  const getFloorIntersect = useCallback((event: MouseEvent): THREE.Vector3 | null => {
    if (!gl || !camera) return null
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
    const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const target = new THREE.Vector3()
    raycaster.ray.intersectPlane(floor, target)
    return target
  }, [gl, camera])

  const onPointerDown = useCallback((roomId: string, roomPos: { x: number; z: number }, event: MouseEvent) => {
    isDragging.current = false
    setSelected(roomId)
    const pt = getFloorIntersect(event)
    if (pt) {
      dragOffset.current = { x: pt.x - roomPos.x, z: pt.z - roomPos.z }
    }
  }, [setSelected, getFloorIntersect])

  const onPointerMove = useCallback((event: MouseEvent) => {
    if (!selectedId || !dragOffset.current || !design) return
    isDragging.current = true
    const pt = getFloorIntersect(event)
    if (!pt) return
    let nx = pt.x - dragOffset.current.x
    let nz = pt.z - dragOffset.current.z
    if (snapEnabled) { nx = snapVal(nx); nz = snapVal(nz) }

    const updated: DesignSpec = {
      ...design,
      version: design.version + 1,
      floors: design.floors.map(f => ({
        ...f,
        rooms: f.rooms.map(r =>
          r.id === selectedId ? { ...r, position: { x: nx, z: nz } } : r
        ),
      })),
    }
    setDesign(updated)
  }, [selectedId, design, dragOffset, getFloorIntersect, snapEnabled, setDesign])

  const onPointerUp = useCallback(() => {
    dragOffset.current = null
    if (!isDragging.current) return
    isDragging.current = false
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp, selectedId }
}
