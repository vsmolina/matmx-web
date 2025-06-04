'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Wrench } from 'lucide-react'
import ProductModal from '@/components/ProductModal'
import AdjustInventoryModal from './AdjustInventoryModal'
import ExportCSVButton from './ExportCSVButton'
import ImportCSVModal from './ImportCSVModal'
import InventoryHistoryDialog from './InventoryHistoryDialog'
import ImportLogDialog from './ImportLogDialog'
import clsx from 'clsx'
import { useUser } from '@/context/UserContext'

interface Product {
  id: number
  name: string
  sku: string
  vendor: string
  stock: number
  reorder_threshold: number
  unit_price: number
  category: string
  notes?: string
}

export default function InventoryTable() {
  const { user, loading } = useUser()
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loadingData, setLoadingData] = useState(true)

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/inventory', {
        credentials: 'include',
      })
      const data = await res.json()
      setProducts(data.products)
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
    const f = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    )
    setFiltered(f)
  }, [search, products])

  if (loading || loadingData) return <div className="p-4">Loading inventory...</div>
  if (!user) return <div className="p-4">Unauthorized</div>

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <Input
          placeholder="Search by name or SKU..."
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
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Reorder Level</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr
                key={product.id}
                className={clsx(
                  'border-t',
                  product.stock < product.reorder_threshold
                    ? 'bg-red-50'
                    : ''
                )}
              >
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.sku}</td>
                <td className="px-4 py-2">{product.vendor}</td>
                <td className="px-4 py-2">{product.stock}</td>
                <td className="px-4 py-2">{product.reorder_threshold}</td>
                <td className="px-4 py-2">{product.category}</td>
                <td className="px-4 py-2 space-x-2">
                  <ProductModal
                    mode="edit"
                    defaultValues={product}
                    onSave={fetchProducts}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    }
                  />
                  <AdjustInventoryModal
                    productId={product.id}
                    currentStock={product.stock}
                    onSave={fetchProducts}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Wrench className="w-4 h-4" />
                      </Button>
                    }
                  />
                  <InventoryHistoryDialog
                    productId={product.id}
                    role={user.role}
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
