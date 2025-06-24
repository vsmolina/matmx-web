'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/UserContext'
import Image from 'next/image'
import Link from 'next/link'
import VendorTermsModal from '@/components/VendorTermsModal'

interface Product {
  id: number
  name: string
  sku: string
  category: string
  reorder_threshold: number
  unit_price: number
  notes: string
  image_path?: string
}

interface VendorTerm {
  vendor_id: number
  vendor_name: string
  unit_price: number
  lead_time_days: number
  payment_terms: string
  notes: string
}

export default function ProductProfilePage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const productId = params?.id

  const [product, setProduct] = useState<Product | null>(null)
  const [vendorTerms, setVendorTerms] = useState<VendorTerm[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/inventory/${productId}`, {
        credentials: 'include'
      })
      const data = await res.json()
      setProduct(data.product)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchVendorTerms = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/inventory/${productId}/vendor-terms`, {
        credentials: 'include'
      })
      const data = await res.json()
      setVendorTerms(data.terms)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (user && productId) {
      fetchProduct()
      fetchVendorTerms()
      setLoading(false)
    }
  }, [user, productId])

  if (!user) return <div className="p-6">Unauthorized</div>
  if (loading || !product) return <div className="p-6">Loading product...</div>

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <div className="text-gray-600 mb-4">SKU: {product.sku}</div>

      {product.image_path && (
        <Image
          src={product.image_path}
          alt={product.name}
          width={300}
          height={300}
          className="rounded mb-4"
        />
      )}

      <div className="text-sm mb-6">
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Reorder Threshold:</strong> {product.reorder_threshold}</p>
        <p><strong>Unit Price:</strong> ${product.unit_price.toFixed(2)}</p>
        <p><strong>Notes:</strong> {product.notes || 'None'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Vendor Terms</h2>
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Vendor</th>
              <th className="px-3 py-2 text-left">Price</th>
              <th className="px-3 py-2 text-left">Lead Time</th>
              <th className="px-3 py-2 text-left">Payment Terms</th>
              <th className="px-3 py-2 text-left">Notes</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {vendorTerms.map((term) => (
              <tr key={term.vendor_id} className="border-t">
                <td className="px-3 py-2">{term.vendor_name}</td>
                <td className="px-3 py-2">${term.unit_price.toFixed(2)}</td>
                <td className="px-3 py-2">{term.lead_time_days} days</td>
                <td className="px-3 py-2">{term.payment_terms}</td>
                <td className="px-3 py-2">{term.notes || '—'}</td>
                <td className="px-3 py-2 space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/inventory/${term.vendor_id}?product=${productId}`)}
                  >
                    View Vendor
                  </Button>
                  <VendorTermsModal
                    productId={product.id}
                    vendorId={term.vendor_id}
                    defaultValues={term}
                    onSaved={fetchVendorTerms}
                    trigger={<Button size="sm" variant="secondary">Edit</Button>}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
