'use client'

import { Order } from '@/types/OrderTypes'
import OrderCard from './OrderCard'
import OrderDetailsDialog from './OrderDetailsDialog'
import { useState } from 'react'
import { formatDate } from '@/lib/date'
import { toast } from 'react-hot-toast'
import { Calendar, Check, X, ShoppingCart } from 'lucide-react'

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
  const [editingFulfillmentId, setEditingFulfillmentId] = useState<number | null>(null)
  const [tempDate, setTempDate] = useState<string>('')

  console.log('All orders:', orders)
  console.log('Active orders:', activeOrders)
  console.log('Selected order ID:', selectedOrderId)

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

  const updateFulfillmentDate = async (orderId: number, date: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/sales/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fulfillment_date: date ? new Date(date).toISOString() : null
        })
      })

      if (!res.ok) throw new Error('Failed to update fulfillment date')

      toast.success('Fulfillment date updated')
      onUpdated()
    } catch (err) {
      console.error(err)
      toast.error('Could not update fulfillment date')
    }
  }

  const handleDateClick = (order: any) => {
    setEditingFulfillmentId(order.id)
    setTempDate(order.fulfillment_date ? order.fulfillment_date.slice(0, 10) : '')
  }

  const handleDateSave = (orderId: number) => {
    updateFulfillmentDate(orderId, tempDate)
    setEditingFulfillmentId(null)
    setTempDate('')
  }

  const handleDateCancel = () => {
    setEditingFulfillmentId(null)
    setTempDate('')
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
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-base font-medium">No active orders found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          </div>
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
              <th className="text-left px-4 py-2">Fulfilment date</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeOrders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2 font-medium">#{order.id}</td>
                <td className="px-4 py-2">{order.customer_name}</td>
                <td className="px-4 py-2">${order.total != null ? `${Number(order.total).toFixed(2)}` : '—'}</td>
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
                  {editingFulfillmentId === order.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={tempDate}
                        onChange={(e) => setTempDate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleDateSave(order.id)
                          } else if (e.key === 'Escape') {
                            handleDateCancel()
                          }
                        }}
                        className="border rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleDateSave(order.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleDateCancel}
                        className="text-red-600 hover:text-red-800"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1"
                      onClick={() => handleDateClick(order)}
                    >
                      {order.fulfillment_date ? (
                        <span className="hover:text-blue-600">
                          {formatDate(order.fulfillment_date)}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                          <Calendar size={14} />
                          <span>Set date</span>
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      console.log('View button clicked for order:', order.id)
                      setSelectedOrderId(order.id)
                    }}
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
