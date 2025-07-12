'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import RevenueByProductChart from '@/components/dashboard/RevenueByProductChart'
import ProfitByProductChart from '@/components/dashboard/ProfitByProductChart'
import ProfitMarginChart from '@/components/dashboard/ProfitMarginChart'
import RevenueVsProfitChart from '@/components/dashboard/RevenueVsProfitChart'
import StockOverTimeChart from '@/components/dashboard/StockOverTimeChart'
import VendorTable from '@/components/dashboard/VendorTable'
import InventoryAdjustmentTable from '@/components/dashboard/InventoryAdjustmentTable'

export default function AdminDashboardPage() {
  const [user, setUser] = useState<{ userId: number; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('http://localhost:4000/api/me', {
          credentials: 'include',
        })

        if (!res.ok) throw new Error('Unauthorized')
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        router.replace('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <h1 className="text-3xl font-bold mb-1 text-neutral-800">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Logged in as: <span className="font-medium">{user?.role}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <RevenueByProductChart />
        <ProfitByProductChart />
        <ProfitMarginChart />
        <RevenueVsProfitChart />
        <StockOverTimeChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VendorTable />
        <InventoryAdjustmentTable />
      </div>
    </div>
  )
}
