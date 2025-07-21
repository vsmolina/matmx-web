'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, Settings, Info } from 'lucide-react'
import ProductModal from '@/components/ProductModal'
import ExportCSVButton from './ExportCSVButton'
import ImportCSVModal from './ImportCSVModal'
import InventoryHistoryDialog from './InventoryHistoryDialog'
import ImportLogDialog from './ImportLogDialog'
import clsx from 'clsx'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import AdjustInventoryModal from '@/components/AdjustInventoryModal'
import ProductDetailsButton from './ProductDetailsButton'

// Simple tooltip component with delay
function Tooltip({ children, content, delay = 500 }: { 
  children: React.ReactNode
  content: string 
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}

interface ProductVendorStock {
  product_id: number
  name: string
  sku: string
  vendor: string
  vendor_id: number
  quantity: number
  reorder_threshold: number
  category: string
  vendor_price: number
  selling_price: number
}

type ViewMode = 'separate' | 'merged'

interface MergedProduct {
  product_id: number
  name: string
  sku: string
  vendor: string
  vendors: Array<{
    vendor_id: number
    vendor_name: string
    quantity: number
    vendor_price: number
  }>
  quantity: number
  reorder_threshold: number
  category: string
  selling_price: number
}

export default function InventoryTable() {
  const { user, loading } = useUser()
  const [rows, setRows] = useState<ProductVendorStock[]>([])
  const [filtered, setFiltered] = useState<ProductVendorStock[]>([])
  const [mergedProducts, setMergedProducts] = useState<MergedProduct[]>([])
  const [search, setSearch] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('separate')
  const router = useRouter()
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: 'vendors' | 'prices' | null
  }>({})

  const toggleDropdown = (productSku: string, type: 'vendors' | 'prices') => {
    setOpenDropdowns(prev => ({
      ...prev,
      [productSku]: prev[productSku] === type ? null : type
    }))
  }

  const closeDropdown = (productSku: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [productSku]: null
    }))
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/inventory', {
        credentials: 'include',
      })
      const data = await res.json()
      console.log('Inventory API response:', data)
      
      // Handle different possible response structures
      let products = []
      if (data.products) {
        products = data.products
      } else if (Array.isArray(data)) {
        products = data
      } else {
        console.error('Unexpected API response structure:', data)
      }
      
      setRows(products)
      setFiltered(products)
      
      // Create merged products
      const merged = createMergedProducts(products)
      setMergedProducts(merged)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setRows([])
      setFiltered([])
      setMergedProducts([])
    } finally {
      setLoadingData(false)
    }
  }

  const createMergedProducts = (products: ProductVendorStock[]): MergedProduct[] => {
    const productMap = new Map<string, MergedProduct>()
    
    products.forEach(product => {
      if (!productMap.has(product.sku)) {
        productMap.set(product.sku, {
          product_id: product.product_id,
          name: product.name,
          sku: product.sku,
          vendor: product.vendor,
          vendors: [],
          quantity: 0,
          reorder_threshold: product.reorder_threshold,
          category: product.category,
          selling_price: product.selling_price
        })
      }
      
      const mergedProduct = productMap.get(product.sku)!
      mergedProduct.vendors.push({
        vendor_id: product.vendor_id,
        vendor_name: product.vendor,
        quantity: product.quantity,
        vendor_price: product.vendor_price
      })
      mergedProduct.quantity += product.quantity
    })
    
    // Update vendor display for merged products
    productMap.forEach(product => {
      if (product.vendors.length > 1) {
        product.vendor = 'Multiple Vendors'
      }
    })
    
    return Array.from(productMap.values())
  }

  useEffect(() => {
    if (!loading && user) {
      fetchProducts()
    }
  }, [loading, user])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setOpenDropdowns({})
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    if (viewMode === 'separate') {
      if (!rows || rows.length === 0) {
        setFiltered([])
        return
      }
      
      const q = search.toLowerCase()
      const f = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q)
      )
      setFiltered(f)
    }
  }, [search, rows, viewMode])

  const getFilteredMergedProducts = () => {
    if (!mergedProducts || mergedProducts.length === 0) return []
    
    const q = search.toLowerCase()
    return mergedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.vendors.some(v => v.vendor_name.toLowerCase().includes(q))
    )
  }

  if (loading || loadingData) return <div className="p-4">Loading inventory...</div>
  if (!user) return <div className="p-4">Unauthorized</div>

  return (
    <div className="p-4">
      {/* Mobile Header */}
      <div className="mb-6 space-y-4 md:hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <Input
            placeholder="Search by name, SKU, or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/80 border-blue-200 focus:border-blue-400"
          />
        </div>
        
        <div className="flex justify-center">
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <label className="text-sm font-semibold text-gray-700">View Mode:</label>
            <div className="bg-gray-200 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('separate')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'separate'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Separate
              </button>
              <button
                onClick={() => setViewMode('merged')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'merged'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Merged
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <ProductModal
            mode="add"
            onSave={fetchProducts}
            trigger={
              <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                Add Product
              </Button>
            }
          />
          <ExportCSVButton />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <ImportCSVModal onSuccess={fetchProducts} />
          {user?.role === 'super_admin' && <ImportLogDialog />}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="mb-6 hidden md:block">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h1>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search by name, SKU, or vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 bg-white/80 border-blue-200 focus:border-blue-400"
              />
              <div className="flex items-center gap-3 bg-white/60 border border-blue-200 rounded-lg px-3 py-2">
                <label className="text-sm font-medium text-gray-700">View:</label>
                <div className="bg-gray-100 rounded-md p-0.5 flex">
                  <button
                    onClick={() => setViewMode('separate')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                      viewMode === 'separate'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                        : 'bg-transparent text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    Separate
                  </button>
                  <button
                    onClick={() => setViewMode('merged')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                      viewMode === 'merged'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                        : 'bg-transparent text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    Merged
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProductModal
                mode="add"
                onSave={fetchProducts}
                trigger={
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                    Add Product
                  </Button>
                }
              />
              <ExportCSVButton />
              <ImportCSVModal onSuccess={fetchProducts} />
              {user?.role === 'super_admin' && <ImportLogDialog />}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {viewMode === 'separate' ? (
          filtered && filtered.length > 0 ? filtered.map((row) => (
            <div
              key={`${row.product_id}-${row.vendor_id}`}
              className={clsx(
                'group border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200',
                row.quantity < row.reorder_threshold 
                  ? 'bg-gradient-to-br from-red-50 to-rose-50/50 border-red-300 ring-1 ring-red-200' 
                  : 'bg-gradient-to-br from-white to-gray-50/30 border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{row.name}</h3>
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-mono">
                      {row.sku}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <InventoryHistoryDialog
                    productId={row.product_id}
                    role={user.role}
                    refreshKey={historyRefreshKey}
                  />
                  {row.quantity < row.reorder_threshold && (
                    <div className="bg-red-100 border border-red-200 text-red-800 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                      Low Stock
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/60 border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-xs text-gray-600 font-medium">Vendor</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{row.vendor}</span>
                </div>
                
                <div className="bg-white/60 border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-xs text-gray-600 font-medium">Category</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{row.category}</span>
                </div>
                
                <div className={clsx(
                  "border rounded-lg p-3",
                  row.quantity < row.reorder_threshold 
                    ? "bg-red-50/50 border-red-200" 
                    : "bg-green-50/50 border-green-200"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className={clsx(
                      "h-4 w-4",
                      row.quantity < row.reorder_threshold ? "text-red-500" : "text-green-500"
                    )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className={clsx(
                      "text-xs font-medium",
                      row.quantity < row.reorder_threshold ? "text-red-700" : "text-green-700"
                    )}>Stock</span>
                  </div>
                  <span className={clsx(
                    "text-lg font-bold",
                    row.quantity < row.reorder_threshold ? "text-red-700" : "text-green-700"
                  )}>{row.quantity}</span>
                </div>
                
                <div className="bg-white/60 border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-xs text-gray-600 font-medium">Reorder</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{row.reorder_threshold}</span>
                </div>
                
                <div className="bg-green-50/50 border border-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-xs text-green-700 font-medium">Selling Price</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {row.selling_price ? `$${Number(row.selling_price).toFixed(2)}` : '—'}
                  </span>
                </div>
                
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-xs text-blue-700 font-medium">Vendor Price</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {row.vendor_price ? `$${Number(row.vendor_price).toFixed(2)}` : '—'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2">
                  <AdjustInventoryModal
                    productId={row.product_id}
                    vendorId={row.vendor_id}
                    vendorName={row.vendor}
                    currentStock={row.quantity}
                    onSave={() => {
                      fetchProducts()
                      setHistoryRefreshKey(prev => prev + 1)
                    }}
                    trigger={
                      <Tooltip content="Adjust Inventory" delay={750}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-10 w-10 bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out p-0"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    }
                  />
                  <ProductDetailsButton
                    productId={row.product_id}
                    initialData={{
                      name: row.name,
                      sku: row.sku,
                      vendor_id: row.vendor_id,
                      reorder_threshold: row.reorder_threshold,
                      category: row.category,
                      quantity: row.quantity
                    }}
                    onSave={fetchProducts}
                    trigger={
                      <Tooltip content="Product Details" delay={750}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-10 w-10 bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out p-0"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    }
                  />
                  <Tooltip content="View Profile" delay={750}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/products/${row.product_id}`)}
                      className="h-10 w-10 bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out p-0"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="font-medium">No Products Found</p>
              <p className="text-sm">No matching products found for your search.</p>
            </div>
          )
        ) : (
          getFilteredMergedProducts().length > 0 ? getFilteredMergedProducts().map((row) => (
            <div
              key={row.product_id}
              className={clsx(
                'group border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200',
                row.quantity < row.reorder_threshold 
                  ? 'bg-gradient-to-br from-red-50 to-rose-50/50 border-red-300 ring-1 ring-red-200' 
                  : 'bg-gradient-to-br from-white to-gray-50/30 border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{row.name}</h3>
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-mono">
                      {row.sku}
                    </span>
                    {row.vendors.length > 1 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        Multi-Vendor
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <InventoryHistoryDialog
                    productId={row.product_id}
                    role={user.role}
                    refreshKey={historyRefreshKey}
                  />
                  {row.quantity < row.reorder_threshold && (
                    <div className="bg-red-100 border border-red-200 text-red-800 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                      Low Stock
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-xs text-blue-700 font-medium">Vendors</span>
                  </div>
                  {row.vendors.length > 1 ? (
                    <div className="space-y-2">
                      {row.vendors.map((vendor) => (
                        <div key={vendor.vendor_id} className="bg-white/60 border border-blue-200 p-2 rounded text-xs">
                          <div className="font-medium text-gray-900">{vendor.vendor_name}</div>
                          <div className="text-gray-600">Stock: {vendor.quantity}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-blue-900">{row.vendor}</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-xs text-gray-600 font-medium">Category</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{row.category}</span>
                  </div>
                  
                  <div className={clsx(
                    "border rounded-lg p-3",
                    row.quantity < row.reorder_threshold 
                      ? "bg-red-50/50 border-red-200" 
                      : "bg-green-50/50 border-green-200"
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className={clsx(
                        "h-4 w-4",
                        row.quantity < row.reorder_threshold ? "text-red-500" : "text-green-500"
                      )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className={clsx(
                        "text-xs font-medium",
                        row.quantity < row.reorder_threshold ? "text-red-700" : "text-green-700"
                      )}>Total Stock</span>
                    </div>
                    <span className={clsx(
                      "text-lg font-bold",
                      row.quantity < row.reorder_threshold ? "text-red-700" : "text-green-700"
                    )}>{row.quantity}</span>
                  </div>
                </div>
                
                <div className="bg-green-50/50 border border-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-xs text-green-700 font-medium">Selling Price</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {row.selling_price ? `$${Number(row.selling_price).toFixed(2)}` : '—'}
                  </span>
                </div>
                
                <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-xs text-amber-700 font-medium">Vendor Prices</span>
                  </div>
                  {row.vendors.length > 1 ? (
                    <div className="space-y-1">
                      {row.vendors.map((vendor) => (
                        <div key={vendor.vendor_id} className="bg-white/60 border border-amber-200 p-2 rounded text-xs flex justify-between">
                          <span className="font-medium text-gray-900">{vendor.vendor_name}</span>
                          <span className="text-amber-800 font-semibold">
                            {vendor.vendor_price ? `$${Number(vendor.vendor_price).toFixed(2)}` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-amber-700">
                      {row.vendors[0]?.vendor_price ? `$${Number(row.vendors[0].vendor_price).toFixed(2)}` : '—'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/products/${row.product_id}`)}
                    className="flex-1 h-12 bg-white border-2 border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="font-medium">No Products Found</p>
              <p className="text-sm">No matching products found for your search.</p>
            </div>
          )
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
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Reorder Level</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Vendor Price</th>
              <th className="px-4 py-2">Selling Price</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {viewMode === 'separate' ? (
              filtered && filtered.length > 0 ? filtered.map((row) => (
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
                  <td className="px-4 py-2">
                    {row.vendor_price ? `$${Number(row.vendor_price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {row.selling_price ? `$${Number(row.selling_price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <AdjustInventoryModal
                        productId={row.product_id}
                        vendorId={row.vendor_id}
                        vendorName={row.vendor}
                        currentStock={row.quantity}
                        onSave={() => {
                          fetchProducts()
                          setHistoryRefreshKey(prev => prev + 1)
                        }}
                        trigger={
                          <Tooltip content="Adjust Inventory" delay={750}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        }
                      />
                      <ProductDetailsButton
                        productId={row.product_id}
                        initialData={{
                          name: row.name,
                          sku: row.sku,
                          vendor_id: row.vendor_id,
                          reorder_threshold: row.reorder_threshold,
                          category: row.category,
                          quantity: row.quantity
                        }}
                        onSave={fetchProducts}
                        trigger={
                          <Tooltip content="Product Details" delay={750}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Info className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        }
                      />
                      <Tooltip content="View Profile" delay={750}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/products/${row.product_id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </Button>
                      </Tooltip>
                      <InventoryHistoryDialog
                        productId={row.product_id}
                        role={user.role}
                        refreshKey={historyRefreshKey}
                      />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    No matching products found.
                  </td>
                </tr>
              )
            ) : (
              getFilteredMergedProducts().length > 0 ? getFilteredMergedProducts().map((row) => (
                <tr
                  key={row.product_id}
                  className={clsx(
                    'border-t',
                    row.quantity < row.reorder_threshold ? 'bg-red-50' : ''
                  )}
                >
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{row.sku}</td>
                  <td className="px-4 py-2">
                    {row.vendors.length > 1 ? (
                      <div className="relative dropdown-container">
                        <button 
                          type="button"
                          onClick={() => toggleDropdown(row.sku, 'vendors')}
                          className="cursor-pointer flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          Multiple Vendors
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            openDropdowns[row.sku] === 'vendors' ? 'rotate-180' : ''
                          }`} />
                        </button>
                        {openDropdowns[row.sku] === 'vendors' && (
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[240px] max-w-[300px] overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Vendors</h4>
                            </div>
                            {row.vendors.map((vendor, index) => (
                              <div 
                                key={vendor.vendor_id} 
                                className={`px-3 py-3 text-sm hover:bg-gray-50 transition-colors ${
                                  index !== row.vendors.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{vendor.vendor_name}</div>
                                    <div className="text-xs text-gray-500 mt-1">Stock: {vendor.quantity}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      row.vendor
                    )}
                  </td>
                  <td className="px-4 py-2">{row.quantity}</td>
                  <td className="px-4 py-2">{row.reorder_threshold}</td>
                  <td className="px-4 py-2">{row.category}</td>
                  <td className="px-4 py-2">
                    {row.vendors.length > 1 ? (
                      <div className="relative dropdown-container">
                        <button 
                          type="button"
                          onClick={() => toggleDropdown(row.sku, 'prices')}
                          className="cursor-pointer flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          View Prices
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            openDropdowns[row.sku] === 'prices' ? 'rotate-180' : ''
                          }`} />
                        </button>
                        {openDropdowns[row.sku] === 'prices' && (
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[220px] max-w-[280px] overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Vendor Prices</h4>
                            </div>
                            {row.vendors.map((vendor, index) => (
                              <div 
                                key={vendor.vendor_id} 
                                className={`px-3 py-3 text-sm hover:bg-gray-50 transition-colors ${
                                  index !== row.vendors.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-900">{vendor.vendor_name}</span>
                                  <span className="text-green-600 font-semibold">
                                    {vendor.vendor_price ? `$${Number(vendor.vendor_price).toFixed(2)}` : '—'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      row.vendors[0]?.vendor_price ? `$${Number(row.vendors[0].vendor_price).toFixed(2)}` : '—'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {row.selling_price ? `$${Number(row.selling_price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-2 space-x-2">
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
              )) : (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    No matching products found.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
