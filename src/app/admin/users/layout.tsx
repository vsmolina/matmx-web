'use client'

import AdminGuard from '@/components/AdminGuard'

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard allowedRoles={['super_admin']}>
      {children}
    </AdminGuard>
  )
}
