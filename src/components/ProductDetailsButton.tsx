'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ProductModal from '@/components/ProductModal'

interface Props {
  productId: number
  initialData: {
    name: string
    sku: string
    vendor_id: number
    reorder_threshold: number
    category: string
    quantity: number
  }
  onSave: () => void
  trigger?: React.ReactNode
}

export default function ProductDetailsButton({ productId, initialData, onSave, trigger }: Props) {
  const [productDetails, setProductDetails] = useState<any>(null)

  const handleClick = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/inventory/${productId}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        // Combine product data with vendors array and current vendor's quantity
        const productWithVendors = {
          ...data.product,
          id: productId, // Explicitly set the product ID
          vendors: data.vendors || [],
          quantity: initialData.quantity,  // Use the current vendor's quantity from the table
          vendor_id: initialData.vendor_id // Ensure vendor_id is preserved
        }
        setProductDetails(productWithVendors)
      }
    } catch (err) {
      console.error('Error fetching product details:', err)
    }
  }

  return (
    <ProductModal
      mode="edit"
      defaultValues={productDetails}
      onSave={() => {
        onSave()
        setProductDetails(null)
      }}
      trigger={
        trigger ? (
          <div onClick={handleClick}>
            {trigger}
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={handleClick}>
            Details
          </Button>
        )
      }
    />
  )
}