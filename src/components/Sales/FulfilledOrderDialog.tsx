'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Order } from '@/types/OrderTypes'
import OrderCard from './OrderCard'

export default function FulfilledOrdersDialog({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/sales/orders?status=fulfilled', {
        credentials: 'include'
      })
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
  }, [open])

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
