'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useUser } from '@/context/UserContext'
import { BarChart3, TrendingUp, Package, Users, DollarSign, Activity } from 'lucide-react'
import RevenueByProductChart from '@/components/dashboard/RevenueByProductChart'
import ProfitByProductChart from '@/components/dashboard/ProfitByProductChart'
import ProfitMarginChart from '@/components/dashboard/ProfitMarginChart'
import RevenueVsProfitChart from '@/components/dashboard/RevenueVsProfitChart'
import StockOverTimeChart from '@/components/dashboard/StockOverTimeChart'
import OrdersByStatusChart from '@/components/dashboard/OrdersByStatusChart'
import TopSellingProductsChart from '@/components/dashboard/TopSellingProductsChart'
import CustomerGrowthChart from '@/components/dashboard/CustomerGrowthChart'
import InventoryLevelsChart from '@/components/dashboard/InventoryLevelsChart'
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable'
import LowStockProductsTable from '@/components/dashboard/LowStockProductsTable'
import { apiCall } from '@/lib/api'

interface DashboardStats {
  revenue: { value: number; growth: number }
  orders: { value: number; growth: number }
  customers: { value: number; growth: number }
  products: { value: number; growth: number }
}

export default function AdminDashboardPage() {
  const { user, loading: userLoading } = useUser()
  const [stats, setStats] = useState<DashboardStats>({
    revenue: { value: 0, growth: 0 },
    orders: { value: 0, growth: 0 },
    customers: { value: 0, growth: 0 },
    products: { value: 0, growth: 0 }
  })
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(false)

  const fetchDashboardStats = useCallback(async () => {
    if (loadingRef.current || !user) return
    
    loadingRef.current = true
    setLoading(true)
    try {
      const response = await apiCall('/api/dashboard/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!userLoading && user) {
      fetchDashboardStats()
    }
  }, [userLoading, user, fetchDashboardStats])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatRole = (role?: string) => {
    if (!role) return 'Admin'
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6 shadow-lg md:px-6 md:py-8">
        <div className="w-full mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <BarChart3 className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
                <p className="text-blue-100 text-sm mt-1 md:text-base">Business analytics and insights</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
              <div className="text-right">
                <p className="text-blue-100 text-sm">{getGreeting()},</p>
                <p className="text-white font-semibold">{user?.name || 'Administrator'}</p>
                <p className="text-blue-200 text-xs capitalize">{formatRole(user?.role)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="w-full mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${loading ? '...' : (stats.revenue.value / 1000).toFixed(1)}K
                </p>
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.revenue.growth}%
                </p>
              </div>
              <div className="bg-blue-100 rounded-xl p-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : stats.orders.value}
                </p>
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.orders.growth}%
                </p>
              </div>
              <div className="bg-green-100 rounded-xl p-3">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : stats.customers.value}
                </p>
                <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  +{stats.customers.growth}%
                </p>
              </div>
              <div className="bg-purple-100 rounded-xl p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Stock Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : stats.products.value}
                </p>
                <p className="text-gray-500 text-xs mt-1">Active SKUs</p>
              </div>
              <div className="bg-orange-100 rounded-xl p-3">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-600 rounded-lg p-2">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Analytics Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <RevenueByProductChart />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <OrdersByStatusChart />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <TopSellingProductsChart />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <CustomerGrowthChart />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <InventoryLevelsChart />
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-green-600 rounded-lg p-2">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <RecentOrdersTable />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <LowStockProductsTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
