'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function StockOverTimeChart() {
  const [data, setData] = useState<{ date: string, stock: number }[]>([])

  useEffect(() => {
    fetch('http://localhost:4000/api/analytics/stock-over-time')
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => {
        console.error('Error loading stock over time:', err)
        setData([])
      })
  }, [])

  return (
    <div className="h-64 w-full">
      <h3 className="text-lg font-semibold mb-2">Total Stock Over Time</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data.length ? data : [{ date: 'No Data', stock: 0 }]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="stock" stroke="#6366f1" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
