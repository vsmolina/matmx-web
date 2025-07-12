'use client'

import { Order } from '@/types/OrderTypes'
import { Button } from '@/components/ui/button'
import OrderDetailsDialog from './OrderDetailsDialog'
import { useState } from 'react'
import { formatDate } from '@/lib/date'
import { toast } from 'react-hot-toast'

type FulfillmentStatus = 'draft' | 'received' | 'packed' | 'fulfilled'

export default function OrderCard({
  order,
  onUpdated
}: {
  order: Order
  onUpdated: () => void
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [status, setStatus] = useState<FulfillmentStatus>(order.status)

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
    <div className="border rounded-lg p-4 shadow-sm bg-white space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Order #{order.id}</h2>
          <p className="text-sm text-muted-foreground">{order.customer_name}</p>
          <p className="text-sm text-muted-foreground">
            Total: ${Number(order.total).toFixed(2)}
          </p>
        </div>

        <div className="flex gap-2">
          <select
            className="border px-2 py-1 rounded text-sm"
            value={status}
            onChange={(e) => updateStatus(e.target.value as FulfillmentStatus)}
          >
            <option value="received">Received</option>
            <option value="packed">Packed</option>
            <option value="fulfilled">Fulfilled</option>
          </select>

          <Button size="sm" variant="outline" onClick={() => setDetailsOpen(true)}>
            View
          </Button>
        </div>
      </div>

      {status === 'fulfilled' && order.fulfillment_date && (
        <p className="text-sm text-green-700">
          Fulfilled on {formatDate(order.fulfillment_date)}
        </p>
      )}

      <OrderDetailsDialog
        orderId={order.id}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onUpdated={onUpdated}
      />
    </div>
  )
}
