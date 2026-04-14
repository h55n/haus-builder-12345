'use client'

import dynamic from 'next/dynamic'

const BuilderPageClient = dynamic(() => import('./BuilderPageClient'), {
  ssr: false,
})

export default function BuilderPage() {
  return <BuilderPageClient />
}
