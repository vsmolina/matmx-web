'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'

interface AdminGuardProps {
  children: React.ReactNode
  allowedRoles?: string[] // Optional role restriction
}

export default function AdminGuard({ children, allowedRoles }: AdminGuardProps) {
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    if (!loading) {
      if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        router.replace('/admin-login')
      }
    }
  }, [user, loading, allowedRoles, router])

  if (loading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking admin access...</p>
      </div>
    )
  }

  return <>{children}</>
}
