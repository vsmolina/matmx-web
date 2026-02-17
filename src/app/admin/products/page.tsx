import { Metadata } from 'next'
import InventoryTable from '@/components/InventoryTable'
import AdminGuard from '@/components/AdminGuard'

export const metadata: Metadata = {
  title: 'Inventory Management',
}

export default function ProductsPage() {
  return (
    <AdminGuard allowedRoles={['super_admin', 'inventory_manager', 'sales_rep']}>
      <main className="p-6">
        <InventoryTable />
      </main>
    </AdminGuard>
  )
}
