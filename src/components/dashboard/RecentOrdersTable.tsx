'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface OrderRow {
  id: number
  date: string
  customer: string
  company: string | null
  rep: string | null
  status: string | null
  total: number
}

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:4000/api/dashboard/recent-orders?limit=10', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => {
        setOrders(json.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading recent orders:', err)
        setOrders([])
        setLoading(false)
      })
  }, [])

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-600 border-b">
            <tr>
              <th className="pb-2">Order ID</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Customer</th>
              <th className="pb-2">Rep</th>
              <th className="pb-2">Status</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">Loading...</td>
              </tr>
            ) : orders.length ? (
              orders.map((order) => (
                <tr key={order.id} className="border-b last:border-none hover:bg-gray-50">
                  <td className="py-2">#{order.id}</td>
                  <td className="py-2">{order.date ? format(new Date(order.date), 'MMM dd, yyyy') : '-'}</td>
                  <td className="py-2">
                    <div>
                      <div className="font-medium">{order.customer}</div>
                      {order.company && <div className="text-xs text-gray-500">{order.company}</div>}
                    </div>
                  </td>
                  <td className="py-2">{order.rep || '-'}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-2 text-right font-medium">${(order.total || 0).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">No recent orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}