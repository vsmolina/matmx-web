'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import SalesTabSwitcher from '@/components/Sales/SalesTabSwitcher'
import QuoteTable from '@/components/Sales/QuoteTable'
import OrderTable from '@/components/Sales/OrderTable'
import CreateQuoteDialog from '@/components/Sales/CreateQuoteDialog'
import FulfilledOrdersDialog from '@/components/Sales/FulfilledOrderDialog'
import SalesHeader from '@/components/Sales/SalesHeader'
import { Quote } from '@/types/QuoteTypes'
import { Order } from '@/types/OrderTypes'

export default function SalesPage() {
  const [tab, setTab] = useState<'quotes' | 'orders'>('quotes')
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [showFulfilled, setShowFulfilled] = useState(false)

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
    const query = new URLSearchParams({
      customer: filter.customer,
      status: filter.status,
      repId: filter.repId,
      startDate: filter.startDate || '',
      endDate: filter.endDate || ''
    }).toString()

    const [quoteRes, orderRes] = await Promise.all([
      fetch(`http://localhost:4000/api/sales/quotes?${query}`, { credentials: 'include' }),
      fetch(`http://localhost:4000/api/sales/orders?${query}`, { credentials: 'include' })
    ])
    const quoteData = await quoteRes.json()
    const orderData = await orderRes.json()
    console.log('Fetched orders', orderData.orders)
    setQuotes(quoteData.quotes || [])
    setOrders(orderData.orders || [])
  }

  useEffect(() => {
    fetchData()
  }, [reloadKey, filter])



  return (
    <div className="p-4 space-y-6">
      {/* Tabs and action buttons */}
      <div className="flex justify-end items-center">
        <div className="flex gap-2 ">
          {tab === 'orders' && (
            <Button variant="outline" onClick={() => setShowFulfilled(true)}>
              View Fulfilled Orders
            </Button>
          )}
          <Button onClick={() => setShowCreate(true)}>Create Quote</Button>
        </div>
      </div>

      {/* Filters */}
      <SalesHeader filter={filter} onFilterChange={setFilter} />
      <SalesTabSwitcher activeTab={tab} onTabChange={setTab} />

      {/* Tables */}
      {tab === 'quotes' && (
        <QuoteTable
          quotes={quotes}
          onView={() => {}}
          onConvert={() => setReloadKey((k) => k + 1)}
        />
      )}

      {tab === 'orders' && (
        <OrderTable
          orders={orders}
          onUpdated={() => setReloadKey((k) => k + 1)}
        />
      )}

      {/* Modals */}
      <CreateQuoteDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />

      <FulfilledOrdersDialog
        open={showFulfilled}
        onClose={() => setShowFulfilled(false)}
      />
    </div>
  )
}
