'use client'
import { getApiBaseUrl } from '@/lib/api'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import PriceSummaryBox from './PriceSummaryBox'
import { Package, Truck, Calendar, User, DollarSign } from 'lucide-react'
import { apiCall } from '@/lib/api'

interface OrderItem {
  product_id: number
  quantity: number
  unit_price: number
  discount_percent: number
  total_price: number
}

interface Order {
  id: number
  customer_name: string
  status: string
  shipping_method: string | null
  shipping_cost: number | null
  fulfillment_date: string | null
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
}

interface OrderDetailsDialogProps {
  orderId: number
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

export default function OrderDetailsDialog({ orderId, open, onClose, onUpdated }: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConfirmFulfilled, setShowConfirmFulfilled] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string>('')

  useEffect(() => {
    if (!open) {
      setOrder(null)
      return
    }
    
    setLoading(true)
    apiCall(`/api/sales/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching order:', error)
        toast.error('Failed to load order details')
        setLoading(false)
      })
  }, [orderId, open])

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'fulfilled') {
      setPendingStatus(newStatus)
      setShowConfirmFulfilled(true)
    } else {
      setOrder(order ? { ...order, status: newStatus } : null)
    }
  }

  const handleConfirmFulfilled = async () => {
    if (!order) return
    
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/sales/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'fulfilled',
          shipping_method: order.shipping_method,
          shipping_cost: order.shipping_cost,
          fulfillment_date: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        toast.success('Order marked as fulfilled')
        setShowConfirmFulfilled(false)
        onUpdated()
        onClose()
      } else {
        toast.error('Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const handleSave = async () => {
    if (!order) return
    
    const res = await fetch(`${getApiBaseUrl()}/api/sales/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status: order.status,
        shipping_method: order.shipping_method,
        shipping_cost: order.shipping_cost,
        fulfillment_date: order.fulfillment_date,
      }),
    })

    if (res.ok) {
      toast.success('Order updated')
      onUpdated()
      onClose()
    } else {
      toast.error('Update failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {loading ? 'Loading...' : order ? `Order #${order.id}` : 'Order Details'}
              </DialogTitle>
              <p className="text-sm text-gray-600">View and manage order information</p>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-700 font-medium">Loading order details...</span>
              </div>
            </div>
          </div>
        ) : !order ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center justify-center text-red-700">
                <Package className="h-6 w-6 mr-2" />
                <span className="font-medium">Failed to load order details</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Customer</span>
                  <p className="font-semibold text-blue-900">{order.customer_name}</p>
                </div>
              </div>
            </div>

            {/* Status and Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Status
                </Label>
                <Select
                  value={order.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="h-11 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="backordered">Backordered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shipping Method */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Method
                </Label>
                <Input
                  className="h-11 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
                  placeholder="Enter shipping method"
                  value={order.shipping_method || ''}
                  onChange={(e) => setOrder({ ...order, shipping_method: e.target.value })}
                />
              </div>

              {/* Shipping Cost */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Shipping Cost
                </Label>
                <Input
                  className="h-11 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={order.shipping_cost ?? 0}
                  onChange={(e) => setOrder({ ...order, shipping_cost: parseFloat(e.target.value) || 0 })}
                />
              </div>

              {/* Fulfillment Date */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fulfillment Date
                </Label>
                <Input
                  className="h-11 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
                  type="date"
                  value={order.fulfillment_date?.slice(0, 10) || ''}
                  onChange={(e) => setOrder({ ...order, fulfillment_date: e.target.value })}
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <PriceSummaryBox items={order.items} />
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleSave} 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Package className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
      
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
                <span className="text-sm font-medium text-blue-700">Order #{orderId}</span>
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
    </Dialog>
  )
}
