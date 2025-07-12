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
    <main className="p-6">
      <Button variant="outline" onClick={() => router.push('/admin/vendors')}>
        ← Back to Vendors
      </Button>
      <h1 className="text-2xl font-bold mb-2">{vendor.name}</h1>
      <div className="text-sm text-gray-600 mb-4">
        {vendor.email && <p>Email: {vendor.email}</p>}
        {vendor.phone && <p>Phone: {vendor.phone}</p>}
        {vendor.notes && <p>Notes: {vendor.notes}</p>}
      </div>

      <h2 className="text-lg font-semibold mb-2 mt-6">Products Supplied</h2>
      <div className="overflow-x-auto border rounded-lg">
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
    </main>
  )
}
