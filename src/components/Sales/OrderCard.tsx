'use client'

import { Button } from '@/components/ui/button'
import GenerateOrViewOrderPDFButton from './GenerateOrViewOrderPDFButton'
import SendOrderEmailButton from './SendOrderEmailButton'

interface Order {
  id: number
  customer_name: string
  customer_email: string
  status: string
  fulfillment_date: string | null
  total: number | string | null
  shipping_method?: string
}

interface OrderCardProps {
  order: Order
  onView: (orderId: number) => void
}

export default function OrderCard({ order, onView }: OrderCardProps) {
  const total =
    typeof order.total === 'number'
      ? order.total
      : parseFloat(order.total as string || '0')

  return (
    <div className="bg-white shadow rounded-xl p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Order #{order.id}</h3>
        <span className="text-sm capitalize text-muted-foreground">{order.status}</span>
      </div>
      <div className="text-sm">
        <p><span className="font-semibold">Customer:</span> {order.customer_name}</p>
        <p><span className="font-semibold">Shipping:</span> {order.shipping_method || '—'}</p>
        <p><span className="font-semibold">Fulfilled:</span> {order.fulfillment_date?.slice(0, 10) || '—'}</p>
        <p><span className="font-semibold">Total:</span> ${total.toFixed(2)}</p>
      </div>
      <div className="flex justify-between gap-2 pt-2">
        <Button onClick={() => onView(order.id)} className="flex-1">View</Button>
        <GenerateOrViewOrderPDFButton orderId={order.id} />
        <SendOrderEmailButton orderId={order.id} customerEmail={order.customer_email} />
      </div>
    </div>
  )
}
