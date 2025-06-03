'use client'

import AdminGuard from '@/components/AdminGuard'
import AdminNavbar from '@/components/AdminNavbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className='min-h-screen flex flex-col'>
        <AdminNavbar />
        <main className='flex-1'>{children}</main>
      </div>
    </AdminGuard>
  )
}
