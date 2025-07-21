'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import VendorTermsModal from '@/components/VendorTermsModal'

interface Vendor {
  id: number
  name: string
  email?: string
  phone?: string
  notes?: string
}

interface VendorProductTerm {
  product_id: number
  product_name: string
  sku: string
  unit_price: number
  lead_time_days: number
  payment_terms: string
  min_order_qty?: number
  notes?: string
}

export default function VendorProfilePage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const vendorId = params?.id?.toString()
  const query = useSearchParams()
  const focusProductId = query?.get('product')

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [terms, setTerms] = useState<VendorProductTerm[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVendor = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/vendors/${vendorId}`, {
        credentials: 'include'
      })
      const data = await res.json()
      setVendor(data.vendor)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTerms = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/vendors/${vendorId}/products`, {
        credentials: 'include'
      })
      const data = await res.json()
      setTerms(data.products)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && vendorId) {
      fetchVendor()
      fetchTerms()
    }
  }, [user, vendorId])

  if (!user) return <div className="p-6">Unauthorized</div>
  if (loading || !vendor) return <div className="p-6">Loading vendor...</div>

  return (
    <main className="p-4 md:p-6">
      <Button variant="outline" onClick={() => router.push('/admin/vendors')} className="mb-4">
        ← Back to Vendors
      </Button>
      
      {/* Vendor Info Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active Vendor</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendor.email && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.65c.67.4 1.49.4 2.16 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Email Address</span>
              </div>
              <span className="text-gray-900 font-medium break-all">{vendor.email}</span>
            </div>
          )}
          
          {vendor.phone && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Phone Number</span>
              </div>
              <span className="text-gray-900 font-medium">{vendor.phone}</span>
            </div>
          )}
          
          {vendor.notes && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Notes</span>
              </div>
              <span className="text-gray-900">{vendor.notes}</span>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Products Supplied</h2>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Lead Time</th>
              <th className="px-4 py-2">Terms</th>
              <th className="px-4 py-2">Min Qty</th>
              <th className="px-4 py-2">Notes</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(terms) && terms.length > 0 ? (
              terms.map((row) => {
                const isFocused = focusProductId && focusProductId === row.product_id.toString()
                return (
                  <tr key={row.product_id} className={isFocused ? 'bg-yellow-50 border-t' : 'border-t'}>
                    <td className="px-4 py-2">{row.product_name}</td>
                    <td className="px-4 py-2">{row.sku}</td>
                    <td className="px-4 py-2">${Number(row.unit_price).toFixed(2)}</td>
                    <td className="px-4 py-2">{row.lead_time_days}d</td>
                    <td className="px-4 py-2">{row.payment_terms}</td>
                    <td className="px-4 py-2">{row.min_order_qty ?? '—'}</td>
                    <td className="px-4 py-2">{row.notes || '—'}</td>
                    <td className="px-4 py-2 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/products/${row.product_id}`)}
                      >
                        View Product
                      </Button>
                      <VendorTermsModal
                        productId={row.product_id}
                        vendorId={vendor.id}
                        defaultValues={row}
                        onSaved={fetchTerms}
                        trigger={<Button size="sm" variant="secondary">Edit</Button>}
                      />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                  This vendor currently has no product terms.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {Array.isArray(terms) && terms.length > 0 ? (
          terms.map((row) => {
            const isFocused = focusProductId && focusProductId === row.product_id.toString()
            return (
              <div 
                key={row.product_id} 
                className={`group border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${
                  isFocused 
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50/50 border-yellow-300 ring-2 ring-yellow-200' 
                    : 'bg-gradient-to-br from-white to-gray-50/30 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{row.product_name}</h3>
                      {isFocused && (
                        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-mono">
                        {row.sku}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <p className="text-2xl font-bold text-green-700">${Number(row.unit_price).toFixed(2)}</p>
                      <p className="text-xs text-green-600">per unit</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/60 border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-gray-600 font-medium">Lead Time</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{row.lead_time_days} days</span>
                  </div>
                  
                  <div className="bg-white/60 border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                      <span className="text-xs text-gray-600 font-medium">Min Qty</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{row.min_order_qty ?? '—'}</span>
                  </div>
                  
                  <div className="col-span-2 bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs text-blue-700 font-medium">Payment Terms</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-900">{row.payment_terms}</span>
                  </div>
                  
                  {row.notes && (
                    <div className="col-span-2 bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-xs text-amber-700 font-medium">Notes</span>
                      </div>
                      <span className="text-sm text-amber-900">{row.notes}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/products/${row.product_id}`)}
                    className="flex-1 h-12 bg-white border-2 border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out"
                  >
                    View Product
                  </Button>
                  <VendorTermsModal
                    productId={row.product_id}
                    vendorId={vendor.id}
                    defaultValues={row}
                    onSaved={fetchTerms}
                    trigger={
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1 h-12 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold border-0 hover:from-gray-800 hover:to-gray-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out"
                      >
                        Edit Terms
                      </Button>
                    }
                  />
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-medium">No Product Terms</p>
            <p className="text-sm">This vendor currently has no product terms configured.</p>
          </div>
        )}
      </div>
    </main>
  )
}
