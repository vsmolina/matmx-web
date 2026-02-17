'use client'

import { Button } from '@/components/ui/button'
import { FileText, Mail, Download, RefreshCw, Eye, User, Calendar, DollarSign } from 'lucide-react'
import SendQuoteEmailButton from './SendQuoteEmailButton'
import GenerateOrViewPDFButton from './GenerateOrViewPDFButton'
import { Quote } from '@/types/QuoteTypes'
import toast from 'react-hot-toast'
import { apiCall } from '@/lib/api'

interface QuoteCardProps {
  quote: Quote
  onView: (quoteId: number) => void
  onClose?: (quoteId: number) => void
  onConvert?: (quoteId: number) => void
}

export default function QuoteCard({ quote, onView, onClose, onConvert }: QuoteCardProps) {
  const total =
    typeof quote.total === 'number'
      ? quote.total
      : parseFloat(quote.total as string || '0')

  const handleConvert = async () => {
    try {
      const res = await apiCall(`/api/sales/quotes/${quote.id}/convert`, { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success('Quote converted to order')
      onConvert?.(quote.id)
    } catch (err) {
      toast.error('Failed to convert quote')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Quote #{quote.id}</h3>
            {quote.title && <p className="text-sm text-gray-600">{quote.title}</p>}
          </div>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
          (quote as any).status === 'sent' ? 'bg-blue-100 text-blue-700' :
          (quote as any).status === 'draft' ? 'bg-gray-100 text-gray-700' :
          (quote as any).status === 'expired' ? 'bg-red-100 text-red-700' :
          (quote as any).status === 'converted' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {quote.status}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Customer</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{quote.customer_name}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Rep</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{quote.rep_name}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Valid Until</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{quote.valid_until?.slice(0, 10) || '—'}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Delivery</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{quote.delivery_date?.slice(0, 10) || '—'}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700 font-medium">Total</span>
          </div>
          <span className="text-lg font-bold text-green-700">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onView(quote.id)} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button onClick={handleConvert} variant="outline" className="border-gray-300 hover:border-green-400 hover:text-green-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Convert
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <GenerateOrViewPDFButton quoteId={quote.id} />
          <SendQuoteEmailButton quoteId={quote.id} customerEmail={quote.customer_email} />
        </div>
      </div>
    </div>
  )
}
