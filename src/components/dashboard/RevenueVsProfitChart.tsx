'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function RevenueVsProfitChart() {
  const [data, setData] = useState<{ month: string, revenue: number, profit: number }[]>([])
  const [months, setMonths] = useState(6)

  useEffect(() => {
    fetch(`http://localhost:4000/api/analytics/revenue-vs-profit?months=${months}`)
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => {
        console.error('Error loading revenue vs profit:', err)
        setData([])
      })
  }, [months])

  return (
    <div className="h-64 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Revenue vs Profit (Monthly)</h3>
        <select
          value={months}
          onChange={e => setMonths(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value={3}>Last 3 Months</option>
          <option value={6}>Last 6 Months</option>
          <option value={12}>Last 12 Months</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data.length ? data : [{ month: 'No Data', revenue: 0, profit: 0 }]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#003cc5" />
          <Line type="monotone" dataKey="profit" stroke="#10b981" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
