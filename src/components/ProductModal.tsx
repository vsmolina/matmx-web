'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import AdjustInventoryModal from '@/components/AdjustInventoryModal'
import { apiCall } from '@/lib/api'

interface Product {
  id?: number
  name: string
  sku: string
  vendor?: number  // Backend field name
  vendor_id: number  // Form field name
  reorder_threshold: number
  unit_price: number  // Vendor price
  vendor_price?: number  // Alternative vendor price field for imported products
  selling_price: number  // Product selling price
  category: string
  notes?: string
  initial_stock: number
  quantity?: number  // Current vendor quantity (for edit mode)
  lead_time_days: number
  payment_terms: string
  vendor_notes?: string
  vendors?: Array<{
    id: number
    name: string
    email: string
    unit_price: number
    lead_time_days: number
    payment_terms: string
    notes: string
  }>
}

interface Vendor {
  id: number
  name: string
}

interface Props {
  mode: 'add' | 'edit'
  defaultValues?: Product
  onSave: () => void
  trigger: React.ReactNode
}

export default function ProductModal({ mode, defaultValues, onSave, trigger }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm<Product>({
    defaultValues: defaultValues ? {
      ...defaultValues,
      vendor_id: defaultValues.vendor_id || defaultValues.vendor || 0,
      initial_stock: mode === 'edit' ? (defaultValues.quantity || 0) : (defaultValues.initial_stock || 0),
      // Ensure vendor price is properly mapped for imported products
      unit_price: defaultValues.vendor_price || defaultValues.unit_price || 0,
      selling_price: defaultValues.selling_price || defaultValues.unit_price || 0
    } : {
      name: '',
      sku: '',
      vendor_id: 0,
      reorder_threshold: 0,
      unit_price: 0,
      selling_price: 0,
      category: '',
      notes: '',
      initial_stock: 0,
      lead_time_days: 0,
      payment_terms: '',
      vendor_notes: ''
    }
  })

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null)
  const [currentStock, setCurrentStock] = useState<number>(0)
  const [isGeneratingBarcode, setIsGeneratingBarcode] = useState<boolean>(false)
  const [priceConflict, setPriceConflict] = useState<{
    show: boolean
    data: any
    payload: any
  }>({ show: false, data: null, payload: null })

  // Load vendors
  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await apiCall('/api/vendors')
        const data = await res.json()
        setVendors(data.vendors || [])
      } catch (err) {
        console.error('Failed to load vendors', err)
      }
    }
    fetchVendors()
  }, [])

  // Fetch barcode for edit mode
  const fetchBarcode = async (productId: number) => {
    try {
      const res = await apiCall(`/api/inventory/${productId}/barcode.png`, { 
        headers: { 'Accept': 'image/png' }
      })
      
      if (!res.ok) {
        if (res.status === 404) {
        } else {
          console.error('Failed to fetch barcode, status:', res.status)
        }
        setBarcodeDataUrl(null)
        return
      }
      
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setBarcodeDataUrl(url)
    } catch (err) {
      console.error('Error fetching barcode:', err)
      setBarcodeDataUrl(null)
    }
  }

  // Preload data for edit mode
  useEffect(() => {
    async function preloadTerms() {
      if (mode === 'edit' && defaultValues?.id) {
        const vendorId = defaultValues.vendor_id || defaultValues.vendor;
        
        // Set selling price from the product data
        if (defaultValues.unit_price) {
          setValue('selling_price', defaultValues.unit_price)
        }
        
        // First, check if vendor data is already in defaultValues
        if (defaultValues.vendors && defaultValues.vendors.length > 0) {
          // Find the vendor data that matches the current vendor
          const currentVendor = defaultValues.vendors.find(
            (v: any) => v.id === vendorId
          )
          if (currentVendor) {
            setValue('unit_price', currentVendor.unit_price)
            setValue('lead_time_days', currentVendor.lead_time_days)
            setValue('payment_terms', currentVendor.payment_terms)
            setValue('vendor_notes', currentVendor.notes || '')
          }
        } else if (vendorId) {
          // Fallback to fetching vendor terms if not provided
          try {
            const res = await apiCall(`/api/inventory/${defaultValues.id}/vendor-terms`)
            if (res.ok) {
              const vendorTermsList = await res.json()
              // Find the terms for the current vendor
              const currentVendorTerms = vendorTermsList.find(
                (terms: any) => terms.vendor_id === vendorId
              )
              if (currentVendorTerms) {
                setValue('unit_price', currentVendorTerms.unit_price)
                setValue('lead_time_days', currentVendorTerms.lead_time_days)
                setValue('payment_terms', currentVendorTerms.payment_terms)
                setValue('vendor_notes', currentVendorTerms.notes || '')
              }
            } else if (res.status !== 404) {
              console.error('Failed to fetch vendor terms, status:', res.status)
            }
          } catch (err) {
            console.error('Failed to fetch vendor terms for product', err)
          }
        }
        
        // Fetch barcode (non-blocking)
        fetchBarcode(defaultValues.id).catch(err => {
          console.error('Barcode fetch failed:', err)
        })
      }
    }

    if (defaultValues) {
      // Ensure vendor_id is set from vendor field if needed and price fields are properly mapped
      const formData = {
        ...defaultValues,
        vendor_id: defaultValues.vendor_id || defaultValues.vendor || 0,
        initial_stock: mode === 'edit' ? (defaultValues.quantity || 0) : (defaultValues.initial_stock || 0),
        // Ensure vendor price is properly mapped for imported products
        unit_price: defaultValues.vendor_price || defaultValues.unit_price || 0,
        selling_price: defaultValues.selling_price || defaultValues.unit_price || 0,
        // Ensure all text fields have defaults to prevent undefined
        name: defaultValues.name || '',
        sku: defaultValues.sku || '',
        category: defaultValues.category || '',
        notes: defaultValues.notes || '',
        payment_terms: defaultValues.payment_terms || '',
        vendor_notes: defaultValues.vendor_notes || '',
        lead_time_days: defaultValues.lead_time_days || 0,
        reorder_threshold: defaultValues.reorder_threshold || 0
      };
      reset(formData);
      
      // Set current stock for inventory adjustment
      if (mode === 'edit') {
        setCurrentStock(defaultValues.quantity || 0);
      }
    }
    preloadTerms()
  }, [defaultValues, reset, mode, setValue])

  // Auto-fill terms on vendor select (add mode only)
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'vendor_id' && mode === 'add' && value.vendor_id) {
        // Delay fetching slightly to prevent racing on render
        setTimeout(async () => {
          try {
            const res = await apiCall(`/api/vendors/${value.vendor_id}/default-terms`)
            if (res.ok) {
              const terms = await res.json()
              setValue('lead_time_days', terms.lead_time_days)
              setValue('payment_terms', terms.payment_terms)
              setValue('vendor_notes', terms.vendor_notes || '')
            }
          } catch (err) {
            console.error('Failed to autofill vendor terms', err)
          }
        }, 100) // small debounce to break render cycle
      }
    })

    return () => subscription.unsubscribe?.()
  }, [watch, setValue, mode])

  // Function to refresh current stock after inventory adjustment
  const refreshCurrentStock = async () => {
    if (mode === 'edit' && defaultValues?.id && defaultValues?.vendor_id) {
      try {
        const res = await apiCall('/api/inventory');
        const data = await res.json();
        const products = data.products || [];
        
        // Find the current product/vendor combination
        const currentProduct = products.find((p: any) => 
          p.product_id === defaultValues.id && p.vendor_id === defaultValues.vendor_id
        );
        
        if (currentProduct) {
          setCurrentStock(currentProduct.quantity);
          setValue('initial_stock', currentProduct.quantity);
        }
      } catch (err) {
        console.error('Failed to refresh current stock:', err);
      }
    }
  };

  // Generate barcode for product
  const generateBarcode = async () => {
    if (!defaultValues?.id) {
      toast.error('Product ID is required to generate barcode')
      return
    }

    setIsGeneratingBarcode(true)
    try {
      const res = await apiCall('/api/inventory/barcodes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: [defaultValues.id] })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to generate barcode')
      }

      const result = await res.json()
      const productResult = result.results?.[0]
      
      if (productResult?.success) {
        toast.success('Barcode generated successfully')
        // Fetch the new barcode image
        await fetchBarcode(defaultValues.id)
      } else {
        throw new Error(productResult?.error || 'Failed to generate barcode')
      }
    } catch (err) {
      console.error('Error generating barcode:', err)
      toast.error(err instanceof Error ? err.message : 'Error generating barcode')
    } finally {
      setIsGeneratingBarcode(false)
    }
  }

  // Cleanup barcode URL on unmount
  useEffect(() => {
    return () => {
      if (barcodeDataUrl) {
        URL.revokeObjectURL(barcodeDataUrl)
      }
    }
  }, [barcodeDataUrl])

  const handleForceSave = async () => {
    if (!priceConflict.payload) return
    
    try {
      const res = await apiCall(
        mode === 'add'
          ? '/api/inventory/force'
          : `/api/inventory/${defaultValues?.id}/force`,
        {
          method: mode === 'add' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(priceConflict.payload)
        }
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to save product')
      }
      
      toast.success(`Product ${mode === 'add' ? 'created' : 'updated'} successfully`)
      setPriceConflict({ show: false, data: null, payload: null })
      onSave()
    } catch (err) {
      console.error('Error force saving product:', err)
      toast.error(err instanceof Error ? err.message : 'Error saving product')
    }
  }

  const onSubmit = async (data: Product) => {
    try {
      // In edit mode, exclude initial_stock from the payload since it should only be changed via AdjustInventoryModal
      let payload: any = { ...data };
      if (mode === 'edit') {
        const { initial_stock, ...rest } = payload;
        payload = rest;
      }
      
      // Ensure we have a valid product ID for edit mode
      if (mode === 'edit' && !defaultValues?.id) {
        toast.error('Product ID is missing. Cannot update product.');
        return;
      }
      
      
      const res = await apiCall(
        mode === 'add'
          ? '/api/inventory'
          : `/api/inventory/${defaultValues?.id}`,
        {
          method: mode === 'add' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        
        // Handle price conflict (expected behavior, don't log as error)
        if (res.status === 409 && errorData.error === 'PRICE_CONFLICT') {
          setPriceConflict({
            show: true,
            data: errorData,
            payload: payload
          })
          return
        }
        
        // Log actual errors
        console.error('Backend error:', errorData)
        throw new Error(errorData.error || 'Failed to save product')
      }
      
      toast.success(`Product ${mode === 'add' ? 'created' : 'updated'} successfully`)
      onSave()
    } catch (err) {
      console.error('Error saving product:', err)
      toast.error(err instanceof Error ? err.message : 'Error saving product')
    }
  }

  return (
    <>
      <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full mx-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {mode === 'add' ? 'Add New Product' : 'Edit Product'}
              </DialogTitle>
              <p className="text-sm text-gray-600">
                {mode === 'add' ? 'Create a new product with vendor information' : 'Update product and vendor details'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Basic Product Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Product Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Product Name</label>
                <Input 
                  {...register('name')} 
                  placeholder="Enter product name"
                  required 
                  className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">SKU</label>
                <Input 
                  {...register('sku')} 
                  placeholder="Enter unique SKU"
                  required 
                  className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Input 
                  {...register('category')} 
                  placeholder="e.g. Electronics, Tools, etc."
                  className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                <Input 
                  {...register('notes')} 
                  placeholder="Additional product details"
                  className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Vendor Selection */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Vendor Selection
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Select Vendor</label>
                <div className="relative">
                  <select
                    className="w-full h-12 md:h-11 border-2 border-gray-200 rounded-lg px-4 pr-10 text-base md:text-sm bg-white focus:border-purple-400 focus:outline-none transition-colors appearance-none cursor-pointer shadow-sm hover:border-purple-300"
                    {...register('vendor_id', { valueAsNumber: true })}
                  >
                    <option value="">-- Choose a vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id} className="py-2">{v.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <Link href="/admin/vendors" className="w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full sm:w-auto h-12 md:h-11 bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Vendor
                </Button>
              </Link>
            </div>
          </div>

          {/* Inventory & Pricing */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventory & Pricing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {mode === 'edit' ? 'Current Stock' : 'Initial Stock'}
                </label>
                <div className="flex gap-2 sm:gap-3 items-center flex-wrap sm:flex-nowrap">
                  <Input 
                    type="number" 
                    {...register('initial_stock', { valueAsNumber: true })} 
                    placeholder="0"
                    required 
                    readOnly={mode === 'edit'}
                    className={`h-11 border-2 focus:border-green-400 ${
                      mode === 'edit' 
                        ? 'bg-gray-50 border-gray-300 cursor-not-allowed' 
                        : 'bg-white border-gray-200'
                    }`}
                  />
                  {mode === 'edit' && defaultValues?.id && defaultValues?.vendor_id && (
                    <AdjustInventoryModal
                      productId={defaultValues.id}
                      vendorId={defaultValues.vendor_id}
                      vendorName={vendors.find(v => v.id === defaultValues.vendor_id)?.name || 'Unknown Vendor'}
                      currentStock={currentStock}
                      onSave={async () => {
                        await refreshCurrentStock();
                        onSave();
                      }}
                      trigger={
                        <Button 
                          type="button" 
                          variant="outline"
                          className="h-11 bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                          Adjust
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Reorder Threshold</label>
                <Input 
                  type="number" 
                  {...register('reorder_threshold', { valueAsNumber: true })} 
                  placeholder="e.g. 10"
                  required 
                  className="h-11 border-2 border-gray-200 focus:border-green-400 bg-white"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Vendor Price ($)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  {...register('unit_price', { valueAsNumber: true })} 
                  placeholder="0.00"
                  required 
                  className="h-11 border-2 border-gray-200 focus:border-green-400 bg-white"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Selling Price ($)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  {...register('selling_price', { valueAsNumber: true })} 
                  placeholder="0.00"
                  required 
                  className="h-11 border-2 border-gray-200 focus:border-green-400 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Vendor Terms */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Vendor Terms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Lead Time (Days)</label>
                <Input 
                  type="number" 
                  {...register('lead_time_days', { valueAsNumber: true })} 
                  placeholder="e.g. 14"
                  required 
                  className="h-11 border-2 border-gray-200 focus:border-orange-400 bg-white"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Terms</label>
                <Input 
                  {...register('payment_terms')} 
                  placeholder="e.g. Net 30, COD, etc."
                  required 
                  className="h-11 border-2 border-gray-200 focus:border-orange-400 bg-white"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Vendor Notes</label>
                <Input 
                  {...register('vendor_notes')} 
                  placeholder="Additional vendor-specific notes"
                  className="h-11 border-2 border-gray-200 focus:border-orange-400 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'add' ? 'Creating...' : 'Updating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {mode === 'add' ? 'Create Product' : 'Update Product'}
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Barcode Preview */}
        {mode === 'edit' && defaultValues?.id && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Product Barcode
            </h3>
            <div className="flex justify-center">
              {barcodeDataUrl ? (
                <div
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={generateBarcode}
                  title="Click to regenerate barcode"
                >
                  <img
                    src={barcodeDataUrl}
                    alt="Product Barcode"
                    className="border border-gray-300 bg-white p-3 rounded-lg shadow-sm max-w-full h-auto"
                    style={{ maxWidth: '280px', height: 'auto' }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 p-6 w-full max-w-[280px] h-[80px] flex items-center justify-center text-gray-500 text-sm rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={generateBarcode}
                  disabled={isGeneratingBarcode}
                >
                  <div className="text-center">
                    {isGeneratingBarcode ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Generating...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <svg className="h-8 w-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <span>Click to generate barcode</span>
                      </div>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
      </Dialog>

      {/* Price Conflict Confirmation Dialog */}
    {priceConflict.show && (
      <Dialog open={priceConflict.show} onOpenChange={() => setPriceConflict({ show: false, data: null, payload: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-amber-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Selling Price Conflict
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-700 mb-4">
              {priceConflict.data?.message}
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800 font-medium mb-1">Impact:</p>
              <p className="text-xs text-amber-700">
                All products with this SKU will be updated to have the same selling price to maintain consistency.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setPriceConflict({ show: false, data: null, payload: null })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleForceSave}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              disabled={isSubmitting}
            >
              Yes, Update Price
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}
