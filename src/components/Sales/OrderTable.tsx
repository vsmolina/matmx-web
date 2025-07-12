'use client'

import { Order } from '@/types/OrderTypes'
import OrderCard from './OrderCard'
import OrderDetailsDialog from './OrderDetailsDialog'
import { useState } from 'react'
import { formatDate } from '@/lib/date'
import { toast } from 'react-hot-toast'

type FulfillmentStatus = 'draft' | 'received' | 'packed' | 'fulfilled'

export default function OrderTable({
  orders,
  onUpdated
}: {
  orders: Order[]
  onUpdated: () => void
}) {
  const activeOrders = orders.filter(
    (order) => !(order.status === 'fulfilled' && order.fulfillment_date)
  )

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)

  const updateStatus = async (orderId: number, newStatus: FulfillmentStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/sales/orders/${orderId}`, {
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
      onUpdated()
    } catch (err) {
      console.error(err)
      toast.error('Could not update status')
    }
  }

  console.log('Active Orders:', activeOrders)

  return (
    <>
      {/* Mobile view: cards */}
      <div className="block md:hidden space-y-4">
        {activeOrders.map((order) => (
          <OrderCard key={order.id} order={order} onUpdated={onUpdated} />
        ))}
        {activeOrders.length === 0 && (
          <p className="text-sm text-muted-foreground">No active orders</p>
        )}
      </div>

      {/* Desktop view: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2">Order #</th>
              <th className="text-left px-4 py-2">Customer</th>
              <th className="text-left px-4 py-2">Total</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Fulfilled</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeOrders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2 font-medium">#{order.id}</td>
                <td className="px-4 py-2">{order.customer_name}</td>
                <td className="px-4 py-2">${order.total != null ? `$${Number(order.total).toFixed(2)}` : '—'}</td>
                <td className="px-4 py-2">
                  <select
                    className="border rounded px-2 py-1"
                    defaultValue={order.status}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value as FulfillmentStatus)
                    }
                  >
                    <option value="received">Received</option>
                    <option value="backordered">Backordered</option>
                    <option value="fulfilled">Fulfilled</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  {order.fulfillment_date ? formatDate(order.fulfillment_date) : '—'}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activeOrders.length === 0 && (
          <p className="text-sm text-muted-foreground px-4 py-2">No active orders</p>
        )}
      </div>

      {selectedOrderId && (
        <OrderDetailsDialog
          orderId={selectedOrderId}
          open={true}
          onClose={() => setSelectedOrderId(null)}
          onUpdated={onUpdated}
        />
      )}
    </>
  )
}
