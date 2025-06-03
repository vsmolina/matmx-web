'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('http://localhost:4000/api/me', {
          credentials: 'include',
        })

        if (!res.ok) {
          router.replace('/admin/login')
        } else {
          setLoading(false)
        }
      } catch (err) {
        router.replace('/admin/login')
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking admin access...</p>
      </div>
    )
  }

  return <>{children}</>
}
