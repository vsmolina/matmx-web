'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import LineItemEditor from './LineItemEditor'
import PriceSummaryBox from './PriceSummaryBox'
import { toast } from 'react-hot-toast'

interface QuoteItem {
  product_id: number
  quantity: number
  unit_price: number
  markup_percent?: number
  discount_percent?: number
  total_price: number
}

interface Quote {
  id: number
  title?: string
  customer_name?: string
  rep_name?: string
  valid_until?: string
  delivery_date?: string
  customer_note: string
  internal_note: string
  items: QuoteItem[]
}

interface QuoteDetailsDialogProps {
  quoteId: number
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

export default function QuoteDetailsDialog({
  quoteId,
  open,
  onClose,
  onUpdated
}: QuoteDetailsDialogProps) {
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    if (!open) return
    fetch(`http://localhost:4000/api/sales/quotes/${quoteId}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setQuote(data))
      .catch(() => toast.error('Failed to load quote'))
  }, [quoteId, open])

  const handleSave = async () => {
    const res = await fetch(`http://localhost:4000/api/sales/quotes/${quoteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(quote)
    })

    if (res.ok) {
      toast.success('Quote updated')
      onUpdated()
      onClose()
    } else {
      toast.error('Failed to update quote')
    }
  }

  if (!quote) return null

  const total = quote.items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full h-screen sm:max-w-3xl sm:h-auto p-0">
        <div className="relative px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Quote #{quote.id}</DialogTitle>
            <DialogDescription className="sr-only">
              Edit quote information and line items
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-64px)] px-4 sm:px-6 space-y-6 pb-6">
          {/* Static Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
            <div>
              <Label>Customer</Label>
              <p>{quote.customer_name || '—'}</p>
            </div>
            <div>
              <Label>Rep</Label>
              <p>{quote.rep_name || '—'}</p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input
                value={quote.title || ''}
                onChange={(e) => setQuote({ ...quote, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={quote.valid_until?.slice(0, 10) || ''}
                onChange={(e) => setQuote({ ...quote, valid_until: e.target.value })}
              />
            </div>
            <div>
              <Label>Delivery Date</Label>
              <Input
                type="date"
                value={quote.delivery_date?.slice(0, 10) || ''}
                onChange={(e) => setQuote({ ...quote, delivery_date: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Customer Note</Label>
              <Textarea
                value={quote.customer_note}
                onChange={(e) => setQuote({ ...quote, customer_note: e.target.value })}
              />
            </div>
            <div>
              <Label>Internal Note</Label>
              <Textarea
                value={quote.internal_note}
                onChange={(e) => setQuote({ ...quote, internal_note: e.target.value })}
              />
            </div>
          </div>

          {/* Line Items + Totals */}
          <LineItemEditor
            items={quote.items}
            onItemsChange={(items) => setQuote({ ...quote, items })}
          />

          <PriceSummaryBox items={quote.items} />

          <div className="text-right text-muted-foreground pr-1">
            <span className="font-semibold">Quote Total:</span>{' '}
            ${total.toFixed(2)}
          </div>

          <Button onClick={handleSave} className="w-full mt-4">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
