'use client'

import { UserProvider } from '@/context/UserContext'
import AdminGuard from '@/components/AdminGuard'
import AdminNavbar from '@/components/AdminNavbar'
import ErrorBoundary from '@/components/ErrorBoundary'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  return (
    <UserProvider>
      {isLoginPage ? (
        // Login page - no AdminGuard or navbar
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      ) : (
        // Protected admin pages - with AdminGuard and navbar
        <AdminGuard allowedRoles={['super_admin', 'inventory_manager', 'accountant', 'sales_rep']}>
          <ErrorBoundary>
            <div className='min-h-screen flex flex-col'>
              <AdminNavbar />
              <main className='flex-1'>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
            </div>
          </ErrorBoundary>
        </AdminGuard>
      )}
    </UserProvider>
  )
}
