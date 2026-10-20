import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haus Builder — Design your home. Instantly.',
  description: 'AI-powered 3D home designer. No CAD skills needed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}  <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
