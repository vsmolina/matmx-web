'use client'
import { getApiBaseUrl } from '@/lib/api'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/UserContext'
import Image from 'next/image'
import VendorTermsModal from '@/components/VendorTermsModal'
import { Input } from '@/components/ui/input'
import { Check, X, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiCall } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function BarcodeImage({ productId }: { productId: number }) {
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)

  const fetchBarcode = useCallback(async () => {
    if (loadingRef.current) return
    
    loadingRef.current = true
    setLoading(true)
    try {
      const response = await apiCall(`/api/inventory/${productId}/barcode.png`, { 
        headers: {
          'Accept': 'image/png' 
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setBarcodeUrl(url)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Error fetching barcode:', err)
      setError(true)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (productId && !loading && !barcodeUrl && !error) {
      fetchBarcode()
    }
    
    // Cleanup URL object when component unmounts
    return () => {
      if (barcodeUrl) {
        URL.revokeObjectURL(barcodeUrl)
      }
    }
  }, [productId, loading, barcodeUrl, error, fetchBarcode])

  if (error) {
    return (
      <div className="w-[300px] h-[80px] border bg-white p-2 flex items-center justify-center text-gray-500 text-sm">
        Barcode not available
      </div>
    )
  }

  if (!barcodeUrl) {
    return (
      <div className="w-[300px] h-[80px] border bg-white p-2 flex items-center justify-center text-gray-500 text-sm">
        Loading barcode...
      </div>
    )
  }

  return (
    <img
      src={barcodeUrl}
      alt="Barcode"
      className="border bg-white p-2"
      width={300}
      height={80}
    />
  )
}

interface InlineEditProps {
  value: string | number
  onSave: (value: string | number) => Promise<void>
  type?: 'text' | 'number'
  field: string
}

function InlineEdit({ value, onSave, type = 'text', field }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value ?? (type === 'number' ? 0 : ''))
  const [isHovered, setIsHovered] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value ?? (type === 'number' ? 0 : ''))
  }, [value, type])

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
      toast.success(`${field} updated successfully`)
    } catch (error) {
      toast.error(`Failed to update ${field}`)
      setEditValue(value ?? (type === 'number' ? 0 : '')) // Reset to original value
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value ?? (type === 'number' ? 0 : ''))
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 w-full">
        <Input
          type={type}
          value={editValue ?? (type === 'number' ? 0 : '')}
          onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-10 px-3 text-sm border-2 border-blue-300 focus:border-blue-500 bg-white flex-1"
          autoFocus
          disabled={isSaving}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isSaving}
          className="h-10 w-10 p-0 bg-green-50 hover:bg-green-100 border border-green-200"
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSaving}
          className="h-10 w-10 p-0 bg-red-50 hover:bg-red-100 border border-red-200"
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 cursor-pointer group py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 min-h-[44px] md:min-h-0 md:py-1 md:px-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsEditing(true)}
    >
      <span className="font-medium text-gray-900">
        {type === 'number' && field.toLowerCase().includes('price') ? `$${Number(value).toFixed(2)}` : value}
      </span>
      <Edit2 className={`h-4 w-4 text-blue-400 transition-opacity duration-200 ${
        isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0'
      } md:group-hover:opacity-100`} />
    </div>
  )
}

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

interface VendorInfo {
  product_id: number
  vendor_id: number
  vendor_name: string
  vendor_email: string
  unit_price: number
  lead_time_days: number
  payment_terms: string
  vendor_notes: string
  stock_quantity: number
}

export default function ProductProfilePage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const productId = params?.id

  const [product, setProduct] = useState<Product | null>(null)
  const [vendorInfos, setVendorInfos] = useState<VendorInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [priceUpdateConfirm, setPriceUpdateConfirm] = useState<{
    show: boolean
    field: string
    value: string | number
    sku: string
  } | null>(null)
  
  const loadingRef = useRef(false)

  const fetchProductProfile = useCallback(async () => {
    if (loadingRef.current || !productId) return
    
    loadingRef.current = true
    setLoading(true)
    try {
      // First, try to get the product by ID to get the SKU
      const productRes = await apiCall(`/api/inventory/${productId}`)
      
      if (!productRes.ok) {
        throw new Error('Product not found')
      }
      
      const productData = await productRes.json()
      const sku = productData.product.sku
      
      // Then get the unified product profile by SKU
      const profileRes = await apiCall(`/api/inventory/profile/sku/${sku}`)
      
      if (!profileRes.ok) {
        throw new Error('Product profile not found')
      }
      
      const data = await profileRes.json()
      setProduct(data.product)
      setVendorInfos(data.vendors)
    } catch (err) {
      console.error('Error fetching product profile:', err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [productId])

  const updateProductField = async (field: string, value: string | number) => {
    if (!product) return

    // For unit_price updates, show confirmation dialog
    if (field === 'unit_price' && product.unit_price !== value) {
      setPriceUpdateConfirm({
        show: true,
        field,
        value,
        sku: product.sku
      })
      return
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/inventory/profile/sku/${product.sku}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          [field]: value
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update product' }))
        throw new Error(errorData.error || 'Failed to update product')
      }

      // Update local state
      setProduct(prev => prev ? { ...prev, [field]: value } : null)
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  const handleConfirmPriceUpdate = async () => {
    if (!priceUpdateConfirm || !product) return

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/inventory/profile/sku/${product.sku}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          [priceUpdateConfirm.field]: priceUpdateConfirm.value
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update product' }))
        throw new Error(errorData.error || 'Failed to update product')
      }

      // Update local state
      setProduct(prev => prev ? { ...prev, [priceUpdateConfirm.field]: priceUpdateConfirm.value } : null)
      toast.success('Selling price updated for all products with this SKU')
      setPriceUpdateConfirm(null)
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update selling price')
      setPriceUpdateConfirm(null)
    }
  }

  const handleImageUpload = useCallback(async (file: File) => {
    if (!product || loadingRef.current) return
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await apiCall(`/api/inventory/${product.id}/image`, { 
        method: 'POST',
        body: formData 
      })
      if (res.ok) {
        await fetchProductProfile()
        toast.success('Image uploaded successfully')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }, [product, fetchProductProfile])

  const handleVendorTermsUpdate = useCallback(() => {
    if (!loadingRef.current) {
      fetchProductProfile()
    }
  }, [fetchProductProfile])

  useEffect(() => {
    if (user && productId && !loadingRef.current) {
      fetchProductProfile()
    }
  }, [user, productId, fetchProductProfile])

  if (!user) return <div className="p-6">Unauthorized</div>
  if (loading || !product) return <div className="p-6">Loading product...</div>

  return (
    <main className="p-4 md:p-6">
      <Button 
        variant="outline" 
        onClick={() => router.push('/admin/products')}
        className="mb-6 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        ← Back to Products
      </Button>
      
      {/* Product Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              <InlineEdit
                value={product.name}
                onSave={(value) => updateProductField('name', value)}
                field="Name"
              />
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600 font-medium">SKU:</span>
              <InlineEdit
                value={product.sku}
                onSave={(value) => updateProductField('sku', value)}
                field="SKU"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Image Section */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Image</h3>
            {product.image_path ? (
              <Image
                src={product.image_path}
                alt={product.name}
                width={250}
                height={250}
                className="rounded-lg border w-full mb-4"
              />
            ) : (
              <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 rounded-lg border mb-4">
                <div className="text-center">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No image uploaded</p>
                </div>
              </div>
            )}
            <form
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  handleImageUpload(file)
                }
              }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700 block">Upload New Image</label>
              <input 
                type="file" 
                accept="image/*" 
                className="text-sm w-full border border-gray-300 rounded-lg p-2 bg-white hover:border-blue-400 transition-colors file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
              />
            </form>
          </div>
        </div>

        {/* Product Information */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">Category</span>
              </div>
              <InlineEdit
                value={product.category}
                onSave={(value) => updateProductField('category', value)}
                field="Category"
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">Reorder Threshold</span>
              </div>
              <InlineEdit
                value={product.reorder_threshold}
                onSave={(value) => updateProductField('reorder_threshold', value)}
                type="number"
                field="Reorder Threshold"
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">Selling Price</span>
              </div>
              <InlineEdit
                value={product.unit_price}
                onSave={(value) => updateProductField('unit_price', value)}
                type="number"
                field="Selling Price"
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">Notes</span>
              </div>
              <InlineEdit
                value={product.notes || 'No notes added'}
                onSave={(value) => updateProductField('notes', value)}
                field="Notes"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Information Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Vendor Information</h2>
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Vendor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Stock Qty</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Lead Time</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Payment Terms</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Notes</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorInfos.map((info) => (
                <tr key={info.vendor_id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{info.vendor_name}</div>
                      <div className="text-gray-500 text-xs">{info.vendor_email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{info.stock_quantity || 0}</td>
                  <td className="px-4 py-3 font-medium">${Number(info.unit_price || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">{info.lead_time_days || 0} days</td>
                  <td className="px-4 py-3">{info.payment_terms || '—'}</td>
                  <td className="px-4 py-3">{info.vendor_notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/vendors/${info.vendor_id}`)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      >
                        View
                      </Button>
                      <VendorTermsModal
                        productId={info.product_id}
                        vendorId={info.vendor_id}
                        defaultValues={{
                          unit_price: info.unit_price,
                          lead_time_days: info.lead_time_days,
                          payment_terms: info.payment_terms,
                          notes: info.vendor_notes
                        }}
                        onSaved={handleVendorTermsUpdate}
                        trigger={
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="bg-gray-100 hover:bg-gray-200 border-gray-300"
                          >
                            Edit
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {vendorInfos.map((info) => (
            <div key={info.vendor_id} className="bg-gradient-to-br from-white to-gray-50/30 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{info.vendor_name}</h3>
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-600">{info.vendor_email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50/50 border border-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-xs text-green-700 font-medium">Stock</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">{info.stock_quantity || 0}</span>
                </div>
                
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-xs text-blue-700 font-medium">Price</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">${Number(info.unit_price || 0).toFixed(2)}</span>
                </div>
                
                <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-purple-700 font-medium">Lead Time</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-700">{info.lead_time_days || 0} days</span>
                </div>
                
                <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs text-orange-700 font-medium">Terms</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-700">{info.payment_terms || '—'}</span>
                </div>
                
                {info.vendor_notes && (
                  <div className="col-span-2 bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-xs text-amber-700 font-medium">Notes</span>
                    </div>
                    <span className="text-sm text-amber-900">{info.vendor_notes}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/admin/vendors/${info.vendor_id}`)}
                  className="flex-1 h-12 bg-white border-2 border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out"
                >
                  View Vendor
                </Button>
                <VendorTermsModal
                  productId={info.product_id}
                  vendorId={info.vendor_id}
                  defaultValues={{
                    unit_price: info.unit_price,
                    lead_time_days: info.lead_time_days,
                    payment_terms: info.payment_terms,
                    notes: info.vendor_notes
                  }}
                  onSaved={handleVendorTermsUpdate}
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
          ))}
        </div>
      </div>

      {/* Barcode Section */}
      {product.id && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Product Barcode</h3>
          <div className="flex justify-center">
            <BarcodeImage productId={product.id} />
          </div>
        </div>
      )}

      {/* Selling Price Update Confirmation Dialog */}
      {priceUpdateConfirm && (
        <Dialog open={priceUpdateConfirm.show} onOpenChange={() => setPriceUpdateConfirm(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Update Selling Price
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-gray-700 mb-4">
                You are about to change the selling price from ${Number(product?.unit_price || 0).toFixed(2)} to ${Number(priceUpdateConfirm.value).toFixed(2)} for SKU "{priceUpdateConfirm.sku}".
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 font-medium mb-1">Impact:</p>
                <p className="text-xs text-amber-700">
                  All products with this SKU will be updated to have the same selling price to maintain consistency across your inventory.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setPriceUpdateConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmPriceUpdate}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                Yes, Update Price
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  )
}
