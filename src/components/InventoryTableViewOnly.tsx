'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types/ProductTypes'
import { useUser } from '@/context/UserContext'
import { Input } from '@/components/ui/input'
import clsx from 'clsx'

interface InventoryTableViewOnlyProps {
  searchTerm?: string
  onSearchChange?: (value: string) => void
}

export default function InventoryTableViewOnly({ searchTerm = '', onSearchChange }: InventoryTableViewOnlyProps) {
  type ProductWithQuantity = Product & { quantity: number }

  const { user, loading } = useUser()
  const [products, setProducts] = useState<ProductWithQuantity[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithQuantity[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/inventory', {
        credentials: 'include',
      })
      const data = await res.json()
      console.log('Inventory API response:', data)
      
      // Handle different possible response structures
      let productData = []
      if (data.products) {
        productData = data.products
      } else if (Array.isArray(data)) {
        productData = data
      } else {
        console.error('Unexpected API response structure:', data)
        productData = []
      }
      
      setProducts(productData)
      setFilteredProducts(productData)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setProducts([])
      setFilteredProducts([])
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
    if (!products || products.length === 0) {
      setFilteredProducts([])
      return
    }
    
    const q = searchTerm.toLowerCase()
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  if (loading || loadingData) return <div className="p-4">Loading inventory...</div>
  if (!user) return <div className="p-4">Unauthorized</div>

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Current Inventory</h2>
      
      {/* Mobile Search Bar */}
      {onSearchChange && (
        <div className="relative w-full group sm:hidden mb-4">
          <Input
            placeholder=""
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-4"
          />
          {!searchTerm && (
            <div 
              className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground overflow-hidden whitespace-nowrap"
              style={{
                width: 'calc(100% - 2rem)'
              }}
            >
              <span className="group-hover:animate-slide-text-hover">
                Search inventory by name, SKU, vendor, or category...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.product_id ?? `${product.sku}-${product.vendor}-${product.name}`}
              className={clsx(
                'bg-white border rounded-lg p-4 shadow-sm',
                product.quantity && product.reorder_threshold && product.quantity < product.reorder_threshold 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-gray-200'
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                </div>
                {product.quantity && product.reorder_threshold && product.quantity < product.reorder_threshold && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                    Low Stock
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Vendor:</span>
                  <p className="font-medium">{product.vendor}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium">{product.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <p className="font-medium">{product.quantity}</p>
                </div>
                {product.reorder_threshold && (
                  <div>
                    <span className="text-gray-500">Reorder Level:</span>
                    <p className="font-medium">{product.reorder_threshold}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No matching products found.' : 'No products in inventory.'}
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto border rounded-lg">
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
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr 
                  key={product.product_id ?? `${product.sku}-${product.vendor}-${product.name}`} 
                  className={clsx(
                    'border-t',
                    product.quantity && product.reorder_threshold && product.quantity < product.reorder_threshold 
                      ? 'bg-red-50' 
                      : ''
                  )}
                >
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.sku}</td>
                  <td className="px-4 py-2">{product.vendor}</td>
                  <td className="px-4 py-2">{product.quantity}</td>
                  <td className="px-4 py-2">{product.category}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  {searchTerm ? 'No matching products found.' : 'No products in inventory.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
