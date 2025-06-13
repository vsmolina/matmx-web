'use client'

import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import QuoteCard from './QuoteCard'

interface Quote {
  id: number
  title?: string
  customer_name: string
  rep_name: string
  status: string
  valid_until?: string
  delivery_date?: string
  total?: number
}

interface QuoteTableProps {
  quotes: Quote[]
  onView: (quoteId: number) => void
  onConvert: (quoteId: number) => void
  onEmail: (quoteId: number) => void
  onUpload: (quoteId: number) => void
  onClose?: (quoteId: number) => void
}

export default function QuoteTable({
  quotes,
  onView,
  onConvert,
  onEmail,
  onUpload,
  onClose
}: QuoteTableProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-150px)]">
        {quotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            onView={onView}
            onClose={onClose}
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
          {quotes.map((quote) => (
            <tr key={quote.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{quote.id}</td>
              <td className="px-4 py-2">{quote.title || '—'}</td>
              <td className="px-4 py-2">{quote.customer_name}</td>
              <td className="px-4 py-2">{quote.rep_name}</td>
              <td className="px-4 py-2 capitalize">{quote.status}</td>
              <td className="px-4 py-2">{quote.valid_until?.slice(0, 10)}</td>
              <td className="px-4 py-2">{quote.delivery_date?.slice(0, 10)}</td>
              <td className="px-4 py-2 text-right">
                {typeof quote.total === 'number' ? `$${quote.total.toFixed(2)}` : '—'}
              </td>
              <td className="px-4 py-2 text-right space-x-1">
                <Button size="sm" variant="outline" onClick={() => onView(quote.id)}>View</Button>
                <Button size="sm" variant="ghost" onClick={() => onEmail(quote.id)}>Email</Button>
                <Button size="sm" variant="ghost" onClick={() => onConvert(quote.id)}>Convert</Button>
                <Button size="sm" variant="ghost" onClick={() => onUpload(quote.id)}>Upload</Button>
                {onClose && (
                  <Button size="sm" variant="ghost" onClick={() => onClose(quote.id)}>Close</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
