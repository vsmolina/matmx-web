'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, Settings, Info, MapPin } from 'lucide-react'
import ProductModal from '@/components/ProductModal'
import ExportCSVButton from './ExportCSVButton'
import ImportExcelModal from './ImportExcelModal'
import InventoryHistoryDialog from './InventoryHistoryDialog'
import ImportLogDialog from './ImportLogDialog'
import WarehouseTable from './WarehouseTable'
import clsx from 'clsx'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import AdjustInventoryModal from '@/components/AdjustInventoryModal'
import ProductDetailsButton from './ProductDetailsButton'
import { apiCall } from '@/lib/api'

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
  warehouse_id?: number
  warehouse_name?: string
  warehouse_code?: string
}

interface Warehouse {
  id: number
  name: string
  code: string
  is_active: boolean
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
  warehouses: Array<{
    warehouse_id: number | null
    warehouse_name: string
    warehouse_code: string
    quantity: number
  }>
  quantity: number
  reorder_threshold: number
  category: string
  selling_price: number
}

export default function InventoryTable() {
  const { user, loading } = useUser()
  const isSalesRep = user?.role === 'sales_rep'
  const [rows, setRows] = useState<ProductVendorStock[]>([])
  const [filtered, setFiltered] = useState<ProductVendorStock[]>([])
  const [mergedProducts, setMergedProducts] = useState<MergedProduct[]>([])
  const [search, setSearch] = useState('')
  const [loadingData, setLoadingData] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('separate')
  const router = useRouter()
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: 'vendors' | 'prices' | null
  }>({})
  
  // loadingRef removed - using AbortController for request dedup instead

  // Debounce search to prevent excessive filtering
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const toggleDropdown = (productSku: string, type: 'vendors' | 'prices') => {
    setOpenDropdowns(prev => ({
      ...prev,
      [productSku]: prev[productSku] === type ? null : type
    }))
  }


  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchProducts = useCallback(async () => {
    // Cancel any in-flight requests (this is our dedup mechanism)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller
    
    setLoadingData(true)
    try {
      let url = '/api/inventory'
      if (selectedWarehouse) {
        url += `?warehouse_id=${selectedWarehouse}`
      }
      
      const res = await apiCall(url, { signal: controller.signal })
      const data = await res.json()
      
      // Handle different possible response structures
      let products = []
      if (data.products) {
        products = data.products
      } else if (Array.isArray(data)) {
        products = data
      } else {
        console.error('Unexpected API response structure:', data)
      }
      
      if (!controller.signal.aborted) {
        setRows(products)
        setFiltered(products)
        
        // Create merged products
        const merged = createMergedProducts(products)
        setMergedProducts(merged)
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Error fetching inventory:', err)
        setRows([])
        setFiltered([])
        setMergedProducts([])
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoadingData(false)
      }
    }
  }, [selectedWarehouse])

  // Optimized handlers to prevent excessive API calls
  const handleInventoryUpdate = useCallback(() => {
    fetchProducts()
    setHistoryRefreshKey(prev => prev + 1)
  }, [fetchProducts])

  const handleProductUpdate = useCallback(() => {
    fetchProducts()
  }, [fetchProducts])

  const createMergedProducts = (products: ProductVendorStock[]): MergedProduct[] => {
    const productMap = new Map<string, MergedProduct>()
    
    products.forEach(product => {
      if (!productMap.has(product.sku)) {
        productMap.set(product.sku, {
          product_id: product.product_id,
          name: product.name,
          sku: product.sku,
          vendor: product.vendor || '—',
          vendors: [],
          warehouses: [],
          quantity: 0,
          reorder_threshold: product.reorder_threshold,
          category: product.category,
          selling_price: product.selling_price
        })
      }
      
      const mergedProduct = productMap.get(product.sku)!
      
      // Deduplicate vendors by vendor_id (aggregate quantity across warehouses)
      const existingVendor = mergedProduct.vendors.find(v => v.vendor_id === product.vendor_id)
      if (existingVendor) {
        existingVendor.quantity += product.quantity
      } else {
        mergedProduct.vendors.push({
          vendor_id: product.vendor_id,
          vendor_name: product.vendor || '—',
          quantity: product.quantity,
          vendor_price: product.vendor_price
        })
      }
      
      // Track warehouses (deduplicate by warehouse_id)
      const whId = product.warehouse_id ?? null
      const existingWh = mergedProduct.warehouses.find(w => w.warehouse_id === whId)
      if (existingWh) {
        existingWh.quantity += product.quantity
      } else {
        mergedProduct.warehouses.push({
          warehouse_id: whId,
          warehouse_name: product.warehouse_name || 'Unassigned',
          warehouse_code: product.warehouse_code || 'N/A',
          quantity: product.quantity
        })
      }
      
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

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await apiCall('/api/warehouses')
      const data = await res.json()
      setWarehouses(data.warehouses || [])
    } catch (err) {
      console.error('Error fetching warehouses:', err)
    }
  }, [])

  useEffect(() => {
    if (!loading && user) {
      fetchProducts()
      fetchWarehouses()
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loading, user, fetchProducts, fetchWarehouses])

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
      
      const q = debouncedSearch.toLowerCase()
      const f = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q)
      )
      setFiltered(f)
    }
  }, [debouncedSearch, rows, viewMode])

  const getFilteredMergedProducts = useCallback(() => {
    if (!mergedProducts || mergedProducts.length === 0) return []
    
    const q = debouncedSearch.toLowerCase()
    return mergedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.vendors.some(v => v.vendor_name.toLowerCase().includes(q))
    )
  }, [mergedProducts, debouncedSearch])

  if (loading || loadingData) return <div className="p-4">Loading inventory...</div>
  if (!user) return <div className="p-4">Unauthorized</div>

  return (
    <div className="p-4">
      {/* Warehouse Table - visible to all users */}
      <WarehouseTable />
      
      {/* Mobile Header */}
      <div className="mb-6 space-y-4 md:hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <Input
            placeholder="Search by name, SKU / Part #, or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/80 border-blue-200 focus:border-blue-400"
          />
        </div>
        
        {/* Warehouse Filter for Mobile */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <MapPin className="h-4 w-4 text-gray-500" />
          <select
            value={selectedWarehouse || ''}
            onChange={(e) => setSelectedWarehouse(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 text-sm bg-transparent border-none focus:outline-none"
          >
            <option value="">All Warehouses</option>
            {warehouses.filter(w => w.is_active).map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} ({warehouse.code})
              </option>
            ))}
          </select>
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
          {!isSalesRep && <ProductModal
            mode="add"
            onSave={handleProductUpdate}
            trigger={
              <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                Add Product
              </Button>
            }
          />}
          <ExportCSVButton />
        </div>
        
        {!isSalesRep && <div className="grid grid-cols-2 gap-3">
          <ImportExcelModal onSuccess={handleProductUpdate} />
          {user?.role === 'super_admin' && <ImportLogDialog />}
        </div>}
      </div>

      {/* Desktop Header */}
      <div className="mb-6 hidden md:block">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Inventory Management</h1>
          <div className="space-y-4">
            {/* Search and View Mode Row */}
            <div className="flex flex-col xl:flex-row items-center justify-center gap-4">
              <Input
                placeholder="Search by name, SKU / Part #, or vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md bg-white/80 border-blue-200 focus:border-blue-400"
              />
              
              {/* Warehouse Filter */}
              <div className="flex items-center gap-2 bg-white/60 border border-blue-200 rounded-lg px-3 py-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedWarehouse || ''}
                  onChange={(e) => setSelectedWarehouse(e.target.value ? Number(e.target.value) : null)}
                  className="text-sm bg-transparent border-none focus:outline-none cursor-pointer"
                >
                  <option value="">All Warehouses</option>
                  {warehouses.filter(w => w.is_active).map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
                </select>
              </div>
              
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
            
            {/* Action Buttons Row */}
            <div className="flex flex-wrap justify-center gap-2">
              {!isSalesRep && <ProductModal
                mode="add"
                onSave={handleProductUpdate}
                trigger={
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap">
                    Add Product
                  </Button>
                }
              />}
              <ExportCSVButton />
              {!isSalesRep && <ImportExcelModal onSuccess={handleProductUpdate} />}
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
                    <h3 className="font-semibold text-lg text-gray-900"><button onClick={() => router.push(`/admin/products/${row.product_id}`)} className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer">{row.name}</button></h3>
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
                
                {!isSalesRep && <div className="bg-white/60 border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-xs text-gray-600 font-medium">Reorder</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{row.reorder_threshold}</span>
                </div>}
                
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
                
                {!isSalesRep && <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-xs text-blue-700 font-medium">Vendor Price</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {row.vendor_price ? `$${Number(row.vendor_price).toFixed(2)}` : '—'}
                  </span>
                </div>}
              </div>
              
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className={`grid ${isSalesRep ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                  {!isSalesRep && <AdjustInventoryModal
                    productId={row.product_id}
                    vendorId={row.vendor_id}
                    vendorName={row.vendor}
                    currentStock={row.quantity}
                    onSave={handleInventoryUpdate}
                    trigger={
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-10 w-10 bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out p-0"
                        title="Adjust Inventory"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    }
                  />}
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
                    onSave={handleProductUpdate}
                    readOnly={isSalesRep}
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
              key={row.sku}
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
                    <h3 className="font-semibold text-lg text-gray-900"><button onClick={() => router.push(`/admin/products/${row.product_id}`)} className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer">{row.name}</button></h3>
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
                
                {!isSalesRep && <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
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
                </div>}
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
              <th className="px-4 py-2">Warehouse</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Quantity</th>
              {!isSalesRep && <th className="px-4 py-2">Reorder Level</th>}
              <th className="px-4 py-2">Category</th>
              {!isSalesRep && <th className="px-4 py-2">Vendor Price</th>}
              <th className="px-4 py-2">Selling Price</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody key={viewMode}>
            {viewMode === 'separate' ? (
              filtered && filtered.length > 0 ? filtered.map((row) => (
                <tr
                  key={`sep-${row.product_id}-${row.vendor_id}-${row.warehouse_id}`}
                  className={clsx(
                    'border-t',
                    row.quantity < row.reorder_threshold ? 'bg-red-50' : ''
                  )}
                >
                  <td className="px-4 py-2"><button onClick={() => router.push(`/admin/products/${row.product_id}`)} className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer">{row.name}</button></td>
                  <td className="px-4 py-2">{row.sku}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs">{row.warehouse_code || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">{row.vendor}</td>
                  <td className="px-4 py-2">{row.quantity}</td>
                  {!isSalesRep && <td className="px-4 py-2">{row.reorder_threshold}</td>}
                  <td className="px-4 py-2">{row.category}</td>
                  {!isSalesRep && <td className="px-4 py-2">
                    {row.vendor_price ? `$${Number(row.vendor_price).toFixed(2)}` : '—'}
                  </td>}
                  <td className="px-4 py-2">
                    {row.selling_price ? `$${Number(row.selling_price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      {!isSalesRep && <AdjustInventoryModal
                        productId={row.product_id}
                        vendorId={row.vendor_id}
                        vendorName={row.vendor}
                        currentStock={row.quantity}
                        onSave={handleInventoryUpdate}
                        trigger={
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Adjust Inventory">
                            <Settings className="h-4 w-4" />
                          </Button>
                        }
                      />}
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
                        onSave={handleProductUpdate}
                        readOnly={isSalesRep}
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
                  <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                    No matching products found.
                  </td>
                </tr>
              )
            ) : (
              getFilteredMergedProducts().length > 0 ? getFilteredMergedProducts().map((row: MergedProduct) => (
                <tr
                  key={`merged-${row.sku}`}
                  className={clsx(
                    'border-t',
                    row.quantity < row.reorder_threshold ? 'bg-red-50' : ''
                  )}
                >
                  <td className="px-4 py-2"><button onClick={() => router.push(`/admin/products/${row.product_id}`)} className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer">{row.name}</button></td>
                  <td className="px-4 py-2">{row.sku}</td>
                  <td className="px-4 py-2">
                    {row.warehouses.length > 1 ? (
                      <div className="space-y-1">
                        {row.warehouses.map((wh, i) => (
                          <div key={wh.warehouse_id ?? `unassigned-${i}`} className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-xs">{wh.warehouse_code}</span>
                            <span className="text-xs text-gray-400">({wh.quantity})</span>
                          </div>
                        ))}
                      </div>
                    ) : row.warehouses.length === 1 ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs">{row.warehouses[0].warehouse_code}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs">N/A</span>
                      </div>
                    )}
                  </td>
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
                  {!isSalesRep && <td className="px-4 py-2">{row.reorder_threshold}</td>}
                  <td className="px-4 py-2">{row.category}</td>
                  {!isSalesRep && <td className="px-4 py-2">
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
                  </td>}
                  <td className="px-4 py-2">
                    {row.selling_price ? `$${Number(row.selling_price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      {!isSalesRep && <AdjustInventoryModal
                        productId={row.product_id}
                        vendorId={row.vendors[0]?.vendor_id ?? 0}
                        vendorName={row.vendors[0]?.vendor_name || '—'}
                        currentStock={row.quantity}
                        warehouses={row.warehouses.map(wh => ({
                          warehouse_id: wh.warehouse_id ?? 1,
                          warehouse_name: wh.warehouse_name,
                          warehouse_code: wh.warehouse_code,
                          quantity: wh.quantity
                        }))}
                        onSave={handleInventoryUpdate}
                        trigger={
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Adjust Inventory">
                            <Settings className="h-4 w-4" />
                          </Button>
                        }
                      />}
                      <ProductDetailsButton
                        productId={row.product_id}
                        initialData={{
                          name: row.name,
                          sku: row.sku,
                          vendor_id: row.vendors[0]?.vendor_id ?? 0,
                          reorder_threshold: row.reorder_threshold,
                          category: row.category,
                          quantity: row.quantity
                        }}
                        onSave={handleProductUpdate}
                        readOnly={isSalesRep}
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
                  <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
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
