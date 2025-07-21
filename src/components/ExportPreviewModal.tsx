'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Download, Eye, Table, LayoutGrid } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProductVendorStock {
  product_id: number
  name: string
  sku: string
  vendor: string
  vendor_id: number
  quantity: number
  reorder_threshold: number
  category: string
  vendor_price: number
}

interface ExportPreviewModalProps {
  trigger?: React.ReactNode
}

export default function ExportPreviewModal({ trigger }: ExportPreviewModalProps) {
  const [open, setOpen] = useState(false)
  const [previewData, setPreviewData] = useState<ProductVendorStock[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')

  const fetchPreviewData = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/inventory', {
        credentials: 'include',
      })
      const data = await res.json()
      
      let products = []
      if (data.products) {
        products = data.products
      } else if (Array.isArray(data)) {
        products = data
      }
      
      setPreviewData(products)
    } catch (err) {
      console.error('Error fetching preview data:', err)
      toast.error('Failed to load preview data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchPreviewData()
    }
  }, [open])

  const handleDownload = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/inventory/export', {
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to export CSV')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('CSV downloaded successfully')
      setOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to download CSV')
    }
  }

  const formatPrice = (price: number) => {
    return price ? `$${Number(price).toFixed(2)}` : '—'
  }

  const defaultTrigger = (
    <Button variant="outline">
      <Eye className="w-4 h-4 mr-2" />
      Preview Export
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:left-[50%] sm:top-[50%] sm:max-w-6xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]",
            "max-h-screen overflow-hidden sm:max-h-[80vh]"
          )}
        >
        <DialogHeader className="pb-4 sticky top-0 bg-white z-10 p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">CSV Export Preview</DialogTitle>
                <p className="text-sm text-gray-600">Preview and download inventory data</p>
              </div>
            </div>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex-1 flex flex-col overflow-hidden">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full sm:w-auto">
              <p className="text-sm text-gray-600">
                Preview of {previewData.length} inventory records
              </p>
              {/* Mobile only toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1 sm:hidden">
                <Button
                  size="sm"
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('cards')}
                  className="h-8 px-3"
                >
                  <LayoutGrid className="w-4 h-4 mr-1" />
                  Cards
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('table')}
                  className="h-8 px-3"
                >
                  <Table className="w-4 h-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>
            <Button onClick={handleDownload} disabled={loading || previewData.length === 0} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>

          <div className="flex-1 border rounded-lg overflow-hidden bg-white">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  Loading preview...
                </div>
              </div>
            ) : previewData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No data to export</div>
            ) : viewMode === 'cards' ? (
              /* Card view for mobile */
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {previewData.map((row) => (
                    <div
                      key={`${row.product_id}-${row.vendor_id}`}
                      className={`border rounded-lg p-4 ${
                        row.quantity < row.reorder_threshold 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{row.name}</h3>
                          <p className="text-xs text-gray-500 font-mono">{row.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatPrice(row.vendor_price)}</p>
                          <p className="text-xs text-gray-500">ID: {row.product_id}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <p className="font-medium">{row.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Vendor:</span>
                          <p className="font-medium">{row.vendor}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <p className={`font-medium ${
                            row.quantity < row.reorder_threshold ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {row.quantity} units
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Reorder:</span>
                          <p className="font-medium">{row.reorder_threshold} units</p>
                        </div>
                      </div>
                      
                      {row.quantity < row.reorder_threshold && (
                        <div className="mt-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                          ⚠️ Low Stock Alert
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              /* Table view - always shown on desktop, optional on mobile */
              <div className="h-full overflow-auto">
                <div className="overflow-x-auto min-w-full">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap">Product ID</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap">Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap">SKU</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap">Category</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap">Vendor Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap">Vendor ID</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap">Quantity</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap">Reorder Threshold</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap">Vendor Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr
                          key={`${row.product_id}-${row.vendor_id}`}
                          className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                            row.quantity < row.reorder_threshold ? 'bg-red-50' : ''
                          }`}
                        >
                          <td className="px-3 py-2 whitespace-nowrap">{row.product_id}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.name}</td>
                          <td className="px-3 py-2 font-mono whitespace-nowrap">{row.sku}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.category}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.vendor}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.vendor_id}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.quantity}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.reorder_threshold}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{formatPrice(row.vendor_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            {viewMode === 'table' && (
              <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg flex items-center gap-2 sm:hidden">
                <svg className="h-4 w-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>Swipe horizontally to see all columns</span>
              </div>
            )}
            <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
              <strong>💡 Note:</strong> The CSV export includes additional columns with vendor terms, 
              stock status, and timestamp information not shown in this preview.
            </div>
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}