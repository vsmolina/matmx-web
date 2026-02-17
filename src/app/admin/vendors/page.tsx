'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import VendorCreateModal from '@/components/VendorCreateModal'
import AdminGuard from '@/components/AdminGuard'
import { Skeleton } from '@/components/ui/skeleton'
import { apiCall } from '@/lib/api'
import { 
  Store, 
  Mail, 
  Phone, 
  Package,
  Plus,
  Search,
  Building2,
  TrendingUp,
  Users,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Vendor {
  id: number
  name: string
  email?: string
  phone?: string
  product_count: number
}

export default function VendorsPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filtered, setFiltered] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchVendors = useCallback(async () => {
    if (loadingRef.current || !user) return
    
    loadingRef.current = true
    setLoading(true)
    try {
      const res = await apiCall('/api/vendors')
      const data = await res.json()
      setVendors(data.vendors || [])
      setFiltered(data.vendors || [])
    } catch (err) {
      console.error('Error loading vendors:', err)
      setVendors([])
      setFiltered([])
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [user])

  const handleDeleteVendor = async (vendorId: number, vendorName: string) => {
    if (!confirm(`Are you sure you want to delete vendor "${vendorName}"? This cannot be undone.`)) return
    try {
      const res = await apiCall(`/api/vendors/${vendorId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Vendor deleted')
      setVendors(prev => prev.filter(v => v.id !== vendorId))
      setFiltered(prev => prev.filter(v => v.id !== vendorId))
    } catch (err) {
      toast.error('Failed to delete vendor')
    }
  }

  const handleVendorUpdate = useCallback(() => {
    if (!loadingRef.current) {
      fetchVendors()
    }
  }, [fetchVendors])

  useEffect(() => {
    if (!userLoading && user) {
      fetchVendors()
    }
  }, [userLoading, user, fetchVendors])

  useEffect(() => {
    const q = debouncedSearch.toLowerCase()
    const f = vendors.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.phone?.toLowerCase().includes(q)
    )
    setFiltered(f)
  }, [debouncedSearch, vendors])

  if (!user) return <div className="p-6">Unauthorized</div>
  
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  const totalProducts = vendors.reduce((sum, v) => sum + Number(v.product_count), 0)
  const activeVendors = vendors.filter(v => v.product_count > 0).length

  return (
    <AdminGuard allowedRoles={['super_admin', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-600 to-violet-700 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Store className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Vendor Management
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                Manage your suppliers and track product inventory
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {/* Total Vendors Card */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                  Total
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Total Vendors</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{vendors.length}</p>
                <p className="text-xs text-gray-600">Registered suppliers</p>
              </div>
            </div>

            {/* Active Vendors Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  Active
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Active Vendors</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{activeVendors}</p>
                <p className="text-xs text-gray-600">With products</p>
              </div>
            </div>

            {/* Total Products Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                  Inventory
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Total Products</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalProducts}</p>
                <p className="text-xs text-gray-600">Across all vendors</p>
              </div>
            </div>

            {/* Average Products Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  Average
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Avg Products/Vendor</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {vendors.length > 0 ? Math.round(totalProducts / vendors.length) : 0}
                </p>
                <p className="text-xs text-gray-600">Per supplier</p>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <VendorCreateModal
                onSaved={handleVendorUpdate}
                trigger={
                  <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </Button>
                }
              />
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Vendor
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Products
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                            <Store className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{v.name}</div>
                            <div className="text-xs text-gray-500">Vendor #{v.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{v.email || '—'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{v.phone || '—'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">{v.product_count}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            v.product_count > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {v.product_count > 0 ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/vendors/${v.id}`)}
                          className="border-gray-300 hover:border-purple-400 hover:text-purple-600 transition-colors"
                        >
                          View Details
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDeleteVendor(v.id, v.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Store className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-sm font-medium">No vendors found</p>
                          <p className="text-xs">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filtered.map((v) => (
              <div key={v.id} className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                      <Store className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{v.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          v.product_count > 0 ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-sm text-gray-500">
                          {v.product_count > 0 ? 'Active Vendor' : 'Inactive Vendor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/vendors/${v.id}`)}
                    className="shrink-0 border-gray-300 hover:border-purple-400 hover:text-purple-600 transition-colors"
                  >
                    View
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Email</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{v.email || '—'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Phone</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{v.phone || '—'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-purple-700 font-medium">Products</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-purple-700">{v.product_count}</span>
                      <span className="text-xs text-purple-600">items</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Store className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-base font-medium">No vendors found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
