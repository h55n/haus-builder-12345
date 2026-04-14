import React, { memo } from 'react'
import type { FurnitureItem } from '@/types'
import { Bed, Sofa, Desk, DiningSet, KitchenCounter, Bathtub, Toilet, Wardrobe, Bookshelf, Plant, Lamp, Stair } from './furniture'

interface Props {
  item: FurnitureItem
  floorY: number
}

export const FurnitureFactory = memo(function FurnitureFactory({ item, floorY }: Props) {
  const { position, rotation } = item

  return (
    <group
      position={[position.x, floorY, position.z]}
      rotation={[0, (rotation * Math.PI) / 180, 0]}
    >
      <FurniturePiece item={item} />
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
    default: return (
      <mesh castShadow>
        <boxGeometry args={[item.dimensions.w, item.dimensions.h, item.dimensions.d]} />
        <meshStandardMaterial color="#C4C3E3" roughness={0.8} />
      </mesh>
    )
  }
}
