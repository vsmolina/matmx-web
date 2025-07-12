'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types/ProductTypes'
import { useUser } from '@/context/UserContext'

export default function InventoryTableViewOnly() {
  type ProductWithQuantity = Product & { quantity: number }

  const { user, loading } = useUser()
  const [products, setProducts] = useState<ProductWithQuantity[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/inventory', {
        credentials: 'include',
      })
      const data = await res.json()
      setProducts(data.products)
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

  if (loading || loadingData) return <div className="p-4">Loading inventory...</div>
  if (!user) return <div className="p-4">Unauthorized</div>

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Current Inventory</h2>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left font-medium text-gray-700">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Category</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id ?? `${product.sku}-${product.name}`} className="border-t">
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.sku}</td>
                <td className="px-4 py-2">{product.vendor}</td>
                <td className="px-4 py-2">{product.quantity}</td>
                <td className="px-4 py-2">{product.category}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr key="empty">
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No products in inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
