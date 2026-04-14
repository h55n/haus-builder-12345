'use client'

import dynamic from 'next/dynamic'

const ViewerPageClient = dynamic(() => import('./ViewerPageClient'), {
  ssr: false,
})

export default function ViewerPage() {
  return <ViewerPageClient />
}
