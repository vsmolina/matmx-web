'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboardPage() {
  const [user, setUser] = useState<{ userId: number; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('http://localhost:4000/api/me', {
          credentials: 'include',
        })

        if (!res.ok) throw new Error('Unauthorized')
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        router.replace('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h1>
      <p className="mb-6 text-gray-700">Role: <span className="font-medium">{user?.role}</span></p>

      <div className="grid gap-4">
        {user?.role === 'super_admin' && (
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Manage Users
          </button>
        )}

        <button
          onClick={() => router.push('/admin/products')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          View Products
        </button>
      </div>
    </div>
  )
}