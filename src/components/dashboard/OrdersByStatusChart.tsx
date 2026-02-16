'use client'

import { useEffect, useState } from 'react'
import KPIChart from '../KPIChart'
import { apiCall } from '@/lib/api'

export default function OrdersByStatusChart() {
  const [data, setData] = useState<{ name: string, value: number }[]>([])

  useEffect(() => {
    apiCall('/api/dashboard/orders-by-status')
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