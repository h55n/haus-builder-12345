'use client'
import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useBuilderStore } from '@/store/builderStore'
import { v4 as uuid } from 'uuid'
import type { BuilderItem } from '@/types'

const PALETTE = ['#C4C3E3','#504E76','#FDF8E2','#A3B565','#FCDD9D','#F1642E','#B8B4D0','#E8E4C8']

const CATEGORIES = {
  ROOMS: [
    { id: 'bedroom',    label: 'Bedroom',     w: 4.0, d: 4.5 },
    { id: 'living',     label: 'Living Room', w: 5.5, d: 6.0 },
    { id: 'kitchen',    label: 'Kitchen',     w: 3.5, d: 4.0 },
    { id: 'bathroom',   label: 'Bathroom',    w: 2.4, d: 3.0 },
    { id: 'office',     label: 'Office',      w: 3.0, d: 3.5 },
    { id: 'dining',     label: 'Dining Room', w: 3.5, d: 4.0 },
    { id: 'hallway',    label: 'Hallway',     w: 1.5, d: 4.0 },
    { id: 'garage',     label: 'Garage',      w: 5.5, d: 6.0 },
  ],
  FURNITURE: [
    { id: 'bed-king',        label: 'King Bed',       w: 2.0, d: 2.1, h: 0.55 },
    { id: 'bed-single',      label: 'Single Bed',     w: 1.0, d: 2.0, h: 0.55 },
    { id: 'sofa',            label: 'Sofa',           w: 2.2, d: 0.9, h: 0.85 },
    { id: 'desk',            label: 'Desk',           w: 1.4, d: 0.7, h: 0.75 },
    { id: 'dining-set',      label: 'Dining Set',     w: 1.6, d: 1.0, h: 0.75 },
    { id: 'kitchen-counter', label: 'Kitchen Counter',w: 2.5, d: 0.6, h: 0.9  },
    { id: 'bathtub',         label: 'Bathtub',        w: 1.7, d: 0.8, h: 0.6  },
    { id: 'toilet',          label: 'Toilet',         w: 0.5, d: 0.7, h: 0.8  },
    { id: 'wardrobe',        label: 'Wardrobe',       w: 1.8, d: 0.6, h: 2.1  },
    { id: 'bookshelf',       label: 'Bookshelf',      w: 0.9, d: 0.3, h: 1.8  },
    { id: 'plant',           label: 'Plant',          w: 0.4, d: 0.4, h: 1.2  },
    { id: 'lamp',            label: 'Floor Lamp',     w: 0.3, d: 0.3, h: 1.6  },
    { id: 'stair',           label: 'Staircase',      w: 1.0, d: 3.0, h: 3.0  },
  ],
  WALLS: [
    { id: 'wall-short',  label: 'Wall 2m',  w: 2.0, d: 0.12, h: 2.8 },
    { id: 'wall-medium', label: 'Wall 4m',  w: 4.0, d: 0.12, h: 2.8 },
    { id: 'wall-long',   label: 'Wall 6m',  w: 6.0, d: 0.12, h: 2.8 },
  ],
  OPENINGS: [
    { id: 'door-single', label: 'Door',       w: 0.9, d: 0.08, h: 2.2 },
    { id: 'door-double', label: 'Dbl Door',   w: 1.6, d: 0.08, h: 2.2 },
    { id: 'win-small',   label: 'Window S',   w: 0.9, d: 0.08, h: 1.2 },
    { id: 'win-large',   label: 'Window L',   w: 1.6, d: 0.08, h: 1.4 },
  ],
} as const

type Category = keyof typeof CATEGORIES

export function BuilderSidebar() {
  const [activeCategory, setActiveCategory] = useState<Category>('ROOMS')
  const [typeInput, setTypeInput] = useState('')
  const { addItem, items } = useBuilderStore()

  const handleTypeAdd = () => {
    const query = typeInput.toLowerCase().trim()
    if (!query) return
    // Search all categories
    for (const [cat, assets] of Object.entries(CATEGORIES)) {
      for (const asset of assets) {
        if (asset.label.toLowerCase().includes(query) || asset.id.includes(query)) {
          const assetType = cat === 'ROOMS' ? 'room' : cat === 'FURNITURE' ? 'furniture' : 'wall'
          addItem({
            assetType,
            assetId: asset.id,
            label: asset.label,
            position: { x: 0, z: 0 },
            rotation: 0,
            scale: 1,
            dimensions: { w: asset.w, d: asset.d, h: (asset as any).h ?? 2.8 },
          })
          setTypeInput('')
          return
        }
      }
    }
  }

  return (
    <div style={{
      width: 220,
      height: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px' }}>
        <p style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: 10, letterSpacing: '0.14em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Asset Library
        </p>

        {/* Type to add */}
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={typeInput}
            onChange={e => setTypeInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTypeAdd()}
            placeholder="Type to add…"
            style={{
              flex: 1, padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: 12, outline: 'none',
            }}
          />
          <button
            onClick={handleTypeAdd}
            style={{
              padding: '8px 10px', borderRadius: 8,
              border: 'none', background: 'var(--accent)',
              color: '#fff', cursor: 'pointer', fontSize: 13,
            }}
          >+</button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 2, padding: '0 12px', flexWrap: 'wrap' }}>
        {(Object.keys(CATEGORIES) as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '4px 8px', borderRadius: 6,
              border: 'none', cursor: 'pointer',
              background: activeCategory === cat ? 'var(--accent-soft)' : 'transparent',
              color: activeCategory === cat ? 'var(--accent)' : 'var(--text-muted)',
              fontFamily: 'var(--font-space-mono)',
              fontSize: 9, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'all 150ms',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Asset cards */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '12px',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {(CATEGORIES[activeCategory] as readonly { id: string; label: string; w: number; d: number; h?: number }[]).map(asset => (
          <DraggableAsset
            key={asset.id}
            asset={asset}
            category={activeCategory}
          />
        ))}
      </div>

      {/* Item count */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-space-mono)',
        fontSize: 10, color: 'var(--text-muted)',
        letterSpacing: '0.06em',
      }}>
        {items.length} ITEMS PLACED
      </div>
    </div>
  )
}

function DraggableAsset({ asset, category }: {
  asset: { id: string; label: string; w: number; d: number; h?: number }
  category: Category
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `asset-${asset.id}`,
    data: { asset, category },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        padding: '9px 12px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: isDragging ? 'var(--accent-soft)' : 'var(--surface-2)',
        color: 'var(--text-primary)',
        cursor: 'grab',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        transition: 'background 150ms, border-color 150ms',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.background = 'var(--accent-soft)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background = 'var(--surface-2)'
      }}
    >
      <span style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 13 }}>
        {asset.label}
      </span>
      <span style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: 9, color: 'var(--text-muted)',
      }}>
        {asset.w}×{asset.d}
      </span>
    </div>
  )
}
