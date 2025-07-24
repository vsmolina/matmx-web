'use client'

import { useEffect, useState } from 'react'

interface LowStockProduct {
  id: number
  name: string
  sku: string | null
  category: string
  currentStock: number
  reorderThreshold: number
}

export default function LowStockProductsTable() {
  const [products, setProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:4000/api/dashboard/low-stock-products?threshold=10&limit=10', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => {
        setProducts(json.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading low stock products:', err)
        setProducts([])
        setLoading(false)
      })
  }, [])

  const getStockStatus = (current: number, threshold: number) => {
    if (!threshold || threshold === 0) return 'text-gray-600'
    const percentage = (current / threshold) * 100
    if (percentage === 0) return 'text-red-600 font-semibold'
    if (percentage <= 50) return 'text-orange-600 font-medium'
    return 'text-yellow-600'
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Low Stock Products</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-600 border-b">
            <tr>
              <th className="pb-2">Product</th>
              <th className="pb-2">SKU</th>
              <th className="pb-2">Category</th>
              <th className="pb-2 text-center">Stock</th>
              <th className="pb-2 text-center">Threshold</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">Loading...</td>
              </tr>
            ) : products.length ? (
              products.map((product) => (
                <tr key={product.id} className="border-b last:border-none hover:bg-gray-50">
                  <td className="py-2 font-medium">{product.name || 'Unnamed Product'}</td>
                  <td className="py-2 text-gray-600">{product.sku || '-'}</td>
                  <td className="py-2 text-gray-600">{product.category || 'Uncategorized'}</td>
                  <td className={`py-2 text-center ${getStockStatus(product.currentStock, product.reorderThreshold)}`}>
                    {product.currentStock}
                  </td>
                  <td className="py-2 text-center text-gray-600">{product.reorderThreshold}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">No low stock products</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}