'use client'
import { getApiBaseUrl } from '@/lib/api'

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
import { Edit, FileText } from 'lucide-react'
import { apiCall } from '@/lib/api'

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setQuote(null)
      return
    }
    
    setLoading(true)
    apiCall(`/api/sales/quotes/${quoteId}`)
      .then(res => res.json())
      .then(data => {
        setQuote(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching quote:', error)
        toast.error('Failed to load quote')
        setLoading(false)
      })
  }, [quoteId, open])

  const handleSave = async () => {
    if (!quote) return
    
    const res = await fetch(`${getApiBaseUrl()}/api/sales/quotes/${quoteId}`, {
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

  const total = quote?.items?.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) || 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-3xl mx-auto rounded-2xl overflow-hidden p-0 md:w-[800px] md:max-w-none [&>button]:hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {loading ? 'Loading...' : quote ? `Edit Quote #${quote.id}` : 'Quote Details'}
                </DialogTitle>
                <p className="text-green-100 text-sm mt-1">
                  {quote?.customer_name ? `Customer: ${quote.customer_name}` : 'Edit quote information and line items'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
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
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading quote details...</p>
            </div>
          ) : !quote ? (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 font-medium">Failed to load quote details</div>
                <p className="text-red-500 text-sm mt-1">Please try again or contact support</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
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
                value={quote.customer_note || ''}
                onChange={(e) => setQuote({ ...quote, customer_note: e.target.value })}
              />
            </div>
            <div>
              <Label>Internal Note</Label>
              <Textarea
                value={quote.internal_note || ''}
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl"
            >
              Save Changes
            </Button>
            </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
