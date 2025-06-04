import { Metadata } from 'next'
import InventoryTable from '@/components/InventoryTable'
import AdminGuard from '@/components/AdminGuard'

export const metadata: Metadata = {
  title: 'Inventory Management',
}

export default function ProductsPage() {
  return (
    <AdminGuard allowedRoles={['super_admin', 'inventory_manager']}>
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Inventory Management</h1>
        <InventoryTable />
      </main>
    </AdminGuard>
  )
}
