'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Package, DollarSign, Building } from 'lucide-react'
import { apiCall } from '@/lib/api'
import { useUser } from '@/context/UserContext'
import WarehouseModal from './WarehouseModal'

interface Warehouse {
  id: number
  name: string
  code: string
  city: string
  state: string
  country: string
  is_active: boolean
  product_count: number
  total_items: number
  inventory_value: number
}

export default function WarehouseTable() {
  const { user } = useUser()
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)

  const fetchWarehouses = async () => {
    try {
      const res = await apiCall('/api/warehouses')
      const data = await res.json()
      setWarehouses(data.warehouses || [])
    } catch (err) {
      console.error('Error fetching warehouses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const handleRowClick = (warehouseId: number) => {
    router.push(`/admin/warehouses/${warehouseId}`)
  }

  const handleAddWarehouse = () => {
    setEditingWarehouse(null)
    setShowModal(true)
  }

  const handleEditWarehouse = (e: React.MouseEvent, warehouse: Warehouse) => {
    e.stopPropagation()
    setEditingWarehouse(warehouse)
    setShowModal(true)
  }

  const handleSaveWarehouse = async () => {
    await fetchWarehouses()
    setShowModal(false)
    setEditingWarehouse(null)
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Warehouse Locations</h2>
          </div>
          {user?.role === 'super_admin' && (
            <Button
              onClick={handleAddWarehouse}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Warehouse
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {warehouses.map((warehouse) => (
            <div
              key={warehouse.id}
              onClick={() => handleRowClick(warehouse.id)}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:border-gray-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{warehouse.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      warehouse.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {warehouse.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {user?.role === 'super_admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleEditWarehouse(e, warehouse)}
                      className="h-8 px-2"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  {warehouse.city && warehouse.state ? `${warehouse.city}, ${warehouse.state}` : 'Location not specified'}
                </p>
                {warehouse.country && (
                  <p className="text-xs text-gray-500">{warehouse.country}</p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">Products</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {formatNumber(warehouse.product_count)}
                  </span>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">Items</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {formatNumber(warehouse.total_items)}
                  </span>
                </div>
              </div>

              {/* Value */}
              <div className="mt-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700 font-medium">Total Value</span>
                </div>
                <span className="text-xl font-bold text-emerald-700">
                  {formatCurrency(warehouse.inventory_value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Items
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inventory Value
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {user?.role === 'super_admin' && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {warehouses.map((warehouse) => (
              <tr
                key={warehouse.id}
                onClick={() => handleRowClick(warehouse.id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
                    <div className="text-xs text-gray-500">{warehouse.code}</div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {warehouse.city}, {warehouse.state}
                  </div>
                  <div className="text-xs text-gray-500">{warehouse.country}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatNumber(warehouse.product_count)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className="text-sm text-gray-900">{formatNumber(warehouse.total_items)}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(warehouse.inventory_value)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      warehouse.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {warehouse.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {user?.role === 'super_admin' && (
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleEditWarehouse(e, warehouse)}
                    >
                      Edit
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {warehouses.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No warehouses configured</p>
          {user?.role === 'super_admin' && (
            <p className="text-sm text-gray-400">Click "Add Warehouse" to get started</p>
          )}
        </div>
      )}

      {showModal && (
        <WarehouseModal
          warehouse={editingWarehouse}
          onClose={() => setShowModal(false)}
          onSave={handleSaveWarehouse}
        />
      )}
    </div>
  )
}