'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import VendorCreateModal from '@/components/VendorCreateModal'

interface Vendor {
  id: number
  name: string
  email?: string
  phone?: string
  product_count: number
}

export default function VendorsPage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useSearchParams()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filtered, setFiltered] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchVendors = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/vendors', {
        credentials: 'include'
      })
      const data = await res.json()
      setVendors(data.vendors)
      setFiltered(data.vendors)
    } catch (err) {
      console.error('Error loading vendors:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchVendors()
  }, [user])

  useEffect(() => {
    const q = search.toLowerCase()
    const f = vendors.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.phone?.toLowerCase().includes(q)
    )
    setFiltered(f)
  }, [search, vendors])

  if (!user) return <div className="p-6">Unauthorized</div>
  if (loading) return <div className="p-6">Loading vendors...</div>

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Vendors</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search by name, email, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <VendorCreateModal
          onSaved={fetchVendors}
          trigger={<Button>+ Add Vendor</Button>}
        />
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2"># Products</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-2 font-medium">{v.name}</td>
                <td className="px-4 py-2">{v.email || '—'}</td>
                <td className="px-4 py-2">{v.phone || '—'}</td>
                <td className="px-4 py-2">{v.product_count}</td>
                <td className="px-4 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/vendors/${v.id}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
