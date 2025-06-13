'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import SelectQuoteItemsDialog from './SelectQuoteItmesDialog'// ensure correct path

interface CreateQuoteDialogProps {
  onCreated: () => void
}

interface Customer {
  id: number
  name: string
  payment_terms?: string
  contact_name?: string
}

interface QuoteItem {
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
}

export default function CreateQuoteDialog({ onCreated }: CreateQuoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState({
    customer_id: '',
    title: '',
    valid_until: '',
    delivery_date: '',
    customer_note: '',
    internal_note: '',
    items: [] as QuoteItem[],
  })

  const total = form.items.reduce((sum, item) => sum + item.total_price, 0)

  useEffect(() => {
    if (open && !form.valid_until) {
      const today = new Date()
      today.setDate(today.getDate() + 30)
      const iso = today.toISOString().split('T')[0]
      setForm(prev => ({ ...prev, valid_until: iso }))
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    fetch('http://localhost:4000/api/crm/', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data)
        } else if (Array.isArray(data.customers)) {
          setCustomers(data.customers)
        } else {
          toast.error('Unexpected response format')
          setCustomers([])
        }
      })
      .catch(() => {
        toast.error('Failed to load customers')
        setCustomers([])
      })
  }, [open])

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const handleCustomerSelect = async (id: string) => {
    setForm(prev => ({ ...prev, customer_id: id }))
    try {
      const res = await fetch(`http://localhost:4000/api/crm/customers/${id}`, {
        credentials: 'include',
      })
      const data = await res.json()
      setForm(prev => ({
        ...prev,
        customer_note: data.default_note || '',
      }))
    } catch {
      toast.error('Failed to fetch customer info')
    }
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/sales/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, total }),
      })

      if (!res.ok) throw new Error('Quote creation failed')
      toast.success('Quote created')
      setOpen(false)
      onCreated()
    } catch (err) {
      toast.error('Error creating quote')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">New Quote</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="customer_id">Customer</Label>
            <Select value={form.customer_id} onValueChange={handleCustomerSelect}>
              <SelectTrigger id="customer_id">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(cust => (
                  <SelectItem key={cust.id} value={String(cust.id)}>
                    {cust.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Quote Title</Label>
            <Input id="title" value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>

          <div>
            <Label htmlFor="valid_until">Valid Until</Label>
            <Input id="valid_until" type="date" value={form.valid_until} onChange={(e) => handleChange('valid_until', e.target.value)} />
          </div>

          <div>
            <Label htmlFor="delivery_date">Delivery Date</Label>
            <Input id="delivery_date" type="date" value={form.delivery_date} onChange={(e) => handleChange('delivery_date', e.target.value)} />
          </div>

          <div>
            <Label htmlFor="customer_note">Customer Note</Label>
            <Textarea id="customer_note" value={form.customer_note} onChange={(e) => handleChange('customer_note', e.target.value)} />
          </div>

          <div>
            <Label htmlFor="internal_note">Internal Note</Label>
            <Textarea id="internal_note" value={form.internal_note} onChange={(e) => handleChange('internal_note', e.target.value)} />
          </div>

          <div>
            <Label>Products</Label>
            <Button type="button" variant="outline" onClick={() => setShowItemDialog(true)}>
              Add Products
            </Button>
          </div>

          <div className="text-right text-sm font-semibold">
            Total: ${total.toFixed(2)}
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Create Quote
        </Button>

        <SelectQuoteItemsDialog
          open={showItemDialog}
          onClose={() => setShowItemDialog(false)}
          onConfirm={(items) => {
            setForm(prev => ({ ...prev, items }))
            setShowItemDialog(false)
          }}
          initialItems={form.items}
        />
      </DialogContent>
    </Dialog>
  )
}
