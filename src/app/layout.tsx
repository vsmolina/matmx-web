// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'MatMX - Industrial Supply Wholesaler',
  description: 'Serving manufacturers across the El Paso - Juarez region.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
