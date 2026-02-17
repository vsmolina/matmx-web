'use client'

import { Order } from '@/types/OrderTypes'
import OrderCard from './OrderCard'
import OrderDetailsDialog from './OrderDetailsDialog'
import { useState } from 'react'
import { formatDate } from '@/lib/date'
import { toast } from 'react-hot-toast'
import { Calendar, Check, X, ShoppingCart, Package, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiCall } from '@/lib/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type FulfillmentStatus = 'draft' | 'received' | 'packed' | 'fulfilled'

export default function OrderTable({
  orders,
  onUpdated
}: {
  orders: Order[]
  onUpdated: () => void
}) {
  const activeOrders = orders.filter(
    (order) => !((order as any).status === 'delivered' && order.fulfillment_date)
  )

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm(`Are you sure you want to delete Order #${orderId}? This cannot be undone.`)) return
    try {
      const res = await apiCall(`/api/sales/orders/${orderId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Order deleted')
      onUpdated()
    } catch (err) {
      toast.error('Failed to delete order')
    }
  }
  const [editingFulfillmentId, setEditingFulfillmentId] = useState<number | null>(null)
  const [tempDate, setTempDate] = useState<string>('')
  const [showConfirmFulfilled, setShowConfirmFulfilled] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null)


  const handleStatusChange = (orderId: number, newStatus: FulfillmentStatus) => {
    if (newStatus === 'fulfilled') {
      setPendingOrderId(orderId)
      setShowConfirmFulfilled(true)
    } else {
      updateStatus(orderId, newStatus)
    }
  }

  const handleConfirmFulfilled = async () => {
    if (!pendingOrderId) return
    
    try {
      const res = await apiCall(`/api/sales/orders/${pendingOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'fulfilled',
          fulfillment_date: new Date().toISOString()
        })
      })

      if (!res.ok) throw new Error('Failed to update order')

      toast.success('Order marked as fulfilled')
      setShowConfirmFulfilled(false)
      setPendingOrderId(null)
      onUpdated()
    } catch (err) {
      console.error(err)
      toast.error('Could not update status')
    }
  }

  const updateStatus = async (orderId: number, newStatus: FulfillmentStatus) => {
    try {
      const res = await apiCall(`/api/sales/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await apiCall(`/api/sales/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value as FulfillmentStatus)
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
                <td className="px-4 py-2 space-x-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setSelectedOrderId(order.id)
                    }}
                  >
                    View
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDeleteOrder(order.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

      {/* Fulfillment Confirmation Modal */}
      <AlertDialog open={showConfirmFulfilled} onOpenChange={setShowConfirmFulfilled}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-gray-900">
                  Mark Order as Fulfilled
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600">
                  This action will mark the order as completed and remove it from active orders.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 my-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Order #{pendingOrderId}</span>
                <p className="text-sm text-blue-600">Will be moved to fulfilled orders</p>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-2 border-gray-300 hover:border-gray-400 transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmFulfilled}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Package className="h-4 w-4 mr-2" />
              Mark as Fulfilled
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
