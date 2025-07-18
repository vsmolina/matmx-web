'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import SendQuoteEmailButton from './SendQuoteEmailButton'
import GenerateOrViewPDFButton from './GenerateOrViewPDFButton'
import { Quote } from '@/types/QuoteTypes'

interface QuoteCardProps {
  quote: Quote
  onView: (quoteId: number) => void
  onClose?: (quoteId: number) => void
}

export default function QuoteCard({ quote, onView, onClose }: QuoteCardProps) {
  const total =
    typeof quote.total === 'number'
      ? quote.total
      : parseFloat(quote.total as string || '0')

  return (
    <div className="bg-white shadow rounded-xl p-4 space-y-2 relative">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">Quote #{quote.id}</h3>
          {quote.title && <p className="text-sm text-muted-foreground">{quote.title}</p>}
        </div>
        <span className="text-sm capitalize text-muted-foreground">{quote.status}</span>
      </div>

      <div className="text-sm space-y-1">
        <p><span className="font-semibold">Customer:</span> {quote.customer_name}</p>
        <p><span className="font-semibold">Rep:</span> {quote.rep_name}</p>
        <p><span className="font-semibold">Valid Until:</span> {quote.valid_until?.slice(0, 10) || '—'}</p>
        <p><span className="font-semibold">Delivery:</span> {quote.delivery_date?.slice(0, 10) || '—'}</p>
        <p><span className="font-semibold">Total:</span> ${total.toFixed(2)}</p>
      </div>

      <div className="pt-2 space-y-2">
        <Button onClick={() => onView(quote.id)} className="w-full">View</Button>
        <GenerateOrViewPDFButton quoteId={quote.id} />
        <SendQuoteEmailButton quoteId={quote.id} customerEmail={quote.customer_email} />
      </div>
    </div>
  )
}
