import { useMemo } from 'react'
import * as THREE from 'three'

function Box({ w, h, d, color, y = 0, x = 0, z = 0 }: { w: number; h: number; d: number; color: string; y?: number; x?: number; z?: number }) {
  const geo = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d])
  return (
    <mesh geometry={geo} position={[x, y + h / 2, z]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.05} />
    </mesh>
  )
}

function Cyl({ r, h, color, y = 0, x = 0, z = 0 }: { r: number; h: number; color: string; y?: number; x?: number; z?: number }) {
  const geo = useMemo(() => new THREE.CylinderGeometry(r, r, h, 12), [r, h])
  return (
    <mesh geometry={geo} position={[x, y + h / 2, z]} castShadow>
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}

export function Bed({ type }: { type: 'bed-king' | 'bed-single' }) {
  const w = type === 'bed-king' ? 2.0 : 1.0
  return (
    <group>
      <Box w={w} h={0.25} d={2.1} color="#D4C9A8" />
      <Box w={w} h={0.18} d={1.9} color="#EDE8D0" y={0.25} />
      <Box w={w} h={0.5} d={0.12} color="#504E76" y={0} z={-0.95} />
      <Box w={0.45} h={0.1} d={0.45} color="#FDF8E2" y={0.43} x={w * 0.28} z={0.7} />
      {type === 'bed-king' && <Box w={0.45} h={0.1} d={0.45} color="#FDF8E2" y={0.43} x={-w * 0.28} z={0.7} />}
    </group>
  )
}

export function Sofa() {
  return (
    <group>
      <Box w={2.2} h={0.35} d={0.9} color="#C4C3E3" />
      <Box w={2.2} h={0.5} d={0.12} color="#504E76" y={0} z={-0.39} />
      <Box w={0.12} h={0.55} d={0.9} color="#504E76" y={0} x={1.04} />
      <Box w={0.12} h={0.55} d={0.9} color="#504E76" y={0} x={-1.04} />
      <Box w={1.0} h={0.12} d={0.7} color="#B8B4D0" y={0.35} x={0.5} />
      <Box w={1.0} h={0.12} d={0.7} color="#B8B4D0" y={0.35} x={-0.5} />
    </group>
  )
}

export function Desk() {
  return (
    <group>
      <Box w={1.4} h={0.04} d={0.7} color="#C4914A" y={0.71} />
      {[[-0.62, 0.27], [0.62, 0.27], [-0.62, -0.27], [0.62, -0.27]].map(([x, z], i) => (
        <Cyl key={i} r={0.025} h={0.73} color="#8B6914" x={x} z={z} />
      ))}
      <Box w={0.5} h={0.35} d={0.04} color="#1A1828" y={0.77} x={0.3} z={-0.24} />
      <Cyl r={0.03} h={0.12} color="#504E76" x={0.3} z={-0.24} y={0.75} />
    </group>
  )
}

export function DiningSet() {
  return (
    <group>
      <Box w={1.6} h={0.04} d={1.0} color="#C4914A" y={0.72} />
      {[[-0.7, 0.4], [0.7, 0.4], [-0.7, -0.4], [0.7, -0.4]].map(([x, z], i) => (
        <Cyl key={i} r={0.03} h={0.72} color="#8B6914" x={x} z={z} />
      ))}
      {[[-0.7, 0.6], [0.7, 0.6], [-0.7, -0.6], [0.7, -0.6]].map(([x, z], i) => (
        <group key={`chair${i}`}>
          <Box w={0.42} h={0.04} d={0.42} color="#D4C9A8" y={0.44} x={x} z={z} />
          <Box w={0.42} h={0.38} d={0.04} color="#B8B4D0" y={0.06} x={x} z={z + (z > 0 ? 0.19 : -0.19)} />
        </group>
      ))}
    </group>
  )
}

export function KitchenCounter() {
  return (
    <group>
      <Box w={2.5} h={0.9} d={0.6} color="#E8E4C8" />
      <Box w={2.5} h={0.04} d={0.62} color="#D4C9A8" y={0.88} />
      <Box w={2.5} h={0.6} d={0.32} color="#FDF8E2" y={1.2} z={-0.14} />
      <Cyl r={0.18} h={0.06} color="#504E76" y={0.9} x={0.6} z={0.1} />
    </group>
  )
}

export function Bathtub() {
  return (
    <group>
      <Box w={1.7} h={0.6} d={0.8} color="#F5F0D8" />
      <Box w={1.5} h={0.5} d={0.6} color="#EDE8D0" y={0.08} />
      <Cyl r={0.03} h={0.15} color="#C4C3E3" y={0.6} x={0.7} />
    </group>
  )
}

export function Toilet() {
  return (
    <group>
      <Cyl r={0.2} h={0.42} color="#F5F0D8" />
      <Box w={0.36} h={0.52} d={0.22} color="#EDE8D0" z={-0.32} />
    </group>
  )
}

export function Wardrobe() {
  return (
    <group>
      <Box w={1.8} h={2.1} d={0.6} color="#D4C9A8" />
      <Box w={0.87} h={2.0} d={0.02} color="#C4C3E3" x={-0.45} y={0.04} z={0.3} />
      <Box w={0.87} h={2.0} d={0.02} color="#C4C3E3" x={0.45} y={0.04} z={0.3} />
      <Cyl r={0.025} h={0.1} color="#504E76" x={-0.04} z={0.32} y={1.05} />
      <Cyl r={0.025} h={0.1} color="#504E76" x={0.86} z={0.32} y={1.05} />
    </group>
  )
}

export function Bookshelf() {
  const bookColors = ['#F1642E', '#1A56DB', '#A3B565', '#FCDD9D', '#504E76', '#C4C3E3', '#F1642E', '#A3B565']
  return (
    <group>
      <Box w={0.9} h={1.8} d={0.3} color="#C4914A" />
      {[0, 1, 2, 3].map(i => (
        <Box key={i} w={0.86} h={0.03} d={0.28} color="#8B6914" y={i * 0.42 + 0.18} />
      ))}
      {bookColors.map((c, i) => (
        <Box key={`b${i}`} w={0.06 + Math.random() * 0.04} h={0.28 + Math.random() * 0.08} d={0.22}
          color={c} y={Math.floor(i / 4) * 0.42 + 0.22} x={-0.36 + (i % 4) * 0.19} />
      ))}
    </group>
  )
}

export function Plant() {
  return (
    <group>
      <Cyl r={0.14} h={0.28} color="#504E76" />
      <Cyl r={0.06} h={0.85} color="#8B6914" y={0.25} />
      {[[-0.18, 0.2], [0.18, 0.2], [0, 0.35]].map(([x, y], i) => (
        <mesh key={i} position={[x, 0.25 + y, 0]} castShadow>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#A3B565" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function Lamp() {
  return (
    <group>
      <Cyl r={0.1} h={0.08} color="#504E76" />
      <Cyl r={0.025} h={1.4} color="#C4C3E3" y={0.06} />
      <mesh position={[0, 1.52, 0]} castShadow>
        <coneGeometry args={[0.22, 0.3, 12]} />
        <meshStandardMaterial color="#FCDD9D" roughness={0.6} emissive="#FCDD9D" emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

export function Stair() {
  return (
    <group>
      {Array.from({ length: 9 }).map((_, i) => (
        <Box key={i} w={1.0} h={0.18} d={0.28}
          color={i % 2 === 0 ? '#D4C9A8' : '#C4914A'}
          y={i * 0.18} z={-i * 0.28 + 1.12} />
      ))}
      <Cyl r={0.025} h={1.8} color="#504E76" x={0.47} y={0} z={0} />
      <Cyl r={0.025} h={1.8} color="#504E76" x={-0.47} y={0} z={0} />
    </group>
  )
}

export function Refrigerator() {
  return (
    <group>
      <Box w={0.92} h={1.95} d={0.74} color="#EDE8D0" />
      <Box w={0.88} h={0.03} d={0.02} color="#C4C3E3" y={0.95} z={0.37} />
      <Cyl r={0.015} h={0.2} color="#504E76" x={0.38} y={1.35} z={0.37} />
      <Cyl r={0.015} h={0.2} color="#504E76" x={0.38} y={0.45} z={0.37} />
    </group>
  )
}

export function DiningChair() {
  return (
    <group>
      <Box w={0.48} h={0.05} d={0.48} color="#D4C9A8" y={0.43} />
      <Box w={0.48} h={0.45} d={0.05} color="#B8B4D0" y={0.45} z={-0.22} />
      {[[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].map(([x, z], i) => (
        <Cyl key={i} r={0.02} h={0.45} color="#8B6914" x={x} z={z} />
      ))}
    </group>
  )
}

export function Mirror() {
  return (
    <group>
      <Box w={0.8} h={1.6} d={0.04} color="#E8E4C8" />
      <Box w={0.72} h={1.5} d={0.01} color="#C4C3E3" z={0.02} />
    </group>
  )
}

export function TableTop() {
  return (
    <group>
      <Box w={1.8} h={0.06} d={0.9} color="#C4914A" y={0.72} />
      {[[-0.82, 0.37], [0.82, 0.37], [-0.82, -0.37], [0.82, -0.37]].map(([x, z], i) => (
        <Cyl key={i} r={0.03} h={0.72} color="#8B6914" x={x} z={z} />
      ))}
    </group>
  )
}

export function KitchenTop() {
  return (
    <group>
      <Box w={2.0} h={0.06} d={0.65} color="#D4C9A8" y={0.9} />
      <Box w={1.9} h={0.9} d={0.6} color="#E8E4C8" />
      <Cyl r={0.16} h={0.05} color="#504E76" y={0.93} x={0.45} z={0.1} />
      <Box w={0.5} h={0.02} d={0.3} color="#C4C3E3" y={0.93} x={-0.45} z={0.05} />
    </group>
  )
}
