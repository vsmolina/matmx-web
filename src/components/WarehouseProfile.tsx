'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, MapPin, Package, DollarSign, TrendingUp, 
  AlertTriangle, Clock, User, Building, ChevronDown,
  Settings, Info
} from 'lucide-react'
import { apiCall } from '@/lib/api'
import { useUser } from '@/context/UserContext'
import AdjustInventoryModal from './AdjustInventoryModal'
import ProductDetailsButton from './ProductDetailsButton'
import clsx from 'clsx'

interface WarehouseDetails {
  id: number
  name: string
  code: string
  address?: string
  city?: string
  state?: string
  country?: string
  zip?: string
  phone?: string
  email?: string
  manager_name?: string
  capacity?: number
  is_active: boolean
  notes?: string
}

interface WarehouseStats {
  product_count: number
  vendor_count: number
  total_items: number
  inventory_value: number
  low_stock_count: number
}

interface ActivityItem {
  id: number
  product_name: string
  sku: string
  adjustment_type: string
  quantity: number
  change: number
  user_name?: string
  created_at: string
}

interface ProductItem {
  product_id: number
  name: string
  sku: string
  category: string
  vendor: string
  vendor_id: number
  quantity: number
  reorder_threshold: number
  vendor_price: number
  selling_price: number
  warehouse_id: number
  warehouse_name: string
  warehouse_code: string
}

interface WarehouseProfileProps {
  warehouseId: string
}

export default function WarehouseProfile({ warehouseId }: WarehouseProfileProps) {
  const { user } = useUser()
  const router = useRouter()
  const [warehouse, setWarehouse] = useState<WarehouseDetails | null>(null)
  const [stats, setStats] = useState<WarehouseStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)

  const fetchWarehouseData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch warehouse details
      const warehouseRes = await apiCall(`/api/warehouses/${warehouseId}`)
      const warehouseData = await warehouseRes.json()
      
      setWarehouse(warehouseData.warehouse)
      setStats(warehouseData.stats)
      setRecentActivity(warehouseData.recentActivity || [])
      
      // Fetch products in warehouse
      const productsRes = await apiCall(`/api/warehouses/${warehouseId}/products`)
      const productsData = await productsRes.json()
      
      setProducts(productsData.products || [])
      setFilteredProducts(productsData.products || [])
    } catch (err) {
      console.error('Error fetching warehouse data:', err)
    } finally {
      setLoading(false)
    }
  }, [warehouseId])

  useEffect(() => {
    fetchWarehouseData()
  }, [fetchWarehouseData])

  useEffect(() => {
    let filtered = [...products]
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.vendor.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply low stock filter
    if (showLowStock) {
      filtered = filtered.filter(p => p.quantity < p.reorder_threshold)
    }
    
    setFilteredProducts(filtered)
  }, [search, products, showLowStock])

  const handleInventoryUpdate = () => {
    fetchWarehouseData()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!warehouse) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Warehouse not found</p>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/products')}
            className="mt-4"
          >
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          
          {warehouse.is_active ? (
            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Active
            </span>
          ) : (
            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              Inactive
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              {warehouse.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Code: {warehouse.code}</p>
            
            {warehouse.address && (
              <div className="mt-3 text-sm text-gray-600">
                <p>{warehouse.address}</p>
                <p>
                  {warehouse.city && `${warehouse.city}, `}
                  {warehouse.state && `${warehouse.state} `}
                  {warehouse.zip}
                </p>
                <p>{warehouse.country}</p>
              </div>
            )}
            
            <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm">
              {warehouse.manager_name && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Manager:</span>
                  <span className="font-medium">{warehouse.manager_name}</span>
                </div>
              )}
              
              {warehouse.phone && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{warehouse.phone}</span>
                </div>
              )}
              
              {warehouse.email && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{warehouse.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Products</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatNumber(stats.product_count)}</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Items</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatNumber(stats.total_items)}</p>
              </div>
              <Building className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Inventory Value</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.inventory_value)}</p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Vendors</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatNumber(stats.vendor_count)}</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Low Stock</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{formatNumber(stats.low_stock_count)}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Products in Warehouse</h2>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64"
              />
              
              <Button
                variant={showLowStock ? "destructive" : "outline"}
                size="sm"
                onClick={() => setShowLowStock(!showLowStock)}
                className="whitespace-nowrap"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                {showLowStock ? 'Show All' : 'Low Stock Only'}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden space-y-3">
          {filteredProducts.map((product) => (
            <div
              key={`${product.product_id}-${product.vendor_id}`}
              className={clsx(
                'bg-white border rounded-xl p-4 shadow-sm transition-colors',
                product.quantity < product.reorder_threshold 
                  ? 'border-red-300 bg-red-50/30' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{product.sku}</p>
                  <p className="text-sm text-gray-600 mt-1">{product.vendor}</p>
                </div>
                {product.quantity < product.reorder_threshold && (
                  <div className="bg-red-100 border border-red-200 text-red-800 text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className={clsx(
                  "border rounded-lg p-3",
                  product.quantity < product.reorder_threshold 
                    ? "bg-red-50 border-red-200" 
                    : "bg-green-50 border-green-200"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className={clsx(
                      "h-4 w-4",
                      product.quantity < product.reorder_threshold ? "text-red-500" : "text-green-500"
                    )} />
                    <span className={clsx(
                      "text-xs font-medium",
                      product.quantity < product.reorder_threshold ? "text-red-700" : "text-green-700"
                    )}>Stock</span>
                  </div>
                  <span className={clsx(
                    "text-lg font-bold",
                    product.quantity < product.reorder_threshold ? "text-red-700" : "text-green-700"
                  )}>{product.quantity}</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-600 font-medium">Reorder</span>
                  </div>
                  <span className="text-lg font-bold text-gray-700">{product.reorder_threshold}</span>
                </div>
              </div>

              {/* Value and Category */}
              <div className="mb-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">Total Value</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {formatCurrency(product.quantity * product.selling_price)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Category:</span> {product.category}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <AdjustInventoryModal
                  productId={product.product_id}
                  vendorId={product.vendor_id}
                  vendorName={product.vendor}
                  currentStock={product.quantity}
                  warehouseId={product.warehouse_id}
                  onSave={handleInventoryUpdate}
                  trigger={
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Adjust
                    </Button>
                  }
                />
                <ProductDetailsButton
                  productId={product.product_id}
                  initialData={{
                    name: product.name,
                    sku: product.sku,
                    vendor_id: product.vendor_id,
                    reorder_threshold: product.reorder_threshold,
                    category: product.category,
                    quantity: product.quantity
                  }}
                  onSave={handleInventoryUpdate}
                  trigger={
                    <Button variant="outline" size="sm" className="flex-1">
                      <Info className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  }
                />
              </div>
            </div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr
                  key={`${product.product_id}-${product.vendor_id}`}
                  className={clsx(
                    'hover:bg-gray-50',
                    product.quantity < product.reorder_threshold && 'bg-red-50'
                  )}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {product.vendor}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={clsx(
                      'font-medium',
                      product.quantity < product.reorder_threshold ? 'text-red-600' : 'text-gray-900'
                    )}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-gray-500">
                    {product.reorder_threshold}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">
                    {formatCurrency(product.quantity * product.selling_price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <AdjustInventoryModal
                        productId={product.product_id}
                        vendorId={product.vendor_id}
                        vendorName={product.vendor}
                        currentStock={product.quantity}
                        warehouseId={product.warehouse_id}
                        onSave={handleInventoryUpdate}
                        trigger={
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Settings className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ProductDetailsButton
                        productId={product.product_id}
                        initialData={{
                          name: product.name,
                          sku: product.sku,
                          vendor_id: product.vendor_id,
                          reorder_threshold: product.reorder_threshold,
                          category: product.category,
                          quantity: product.quantity
                        }}
                        onSave={handleInventoryUpdate}
                        trigger={
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Info className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Recent Activity
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{activity.product_name}</span>
                      <span className="text-xs text-gray-500">({activity.sku})</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className={clsx(
                        'font-medium',
                        activity.change > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {activity.change > 0 ? '+' : ''}{activity.change}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{activity.adjustment_type.replace('_', ' ')}</span>
                      {activity.user_name && (
                        <>
                          <span className="mx-2">•</span>
                          <span>by {activity.user_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(activity.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}