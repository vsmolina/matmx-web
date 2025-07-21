// components/ProductDetailsModal.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface Props {
  productId: number
  trigger: React.ReactNode
}

export default function ProductDetailsModal({ productId, trigger }: Props) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null)

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/inventory/${productId}`, {
        credentials: 'include'
      })
      const data = await res.json()
      setProduct(data.product)
    } catch (err) {
      console.error('Failed to load product info', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBarcode = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/inventory/${productId}/barcode.png`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setBarcodeDataUrl(data.dataUrl)
      }
    } catch (err) {
      console.error('Error fetching barcode:', err)
      setBarcodeDataUrl(null)
    }
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (open) {
        fetchProduct()
        fetchBarcode()
      }
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : product ? (
          <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {product.name}</div>
            <div><strong>SKU:</strong> {product.sku}</div>
            <div><strong>Category:</strong> {product.category}</div>
            <div><strong>Unit Price:</strong> ${Number(product.unit_price).toFixed(2)}</div>
            <div><strong>Reorder Threshold:</strong> {product.reorder_threshold}</div>
            <div><strong>Notes:</strong> {product.notes || '—'}</div>

            <div className="mt-4 border-t pt-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Barcode</p>
              {barcodeDataUrl ? (
                <img
                  src={barcodeDataUrl}
                  alt="Barcode"
                  width={300}
                  height={80}
                  className="mx-auto border bg-white p-2"
                />
              ) : (
                <div className="mx-auto border bg-white p-2 w-[300px] h-[80px] flex items-center justify-center text-gray-500 text-sm">
                  Barcode not available
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-500">Failed to load product.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
