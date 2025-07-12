'use client'

import { useEffect, useState } from 'react'

interface Adjustment {
  product_name: string
  type: 'absolute' | 'relative'
  quantity: number
  user_name: string
  created_at: string
}

export default function InventoryAdjustmentTable() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (userSearch) params.append('user', userSearch)
    if (fromDate) params.append('from', fromDate)
    if (toDate) params.append('to', toDate)

    fetch(`http://localhost:4000/api/analytics/recent-adjustments?${params}`)
      .then(res => res.json())
      .then(json => setAdjustments(json.data || []))
      .catch(err => {
        console.error('Error loading adjustments:', err)
        setAdjustments([])
      })
  }, [userSearch, fromDate, toDate])

  return (
    <div className="bg-white p-4 rounded shadow w-full max-h-[400px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Recent Inventory Adjustments</h3>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by user"
          className="border rounded px-2 py-1 text-sm"
          value={userSearch}
          onChange={e => setUserSearch(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
        />
      </div>

      <table className="w-full text-sm">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th>Product</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>By</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {adjustments.length ? adjustments.map((a, i) => (
            <tr key={i} className="border-b last:border-none">
              <td className="py-2">{a.product_name}</td>
              <td className="py-2 capitalize">{a.type}</td>
              <td className="py-2">{a.quantity}</td>
              <td className="py-2">{a.user_name}</td>
              <td className="py-2">{new Date(a.created_at).toLocaleString()}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-400">No recent adjustments</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
