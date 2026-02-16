'use client'

import { useEffect, useState } from 'react'
import { apiCall } from '@/lib/api'
import KPIChart from '../KPIChart'

export default function ProfitMarginChart() {
  const [data, setData] = useState<{ name: string, value: number }[]>([])
  const [topN, setTopN] = useState(5)

  useEffect(() => {
    apiCall(`/api/analytics/profit-margin?limit=${topN}`)
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => {
        console.error('Error loading profit margin:', err)
        setData([])
      })
  }, [topN])

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Profit Margin (%)</h3>
        <select
          value={topN}
          onChange={e => setTopN(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          {[5, 10, 20].map(n => (
            <option key={n} value={n}>Top {n}</option>
          ))}
        </select>
      </div>
      <KPIChart
        title=""
        data={data.length ? data : [{ name: 'No data', value: 0 }]}
      />
    </div>
  )
}
