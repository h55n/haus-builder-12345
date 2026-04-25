import React, { memo } from 'react'
import type { FurnitureItem } from '@/types'
import {
  Bed, Sofa, Desk, DiningSet, KitchenCounter, Bathtub, Toilet, Wardrobe, Bookshelf, Plant, Lamp, Stair,
  Refrigerator, DiningChair, Mirror, TableTop, KitchenTop,
} from './furniture'

interface Props {
  item: FurnitureItem
  floorY: number
  selected?: boolean
  onPointerDown?: (e: any) => void
  onPointerMove?: (e: any) => void
  onPointerUp?: (e: any) => void
  onClick?: (e: any) => void
}

export const FurnitureFactory = memo(function FurnitureFactory({
  item,
  floorY,
  selected = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
}: Props) {
  const { position, rotation } = item

  return (
    <group
      position={[position.x, floorY, position.z]}
      rotation={[0, (rotation * Math.PI) / 180, 0]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onClick}
    >
      <FurniturePiece item={item} />
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[Math.max(item.dimensions.w, item.dimensions.d) * 0.55, Math.max(item.dimensions.w, item.dimensions.d) * 0.62, 24]} />
          <meshBasicMaterial color="#1A56DB" transparent opacity={0.75} />
        </mesh>
      )}
    </group>
  )
})

function FurniturePiece({ item }: { item: FurnitureItem }) {
  switch (item.type) {
    case 'bed-king': return <Bed type="bed-king" />
    case 'bed-single': return <Bed type="bed-single" />
    case 'sofa': return <Sofa />
    case 'desk': return <Desk />
    case 'dining-set': return <DiningSet />
    case 'kitchen-counter': return <KitchenCounter />
    case 'bathtub': return <Bathtub />
    case 'toilet': return <Toilet />
    case 'wardrobe': return <Wardrobe />
    case 'bookshelf': return <Bookshelf />
    case 'plant': return <Plant />
    case 'lamp': return <Lamp />
    case 'stair': return <Stair />
    case 'refrigerator': return <Refrigerator />
    case 'dining-chair': return <DiningChair />
    case 'mirror': return <Mirror />
    case 'table-top': return <TableTop />
    case 'kitchen-top': return <KitchenTop />
    default: return (
      <mesh castShadow>
        <boxGeometry args={[item.dimensions.w, item.dimensions.h, item.dimensions.d]} />
        <meshStandardMaterial color="#C4C3E3" roughness={0.8} />
      </mesh>
    )
  }
}
