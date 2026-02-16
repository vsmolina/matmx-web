'use client'

import { useEffect, useState } from 'react'
import { apiCall } from '@/lib/api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function CustomerGrowthChart() {
  const [data, setData] = useState<{ month: string, value: number }[]>([])
  const [months, setMonths] = useState(6)

  useEffect(() => {
    apiCall(`/api/dashboard/customer-growth?months=${months}`)
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => {
        console.error('Error loading customer growth:', err)
        setData([])
      })
  }, [months])

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Customer Growth</h3>
        <select
          value={months}
          onChange={e => setMonths(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="New Customers"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}