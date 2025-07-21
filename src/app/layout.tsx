// src/app/layout.tsx
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'MatMX - Industrial Supply Wholesaler',
  description: 'Serving manufacturers across the El Paso - Juarez region.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black">
        <ErrorBoundary>
          {children}
          <Toaster position="top-center" />
        </ErrorBoundary>
      </body>
    </html>
  )
}
