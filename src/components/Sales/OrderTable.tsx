'use client'

import { Button } from '@/components/ui/button'
import OrderCard from './OrderCard'
import { useMediaQuery } from '@/hooks/useMediaQuery'
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

interface OrderTableProps {
  orders: Order[]
  onView: (orderId: number) => void
}

export default function OrderTable({ orders, onView }: OrderTableProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={{
              ...order,
              total: typeof order.total === 'number' ? order.total : parseFloat(order.total || '0')
            }}
            onView={onView}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden shadow">
      <table className="w-full text-sm bg-white">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-2">Order #</th>
            <th className="text-left px-4 py-2">Customer</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Shipping</th>
            <th className="text-left px-4 py-2">Fulfilled</th>
            <th className="text-right px-4 py-2">Total</th>
            <th className="text-right px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const total = typeof order.total === 'number'
              ? order.total
              : parseFloat(order.total as string || '0')
            return (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.customer_name}</td>
                <td className="px-4 py-2 capitalize">{order.status}</td>
                <td className="px-4 py-2">{order.shipping_method || '—'}</td>
                <td className="px-4 py-2">{order.fulfillment_date?.slice(0, 10) || '—'}</td>
                <td className="px-4 py-2 text-right">${total.toFixed(2)}</td>
                <td className="px-4 py-2 text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => onView(order.id)}>View</Button>
                  <GenerateOrViewOrderPDFButton orderId={order.id} />
                  <SendOrderEmailButton orderId={order.id} customerEmail={order.customer_email} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
