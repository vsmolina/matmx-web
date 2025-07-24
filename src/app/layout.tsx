// src/app/layout.tsx
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'MatMX ERP System',
  description: 'Internal Enterprise Resource Planning System',
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
          <Toaster 
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // Default options for all toasts
              duration: 4000,
              style: {
                background: 'white',
                color: '#1f2937',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
                backdropFilter: 'blur(16px)',
                maxWidth: '400px',
              },
              // Success toast styling
              success: {
                style: {
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#10b981',
                },
              },
              // Error toast styling
              error: {
                style: {
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#ef4444',
                },
              },
              // Loading toast styling
              loading: {
                style: {
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#3b82f6',
                },
              },
            }}
          />
        </ErrorBoundary>
      </body>
    </html>
  )
}
