'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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

  useEffect(() => {
    if (!open) return
    fetch(`http://localhost:4000/api/sales/orders/${orderId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setOrder(data))
  }, [orderId, open])

  const handleSave = async () => {
    const res = await fetch(`http://localhost:4000/api/sales/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status: order?.status,
        shipping_method: order?.shipping_method,
        shipping_cost: order?.shipping_cost,
        fulfillment_date: order?.fulfillment_date,
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

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={order.status}
                onValueChange={(v) => setOrder({ ...order, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="backordered">Backordered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Shipping Method</Label>
              <Input
                value={order.shipping_method || ''}
                onChange={(e) => setOrder({ ...order, shipping_method: e.target.value })}
              />
            </div>

            <div>
              <Label>Shipping Cost</Label>
              <Input
                type="number"
                value={order.shipping_cost ?? 0}
                onChange={(e) => setOrder({ ...order, shipping_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Fulfillment Date</Label>
              <Input
                type="date"
                value={order.fulfillment_date?.slice(0, 10) || ''}
                onChange={(e) => setOrder({ ...order, fulfillment_date: e.target.value })}
              />
            </div>
          </div>

          <PriceSummaryBox items={order.items} />

          <Button onClick={handleSave} className="w-full mt-4">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
