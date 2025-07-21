'use client'

import { Order } from '@/types/OrderTypes'
import { Button } from '@/components/ui/button'
import OrderDetailsDialog from './OrderDetailsDialog'
import { useState } from 'react'
import { formatDate } from '@/lib/date'
import { toast } from 'react-hot-toast'
import { ShoppingCart, DollarSign, Calendar, Eye } from 'lucide-react'

type FulfillmentStatus = 'draft' | 'received' | 'packed' | 'fulfilled'

export default function OrderCard({
  order,
  onUpdated
}: {
  order: Order
  onUpdated: () => void
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [status, setStatus] = useState<FulfillmentStatus>(order.status || 'received')

  const updateStatus = async (newStatus: FulfillmentStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/sales/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          fulfillment_date: newStatus === 'fulfilled' ? new Date().toISOString() : null
        })
      })

      if (!res.ok) throw new Error('Failed to update order')

      toast.success(`Order marked as ${newStatus}`)
      setStatus(newStatus)
      onUpdated()
    } catch (err) {
      console.error(err)
      toast.error('Could not update status')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Order #{order.id}</h3>
            <p className="text-sm text-gray-600">{order.customer_name}</p>
          </div>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
          status === 'fulfilled' ? 'bg-green-100 text-green-700' :
          status === 'packed' ? 'bg-yellow-100 text-yellow-700' :
          status === 'received' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {status}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-700 font-medium">Total</span>
          </div>
          <span className="text-lg font-bold text-blue-700">${Number(order.total).toFixed(2)}</span>
        </div>

        {status === 'fulfilled' && order.fulfillment_date && (
          <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 font-medium">Fulfilled</span>
            </div>
            <span className="text-sm font-medium text-green-700">{formatDate(order.fulfillment_date)}</span>
          </div>
        )}
      </div>

      <div className="pt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setDetailsOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            value={status || 'received'}
            onChange={(e) => updateStatus(e.target.value as FulfillmentStatus)}
          >
            <option value="received">Received</option>
            <option value="packed">Packed</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>

      <OrderDetailsDialog
        orderId={order.id}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onUpdated={onUpdated}
      />
    </div>
  )
}
