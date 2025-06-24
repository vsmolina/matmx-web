'use client'

import { useState, useEffect } from 'react'
import SalesHeader from '@/components/Sales/SalesHeader'
import SalesStatsCards from '@/components/Sales/SalesStatsCards'
import SalesTabSwitcher from '@/components/Sales/SalesTabSwitcher'
import QuoteTable from '@/components/Sales/QuoteTable'
import OrderTable from '@/components/Sales/OrderTable'
import CreateQuoteDialog from '@/components/Sales/CreateQuoteDialog'
import QuoteDetailsDialog from '@/components/Sales/QuoteDetailsDialog'
import OrderDetailsDialog from '@/components/Sales/OrderDetailsDialog'
import { useSalesData } from '@/hooks/useSalesData'
import { useSalesStats } from '@/hooks/useSalesStats'

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<'quotes' | 'orders'>('quotes')
  const [quotes, setQuotes] = useState<any[]>([])
  const [filter, setFilter] = useState({
    customer: '',
    status: 'all',
    repId: 'all'
  })

  const [reloadKey, setReloadKey] = useState(0)
  const { data, loading, error } = useSalesData(activeTab, filter, reloadKey)
  const { stats } = useSalesStats()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [dialogType, setDialogType] = useState<null | 'view'>(null)
  const triggerReload = () => setReloadKey(prev => prev + 1)

  useEffect(() => {
    if (activeTab === 'quotes' && Array.isArray(data)) {
      setQuotes(data)
    }
  }, [data, activeTab])

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
    setReloadKey(prev => prev + 1)
  }

  const openDialog = (type: typeof dialogType, id: number) => {
    setSelectedId(id)
    setDialogType(type)
  }

  const closeDialog = () => {
    setDialogType(null)
    setSelectedId(null)
  }

  const handleQuoteConverted = (quoteId: number) => {
    setQuotes(prev => prev.filter(q => q.id !== quoteId))
    setActiveTab('orders')
    triggerReload()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        {activeTab === 'quotes' && <CreateQuoteDialog onCreated={triggerReload} />}
      </div>

      <SalesHeader filter={filter} onFilterChange={handleFilterChange} />
      <SalesStatsCards stats={stats} />
      <SalesTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'quotes' ? (
        <QuoteTable
          quotes={quotes}
          onView={(id) => openDialog('view', id)}
          onConvert={handleQuoteConverted}
        />
      ) : (
        <OrderTable
          orders={data}
          onView={(id) => openDialog('view', id)}
        />
      )}

      {activeTab === 'quotes' && dialogType === 'view' && selectedId && (
        <QuoteDetailsDialog
          quoteId={selectedId}
          open={true}
          onClose={closeDialog}
          onUpdated={triggerReload}
        />
      )}

      {activeTab === 'orders' && dialogType === 'view' && selectedId && (
        <OrderDetailsDialog
          orderId={selectedId}
          open={true}
          onClose={closeDialog}
          onUpdated={() => {}}
        />
      )}
    </div>
  )
}
