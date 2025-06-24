'use client'

import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import QuoteCard from './QuoteCard'
import SendQuoteEmailButton from './SendQuoteEmailButton'
import GenerateOrViewPDFButton from './GenerateOrViewPDFButton'
import toast from 'react-hot-toast'

interface Quote {
  id: number
  title?: string
  customer_name: string
  customer_email: string
  rep_name: string
  status: string
  valid_until?: string
  delivery_date?: string
  total?: number | string | null
}

interface QuoteTableProps {
  quotes: Quote[]
  onView: (quoteId: number) => void
  onConvert: (quoteId: number) => void
}

export default function QuoteTable({
  quotes,
  onView,
  onConvert
}: QuoteTableProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleConvert = async (quoteId: number) => {
    try {
      const res = await fetch(`http://localhost:4000/api/sales/quotes/${quoteId}/convert`, {
        method: 'POST',
        credentials: 'include'
      })
      if (!res.ok) throw new Error()
      toast.success('Quote converted to order')
      onConvert(quoteId)
    } catch (err) {
      toast.error('Failed to convert quote')
    }
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-150px)]">
        {quotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            onView={onView}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden shadow">
      <table className="w-full text-sm bg-white">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-2">Quote #</th>
            <th className="text-left px-4 py-2">Title</th>
            <th className="text-left px-4 py-2">Customer</th>
            <th className="text-left px-4 py-2">Rep</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Valid Until</th>
            <th className="text-left px-4 py-2">Delivery</th>
            <th className="text-right px-4 py-2">Total</th>
            <th className="text-right px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            const total = typeof quote.total === 'number'
              ? quote.total
              : parseFloat(quote.total as string || '0')
            return (
              <tr key={quote.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{quote.id}</td>
                <td className="px-4 py-2">{quote.title || '—'}</td>
                <td className="px-4 py-2">{quote.customer_name}</td>
                <td className="px-4 py-2">{quote.rep_name}</td>
                <td className="px-4 py-2 capitalize">{quote.status}</td>
                <td className="px-4 py-2">{quote.valid_until?.slice(0, 10)}</td>
                <td className="px-4 py-2">{quote.delivery_date?.slice(0, 10)}</td>
                <td className="px-4 py-2 text-right">${total.toFixed(2)}</td>
                <td className="px-4 py-2 text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => onView(quote.id)}>View</Button>
                  <GenerateOrViewPDFButton quoteId={quote.id} />
                  <SendQuoteEmailButton quoteId={quote.id} customerEmail={quote.customer_email} />
                  <Button size="sm" variant="ghost" onClick={() => handleConvert(quote.id)}>Convert</Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
