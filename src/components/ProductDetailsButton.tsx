'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ProductModal from '@/components/ProductModal'
import { apiCall } from '@/lib/api'

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
      const res = await apiCall(`/api/inventory/${productId}`)
      if (res.ok) {
        const data = await res.json()
        // Combine product data with vendors array and current vendor's quantity
        const productWithVendors = {
          ...data.product,
          id: productId, // Explicitly set the product ID
          vendors: data.vendors || [],
          quantity: initialData.quantity,  // Use the current vendor's quantity from the table
          vendor_id: initialData.vendor_id, // Ensure vendor_id is preserved
          // Ensure all imported product fields are included and properly mapped
          name: data.product.name || initialData.name,
          sku: data.product.sku || initialData.sku,
          category: data.product.category || initialData.category || '',
          reorder_threshold: data.product.reorder_threshold !== undefined ? data.product.reorder_threshold : initialData.reorder_threshold,
          unit_price: data.product.unit_price || 0, // This is the selling price from products table
          selling_price: data.product.unit_price || 0, // Map unit_price to selling_price for the form
          notes: data.product.notes || '',
          // Set vendor-specific pricing from vendor terms if available
          vendor_price: data.vendors?.find((v: any) => v.id === initialData.vendor_id)?.unit_price || 0,
          lead_time_days: data.vendors?.find((v: any) => v.id === initialData.vendor_id)?.lead_time_days || 0,
          payment_terms: data.vendors?.find((v: any) => v.id === initialData.vendor_id)?.payment_terms || '',
          vendor_notes: data.vendors?.find((v: any) => v.id === initialData.vendor_id)?.notes || ''
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