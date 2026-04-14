import { memo, useMemo } from 'react'
import * as THREE from 'three'
import type { Window3D, Door3D } from '@/types'

// ─── Window ───────────────────────────────────────────────────────────
interface WindowProps {
  win: Window3D
  roomW: number
  roomD: number
  roomH: number
}

export const WindowMesh = memo(function WindowMesh({ win, roomW, roomD, roomH }: WindowProps) {
  const geo = useMemo(() => new THREE.BoxGeometry(win.width, win.height, 0.06), [win.width, win.height])

  const pos = useMemo((): [number, number, number] => {
    const y = win.sillHeight + win.height / 2
    switch (win.wall) {
      case 'north': return [(win.offsetX - 0.5) * roomW, y, -roomD / 2]
      case 'south': return [(win.offsetX - 0.5) * roomW, y, roomD / 2]
      case 'east':  return [roomW / 2, y, (win.offsetX - 0.5) * roomD]
      case 'west':  return [-roomW / 2, y, (win.offsetX - 0.5) * roomD]
    }
  }, [win, roomW, roomD])

  const rot = useMemo((): [number, number, number] => {
    return win.wall === 'east' || win.wall === 'west' ? [0, Math.PI / 2, 0] : [0, 0, 0]
  }, [win.wall])

  return (
    <mesh geometry={geo} position={pos} rotation={rot}>
      <meshStandardMaterial color="#C4E8FF" transparent opacity={0.45} roughness={0.1} metalness={0.05} />
    </mesh>
  )
})

// ─── Door ─────────────────────────────────────────────────────────────
interface DoorProps {
  door: Door3D
  roomW: number
  roomD: number
  roomH: number
}

export const DoorMesh = memo(function DoorMesh({ door, roomW, roomD, roomH }: DoorProps) {
  const geo = useMemo(() => new THREE.BoxGeometry(door.width, roomH * 0.8, 0.05), [door.width, roomH])

  const pos = useMemo((): [number, number, number] => {
    const y = (roomH * 0.8) / 2
    switch (door.wall) {
      case 'north': return [(door.offsetX - 0.5) * roomW, y, -roomD / 2]
      case 'south': return [(door.offsetX - 0.5) * roomW, y, roomD / 2]
      case 'east':  return [roomW / 2, y, (door.offsetX - 0.5) * roomD]
      case 'west':  return [-roomW / 2, y, (door.offsetX - 0.5) * roomD]
    }
  }, [door, roomW, roomD, roomH])

  const rot = useMemo((): [number, number, number] => {
    return door.wall === 'east' || door.wall === 'west' ? [0, Math.PI / 2, 0] : [0, 0, 0]
  }, [door.wall])

  return (
    <mesh geometry={geo} position={pos} rotation={rot}>
      <meshStandardMaterial color="#1A1828" transparent opacity={0.6} roughness={0.4} />
    </mesh>
  )
})
