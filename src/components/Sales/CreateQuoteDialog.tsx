'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
    const res = await fetch('http://localhost:4000/api/crm/customers', { credentials: 'include' })
    const data = await res.json()
    setCustomers(data.customers || [])
  }

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:4000/api/inventory', { credentials: 'include' })
    const data = await res.json()
    setProducts(data.products || [])
  }

  const handleCreate = async () => {
    if (!selectedCustomer || items.length === 0) return

    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/sales/quotes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer,
          title,
          items,
        }),
      })

      if (!res.ok) throw new Error()
      toast.success('Quote created')
      onClose()
      onCreated()
    } catch {
      toast.error('Failed to create quote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Quote</DialogTitle>
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
