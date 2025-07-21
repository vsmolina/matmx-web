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
      const res = await fetch('http://localhost:4000/api/crm', { credentials: 'include' })
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
      const res = await fetch('http://localhost:4000/api/inventory', { credentials: 'include' })
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`)
      }
      const data = await res.json()
      setProducts(data.products || [])
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
    
    console.log('Creating quote with payload:', payload)

    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/sales/quotes', {
        method: 'POST',
        credentials: 'include',
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Quote</DialogTitle>
            <DialogDescription>
              Create a new sales quote by selecting a customer and adding products with quantities.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Customer</label>
              <select
                value={selectedCustomer || ''}
                onChange={(e) => setSelectedCustomer(Number(e.target.value))}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="" disabled>Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Quote Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Valid Until</label>
                <Input 
                  type="date" 
                  value={validUntil} 
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Delivery Date</label>
                <Input 
                  type="date" 
                  value={deliveryDate} 
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Button variant="outline" onClick={() => setShowItemDialog(true)}>
                {items.length === 0 ? 'Add Products' : `Edit ${items.length} Item(s)`}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCreate} disabled={loading || !selectedCustomer || items.length === 0}>
              Create Quote
            </Button>
          </DialogFooter>
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
