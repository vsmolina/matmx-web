'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Order } from '@/types/OrderTypes'
import OrderCard from './OrderCard'
import { apiCall } from '@/lib/api'

export default function FulfilledOrdersDialog({
  open,
  onClose,
  reloadKey
}: {
  open: boolean
  onClose: () => void
  reloadKey?: number
}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await apiCall('/api/sales/orders?status=delivered')
      const data = await res.json()
      setOrders(
        data.orders.filter((o: Order) => o.fulfillment_date !== null)
      )
    } catch (err) {
      console.error('Error loading fulfilled orders', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchOrders()
  }, [open, reloadKey])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fulfilled Orders</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fulfilled orders yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdated={fetchOrders}
              />
            ))}
          </div>
        )}

        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
