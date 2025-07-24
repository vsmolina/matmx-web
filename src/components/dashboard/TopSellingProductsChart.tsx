'use client'

import { useEffect, useState } from 'react'
import KPIChart from '../KPIChart'

export default function TopSellingProductsChart() {
  const [data, setData] = useState<{ name: string, value: number }[]>([])
  const [topN, setTopN] = useState(5)

  useEffect(() => {
    fetch(`http://localhost:4000/api/dashboard/top-selling-products?limit=${topN}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => {
        console.error('Error loading top selling products:', err)
        setData([])
      })
  }, [topN])

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Top Selling Products</h3>
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