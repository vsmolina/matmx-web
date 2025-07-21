'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import SalesTabSwitcher from '@/components/Sales/SalesTabSwitcher'
import QuoteTable from '@/components/Sales/QuoteTable'
import OrderTable from '@/components/Sales/OrderTable'
import CreateQuoteDialog from '@/components/Sales/CreateQuoteDialog'
import QuoteDetailsDialog from '@/components/Sales/QuoteDetailsDialog'
import FulfilledOrdersDialog from '@/components/Sales/FulfilledOrderDialog'
import SalesHeader from '@/components/Sales/SalesHeader'
import AdminGuard from '@/components/AdminGuard'
import { Quote } from '@/types/QuoteTypes'
import { Order } from '@/types/OrderTypes'
import { Plus, Eye, FileText, ShoppingCart } from 'lucide-react'

export default function SalesPage() {
  const [tab, setTab] = useState<'quotes' | 'orders'>('quotes')
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [showFulfilled, setShowFulfilled] = useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)

  const [filter, setFilter] = useState<{
    customer: string
    status: string
    repId: string
    startDate?: string
    endDate?: string
  }>({
    customer: '',
    status: 'all',
    repId: 'all',
    startDate: undefined,
    endDate: undefined
  })

  const fetchData = async () => {
    console.log('fetchData called with reloadKey:', reloadKey)
    console.log('Current filter:', filter)
    const query = new URLSearchParams({
      customer: filter.customer,
      status: filter.status,
      repId: filter.repId,
      startDate: filter.startDate || '',
      endDate: filter.endDate || ''
    }).toString()
    console.log('Query string:', query)

    const [quoteRes, orderRes] = await Promise.all([
      fetch(`http://localhost:4000/api/sales/quotes?${query}`, { credentials: 'include' }),
      fetch(`http://localhost:4000/api/sales/orders?${query}`, { credentials: 'include' })
    ])
    const quoteData = await quoteRes.json()
    const orderData = await orderRes.json()
    console.log('Fetched quotes:', quoteData.quotes)
    console.log('Fetched orders:', orderData.orders)
    setQuotes(quoteData.quotes || [])
    setOrders(orderData.orders || [])
  }

  useEffect(() => {
    fetchData()
  }, [reloadKey, filter])



  return (
    <AdminGuard allowedRoles={['super_admin', 'admin', 'sales_rep']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
          {/* Actions and Tab Switcher */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <SalesTabSwitcher activeTab={tab} onTabChange={setTab} />
              <div className="flex gap-2 w-full sm:w-auto">
                {tab === 'orders' && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFulfilled(true)}
                    className="flex-1 sm:flex-none border-gray-300 hover:border-green-400 hover:text-green-600 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Fulfilled Orders
                  </Button>
                )}
                <Button 
                  onClick={() => setShowCreate(true)}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quote
                </Button>
              </div>
            </div>

            {/* Filters */}
            <SalesHeader filter={filter} onFilterChange={setFilter} />
          </div>

          {/* Tables */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {tab === 'quotes' && (
              <div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sales Quotes</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Manage and track your quote pipeline</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <QuoteTable
                    quotes={quotes}
                    onView={(quoteId) => setSelectedQuoteId(quoteId)}
                    onConvert={() => setReloadKey((k) => k + 1)}
                  />
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sales Orders</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Track and fulfill customer orders</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <OrderTable
                    orders={orders}
                    onUpdated={() => setReloadKey((k) => k + 1)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modals */}
          <CreateQuoteDialog
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              console.log('onCreated called, incrementing reloadKey')
              setReloadKey((k) => k + 1)
            }}
          />

          <FulfilledOrdersDialog
            open={showFulfilled}
            onClose={() => setShowFulfilled(false)}
          />

          {selectedQuoteId && (
            <QuoteDetailsDialog
              quoteId={selectedQuoteId}
              open={true}
              onClose={() => setSelectedQuoteId(null)}
              onUpdated={() => setReloadKey((k) => k + 1)}
            />
          )}
        </div>
      </div>
    </AdminGuard>
  )
}
