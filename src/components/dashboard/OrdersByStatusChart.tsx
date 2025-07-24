'use client'

import { useEffect, useState } from 'react'
import KPIChart from '../KPIChart'

export default function OrdersByStatusChart() {
  const [data, setData] = useState<{ name: string, value: number }[]>([])

  useEffect(() => {
    fetch('http://localhost:4000/api/dashboard/orders-by-status', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => {
        console.error('Error loading orders by status:', err)
        setData([])
      })
  }, [])

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Orders by Status</h3>
      <KPIChart
        title=""
        data={data.length ? data : [{ name: 'No data', value: 0 }]}
      />
    </div>
  )
}