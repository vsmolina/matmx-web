import { Metadata } from 'next'
import AnodizingTable from '@/components/AnodizingTable'
import AdminGuard from '@/components/AdminGuard'

export const metadata: Metadata = {
  title: 'Anodizing Services',
  description: 'Manage anodizing jobs and services'
}

export default function AnodizingPage() {
  return (
    <AdminGuard allowedRoles={['super_admin', 'inventory_manager', 'sales_rep']}>
      <main className="p-6">
        <AnodizingTable />
      </main>
    </AdminGuard>
  )
}