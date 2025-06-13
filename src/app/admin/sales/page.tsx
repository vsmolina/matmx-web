'use client'

import { useState, useEffect } from 'react'
import SalesHeader from '@/components/Sales/SalesHeader'
import SalesStatsCards from '@/components/Sales/SalesStatsCards'
import SalesTabSwitcher from '@/components/Sales/SalesTabSwitcher'
import QuoteTable from '@/components/Sales/QuoteTable'
import OrderTable from '@/components/Sales/OrderTable'
import CreateQuoteDialog from '@/components/Sales/CreateQuoteDialog'
import QuoteDetailsDialog from '@/components/Sales/QuoteDetailsDialog'
import EmailQuoteDialog from '@/components/Sales/EmailQuoteDialog'
import UploadAttachmentDialog from '@/components/Sales/UploadAttachmentDialog'
import ConvertToOrderDialog from '@/components/Sales/ConvertToOrderDialog'
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
  const [dialogType, setDialogType] = useState<null | 'view' | 'email' | 'upload' | 'convert'>(null)
  const triggerReload = () => setReloadKey(prev => prev + 1)

  useEffect(() => {
    if (activeTab === 'quotes' && Array.isArray(data)) {
      setQuotes(data)
    }
  }, [data, activeTab])

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
    setReloadKey(prev => prev + 1) // force refetch on every filter change
  }

  const openDialog = (type: typeof dialogType, id: number) => {
    setSelectedId(id)
    setDialogType(type)
  }

  const closeDialog = () => {
    setDialogType(null)
    setSelectedId(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        {activeTab === 'quotes' && (
          <CreateQuoteDialog onCreated={triggerReload} />
        )}
      </div>

      <SalesHeader filter={filter} onFilterChange={handleFilterChange} />
      <SalesStatsCards stats={stats} />
      <SalesTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'quotes' ? (
        <QuoteTable
          quotes={quotes}
          onView={(id) => openDialog('view', id)}
          onConvert={(id) => openDialog('convert', id)}
          onEmail={(id) => openDialog('email', id)}
          onUpload={(id) => openDialog('upload', id)}
          onClose={(id) => setQuotes(prev => prev.filter(q => q.id !== id))}
        />
      ) : (
        <OrderTable
          orders={data}
          onView={(id) => openDialog('view', id)}
          onUpload={(id) => openDialog('upload', id)}
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

      {activeTab === 'quotes' && dialogType === 'email' && selectedId && (
        <EmailQuoteDialog quoteId={selectedId} />
      )}

      {activeTab === 'quotes' && dialogType === 'upload' && selectedId && (
        <UploadAttachmentDialog relatedType="quote" relatedId={selectedId} />
      )}

      {activeTab === 'quotes' && dialogType === 'convert' && selectedId && (
        <ConvertToOrderDialog quoteId={selectedId} onConverted={(orderId) => {
          closeDialog()
          setActiveTab('orders')
        }} />
      )}

      {activeTab === 'orders' && dialogType === 'view' && selectedId && (
        <OrderDetailsDialog
          orderId={selectedId}
          open={true}
          onClose={closeDialog}
          onUpdated={() => {}}
        />
      )}

      {activeTab === 'orders' && dialogType === 'upload' && selectedId && (
        <UploadAttachmentDialog relatedType="order" relatedId={selectedId} />
      )}
    </div>
  )
}