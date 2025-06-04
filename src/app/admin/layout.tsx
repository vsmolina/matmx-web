'use client'

import AdminGuard from '@/components/AdminGuard'
import AdminNavbar from '@/components/AdminNavbar'
import { UserProvider } from '@/context/UserContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AdminGuard allowedRoles={['super_admin', 'inventory_manager', 'accountant', 'sales_rep']}>
        <div className='min-h-screen flex flex-col'>
          <AdminNavbar />
          <main className='flex-1'>{children}</main>
        </div>
      </AdminGuard>
    </UserProvider>
  )
}
