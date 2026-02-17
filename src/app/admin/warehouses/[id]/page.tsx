import { Metadata } from 'next'
import WarehouseProfile from '@/components/WarehouseProfile'
import AdminGuard from '@/components/AdminGuard'

export const metadata: Metadata = {
  title: 'Warehouse Profile',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WarehouseProfilePage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <AdminGuard allowedRoles={['super_admin', 'inventory_manager']}>
      <main className="p-6">
        <WarehouseProfile warehouseId={id} />
      </main>
    </AdminGuard>
  )
}