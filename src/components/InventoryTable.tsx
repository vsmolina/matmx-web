'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Wrench } from 'lucide-react'
import ProductModal from '@/components/ProductModal'
import ExportCSVButton from './ExportCSVButton'
import ImportCSVModal from './ImportCSVModal'
import InventoryHistoryDialog from './InventoryHistoryDialog'
import ImportLogDialog from './ImportLogDialog'
import clsx from 'clsx'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import ProductDetailsModal from './ProductDetailsModal'
import AdjustInventoryModal from '@/components/AdjustInventoryModal'

interface ProductVendorStock {
  product_id: number
  name: string
  sku: string
  vendor: string
  vendor_id: number
  quantity: number
  reorder_threshold: number
  category: string
}

export default function InventoryTable() {
  const { user, loading } = useUser()
  const [rows, setRows] = useState<ProductVendorStock[]>([])
  const [filtered, setFiltered] = useState<ProductVendorStock[]>([])
  const [search, setSearch] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const router = useRouter();
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/inventory', {
        credentials: 'include',
      })
      const data = await res.json()
      setRows(data.products)
      setFiltered(data.products)
    } catch (err) {
      console.error('Error fetching inventory:', err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchProducts()
    }
  }, [loading, user])

  useEffect(() => {
    const q = search.toLowerCase()
    const f = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q)
    )
    setFiltered(f)
  }, [search, rows])

  if (loading || loadingData) return <div className="p-4">Loading inventory...</div>
  if (!user) return <div className="p-4">Unauthorized</div>

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <Input
          placeholder="Search by name, SKU, or vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <div className="flex items-center gap-2">
          <ProductModal
            mode="add"
            onSave={fetchProducts}
            trigger={<Button>Add Product</Button>}
          />
          <ExportCSVButton />
          <ImportCSVModal onSuccess={fetchProducts} />
          {user?.role === 'super_admin' && <ImportLogDialog />}
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left font-medium text-gray-700">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Reorder Level</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={`${row.product_id}-${row.vendor_id}`}
                className={clsx(
                  'border-t',
                  row.quantity < row.reorder_threshold ? 'bg-red-50' : ''
                )}
              >
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.sku}</td>
                <td className="px-4 py-2">{row.vendor}</td>
                <td className="px-4 py-2">{row.quantity}</td>
                <td className="px-4 py-2">{row.reorder_threshold}</td>
                <td className="px-4 py-2">{row.category}</td>
                <td className="px-4 py-2 space-x-2">
                  <AdjustInventoryModal
                    productId={row.product_id}
                    vendorId={row.vendor_id}
                    vendorName={row.vendor}
                    currentStock={row.quantity}
                    onSave={() => {
                      fetchProducts()
                      setHistoryRefreshKey(prev => prev + 1)
                    }}
                    trigger={<Button variant="outline" size="sm">Adjust</Button>}
                  />
                  <ProductDetailsModal
                    productId={row.product_id}
                    trigger={<Button size="sm" variant="outline">Details</Button>}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/products/${row.product_id}`)}
                  >
                    Profile
                  </Button>
                  <InventoryHistoryDialog
                    productId={row.product_id}
                    role={user.role}
                    refreshKey={historyRefreshKey}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No matching products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
