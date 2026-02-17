'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/ProductTypes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import toast from 'react-hot-toast'
import LabelPrintDialog from './LabelPrintDialog'
import { apiCall } from '@/lib/api'

interface ReceivingFormProps {
  product: Product
  onSubmitted?: () => void
}

interface Warehouse {
  id: number
  name: string
  code: string
  location: string
  is_active: boolean
}

export default function ReceivingForm({ product, onSubmitted }: ReceivingFormProps) {
  const [quantity, setQuantity] = useState<number | ''>(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [hasReceived, setHasReceived] = useState(false) // ✅ prevent double update
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('')
  const [loadingWarehouses, setLoadingWarehouses] = useState(true)

  // Fetch warehouses on component mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await apiCall('/api/warehouses')
        if (res.ok) {
          const data = await res.json()
          setWarehouses(data.warehouses || [])
          // Auto-select if only one warehouse
          if (data.warehouses && data.warehouses.length === 1) {
            setSelectedWarehouseId(data.warehouses[0].id.toString())
          }
        }
      } catch (err) {
        console.error('Failed to fetch warehouses:', err)
        toast.error('Failed to load warehouses')
      } finally {
        setLoadingWarehouses(false)
      }
    }
    fetchWarehouses()
  }, [])

  const handleReceive = async () => {
    if (hasReceived || quantity === '' || quantity <= 0) {
      toast.error('Invalid quantity or already received')
      return
    }

    if (!selectedWarehouseId) {
      toast.error('Please select a warehouse')
      return
    }

    setLoading(true)

    try {
      const requestData = {
        vendor_id: product.vendor_id,
        warehouse_id: parseInt(selectedWarehouseId),
        quantity,
        reason: 'received',
        note: note || 'Received via scan',
      };

      console.log('🔍 Frontend receiving request data:', requestData);
      console.log('📦 Product data:', { id: product.id, sku: product.sku, vendor_id: product.vendor_id, vendor: product.vendor });

      const res = await apiCall(`/api/inventory/${product.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      if (!res.ok) throw new Error('Failed to update inventory')

      toast.success('Inventory updated')
      setShowPrintDialog(true)
      setHasReceived(true)
    } catch (err) {
      console.error(err)
      toast.error('Failed to receive item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-xl mx-auto">
      {/* Product Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{product.name}</h3>
            <div className="flex items-center gap-3 text-blue-100 text-sm">
              <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md font-mono">{product.sku}</span>
              <span>•</span>
              <span>{product.vendor}</span>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
            <div className="text-xs text-blue-100">Stock</div>
            <div className="text-lg font-bold">{product.stock}</div>
          </div>
        </div>
      </div>

      {/* Form Content - Mobile Optimized */}
      <div className="p-6 space-y-6">
        {/* Quantity Input - Large and Touch Friendly */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Quantity Received</Label>
          <div className="relative">
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                setQuantity(isNaN(val) ? '' : val)
              }}
              className="w-full h-14 text-2xl font-semibold text-center border-2 border-gray-200 focus:border-blue-500 rounded-xl pr-12"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          {/* Quick quantity buttons for mobile */}
          <div className="flex gap-2 mt-3 md:hidden">
            {[1, 5, 10, 25].map((num) => (
              <button
                key={num}
                onClick={() => setQuantity(num)}
                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                +{num}
              </button>
            ))}
          </div>
        </div>

        {/* Warehouse Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Warehouse <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedWarehouseId}
            onValueChange={setSelectedWarehouseId}
            disabled={loadingWarehouses || hasReceived}
          >
            <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
              <SelectValue placeholder={loadingWarehouses ? "Loading warehouses..." : "Select a warehouse"} />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{warehouse.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({warehouse.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Note Input - Expandable */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Note (Optional)</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any notes about this shipment..."
            className="min-h-[80px] border-2 border-gray-200 focus:border-blue-500 rounded-xl resize-none"
          />
        </div>

        {/* Action Button - Large and Prominent */}
        <Button
          disabled={loading || hasReceived || loadingWarehouses || !selectedWarehouseId}
          onClick={handleReceive}
          className={`w-full h-14 text-lg font-semibold shadow-lg transition-all duration-200 ${
            loading || hasReceived 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Receiving...</span>
            </div>
          ) : hasReceived ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Received Successfully</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Receive and Print Labels</span>
            </div>
          )}
        </Button>
      </div>

      <LabelPrintDialog
        open={showPrintDialog}
        onOpenChange={(val) => {
          setShowPrintDialog(val)
          if (!val && onSubmitted) onSubmitted()
        }}
        product={product}
        defaultQty={typeof quantity === 'number' ? quantity : 1}
        onConfirm={() => {}} // ✅ don't call handleReceive again
      />
    </div>
  )
}
