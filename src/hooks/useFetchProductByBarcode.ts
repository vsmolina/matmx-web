import { useEffect, useState } from 'react'
import { Product } from '@/types/ProductTypes' // optional shared type

export function useFetchProductByBarcode(barcode: string | null) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barcode) return

    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:4000/api/inventory/barcode/${barcode}`, {
          credentials: 'include',
        })
        const data = await res.json()
        if (res.ok) {
          setProduct(data.product)
        } else {
          setError(data.error || 'Product not found')
        }
      } catch (err: any) {
        setError('Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [barcode])

  return { product, loading, error }
}
