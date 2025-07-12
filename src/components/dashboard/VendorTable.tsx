'use client'

import { useEffect, useState } from 'react'

interface VendorRow {
  name: string
  email: string
  product_count: number
}

export default function VendorTable() {
  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [search, setSearch] = useState('')
  const [minProducts, setMinProducts] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams({
      search,
      minProducts: minProducts.toString(),
    })

    fetch(`http://localhost:4000/api/vendors/summary?${params}`)
      .then(res => res.json())
      .then(json => setVendors(json.data || []))
      .catch(err => {
        console.error('Error loading vendors:', err)
        setVendors([])
      })
  }, [search, minProducts])

  return (
    <div className="bg-white p-4 rounded shadow w-full max-h-[400px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Vendors</h3>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name"
          className="border rounded px-2 py-1 text-sm w-1/2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Products"
          className="border rounded px-2 py-1 text-sm w-1/3"
          value={minProducts}
          onChange={e => setMinProducts(Number(e.target.value))}
        />
      </div>

      <table className="w-full text-sm">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
          {vendors.length ? vendors.map((v, idx) => (
            <tr key={idx} className="border-b last:border-none">
              <td className="py-2">{v.name}</td>
              <td className="py-2">{v.email}</td>
              <td className="py-2">{v.product_count}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-400">No vendors available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
