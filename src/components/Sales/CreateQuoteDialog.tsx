'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { Customer } from '@/types/CustomerTypes'
import { Product } from '@/types/ProductTypes'
import SelectQuoteItemsDialog from './SelectQuoteItmesDialog'
import { toast } from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { apiCall } from '@/lib/api'

interface CreateQuoteDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateQuoteDialog({ open, onClose, onCreated }: CreateQuoteDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [items, setItems] = useState<
    { product_id: number; quantity: number; unit_price: number; total_price: number }[]
  >([])
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchCustomers()
      fetchProducts()
    }
  }, [open])

  const fetchCustomers = async () => {
    try {
      const res = await apiCall('/api/crm')
      if (!res.ok) {
        throw new Error(`Failed to fetch customers: ${res.status}`)
      }
      const data = await res.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await apiCall('/api/inventory')
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`)
      }
      const data = await res.json()
      // Transform the data to map selling_price to unit_price
      const transformedProducts = (data.products || []).map((product: any) => ({
        ...product,
        id: product.product_id || product.id,
        unit_price: product.selling_price || product.unit_price || 0,
        stock: product.quantity || product.stock || 0
      }))
      setProducts(transformedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    }
  }

  const resetForm = () => {
    setSelectedCustomer(null)
    setTitle('')
    setValidUntil('')
    setDeliveryDate('')
    setItems([])
    setLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleCreate = async () => {
    if (!selectedCustomer || items.length === 0) return

    const payload = {
      customer_id: selectedCustomer,
      title,
      valid_until: validUntil || null,
      delivery_date: deliveryDate || null,
      items,
    }
    

    setLoading(true)
    try {
      const res = await apiCall('/api/sales/quotes', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Server response:', { status: res.status, statusText: res.statusText, errorText })
        throw new Error(`Failed to create quote (${res.status}): ${errorText}`)
      }
      
      toast.success('Quote created')
      onCreated()
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error creating quote:', error)
      toast.error('Failed to create quote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[90vw] max-w-2xl mx-auto rounded-2xl overflow-hidden p-0 md:w-[700px] md:max-w-none [&>button]:hidden">
          {/* Header with green gradient */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    Create New Quote
                  </DialogTitle>
                  <p className="text-green-100 text-sm mt-1">
                    Create a new sales quote by selecting a customer and adding products
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <select
                  value={selectedCustomer || ''}
                  onChange={(e) => setSelectedCustomer(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="" disabled>Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="focus:border-green-500 focus:ring-green-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                  <Input 
                    type="date" 
                    value={validUntil} 
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full focus:border-green-500 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
                  <Input 
                    type="date" 
                    value={deliveryDate} 
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full focus:border-green-500 focus:ring-green-200"
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
                    <p className="text-xs text-gray-500">Select products and quantities for this quote</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowItemDialog(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                  >
                    {items.length === 0 ? 'Add Products' : 'Add More Products'}
                  </Button>
                </div>
                
                {items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    {items.map((item) => {
                      const product = products.find(p => p.id === item.product_id)
                      return (
                        <div key={item.product_id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate block">
                              {product?.name || `Product #${item.product_id}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.quantity} × ${item.unit_price.toFixed(2)} = ${item.total_price.toFixed(2)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setItems(prev => prev.filter(i => i.product_id !== item.product_id))}
                            className="ml-2 text-red-400 hover:text-red-600 transition-colors p-1"
                            title="Remove product"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                    <div className="text-sm font-medium text-gray-900 text-right pt-1">
                      Total: ${items.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={loading || !selectedCustomer || items.length === 0}
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Quote'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SelectQuoteItemsDialog
        open={showItemDialog}
        onClose={() => setShowItemDialog(false)}
        products={products}
        onSelect={(selected) => {
          const computed = selected.map(i => ({
            ...i,
            total_price: i.unit_price * i.quantity,
          }))
          setItems(computed)
          setShowItemDialog(false)
        }}
        initialItems={items}
      />
    </>
  )
}
