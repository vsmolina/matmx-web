'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { apiCall } from '@/lib/api'

interface WarehouseOption {
  warehouse_id: number
  warehouse_name: string
  warehouse_code: string
  quantity: number
}

interface Props {
  productId: number
  vendorId: number
  vendorName: string
  currentStock: number
  warehouseId?: number
  /** For merged view: pass all warehouse options so user can pick */
  warehouses?: WarehouseOption[]
  onSave: () => void
  trigger: React.ReactNode
}

type Mode = 'relative' | 'absolute'

export default function AdjustInventoryModal({
  productId,
  vendorId,
  vendorName,
  currentStock,
  warehouseId,
  warehouses,
  onSave,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('relative')
  const [confirmOpen, setConfirmOpen] = useState(false)

  // If warehouses are provided, let user select; otherwise use the single warehouseId
  const hasMultipleWarehouses = warehouses && warehouses.length > 1
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(
    warehouseId || warehouses?.[0]?.warehouse_id || 1
  )

  // Derive currentStock from selected warehouse when in multi-warehouse mode
  const activeStock = warehouses
    ? (warehouses.find(w => w.warehouse_id === selectedWarehouseId)?.quantity ?? currentStock)
    : currentStock

  // Reset selected warehouse when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedWarehouseId(warehouseId || warehouses?.[0]?.warehouse_id || 1)
    }
  }, [open, warehouseId, warehouses])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      quantity: 0,
      reason: '',
      note: '',
    },
  })

  const quantityInput = watch('quantity')

  const parsedQuantity = Number(quantityInput)
  const finalQty = mode === 'relative'
    ? activeStock + parsedQuantity
    : parsedQuantity

  const changeAmount = finalQty - activeStock

  const submitForm = async () => {
    if (isNaN(parsedQuantity)) {
      toast.error('Invalid quantity input')
      return
    }

    try {
      const requestBody = {
        vendor_id: vendorId,
        warehouse_id: selectedWarehouseId,
        adjustment_type: mode,
        quantity: parsedQuantity,
        reason: watch('reason'),
        note: watch('note'),
      };

      const res = await apiCall(`/api/inventory/${productId}/adjust`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to adjust inventory');
      }

      const result = await res.json();

      toast.success(`Inventory adjusted: ${result.previousStock} → ${result.newStock} units`);
      reset()
      onSave()
      setOpen(false)
    } catch (err) {
      console.error('Inventory adjustment error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to adjust inventory')
    }
  }

  const handleSubmitWrapper = () => {
    if (isNaN(parsedQuantity)) {
      toast.error('Invalid quantity input')
      return
    }

    if (finalQty < 0) {
      setConfirmOpen(true)
    } else {
      submitForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Adjust Inventory</DialogTitle>
              <p className="text-sm text-gray-600">Modify stock levels for this product</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Vendor</span>
                  <p className="font-semibold text-blue-900">{vendorName || '—'}</p>
                </div>
              </div>
            </div>

            {/* Warehouse Selector */}
            {warehouses && warehouses.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-purple-700">Warehouse</span>
                    <select
                      value={selectedWarehouseId}
                      onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                      className="w-full mt-1 text-sm font-semibold text-purple-900 bg-white border border-purple-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {warehouses.map((wh) => (
                        <option key={wh.warehouse_id} value={wh.warehouse_id}>
                          {wh.warehouse_name} ({wh.warehouse_code}) — {wh.quantity} units
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className={`border rounded-xl p-4 ${
              activeStock > 0 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  activeStock > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg className={`h-4 w-4 ${
                    activeStock > 0 ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <span className={`text-sm font-medium ${
                    activeStock > 0 ? 'text-green-700' : 'text-red-700'
                  }`}>Current Stock{warehouses && warehouses.length > 1 ? ' (selected warehouse)' : ''}</span>
                  <p className={`text-lg font-bold ${
                    activeStock > 0 ? 'text-green-900' : 'text-red-900'
                  }`}>{activeStock} units</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Adjustment Mode</label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setMode('relative')}
                className={`flex-1 h-11 font-semibold transition-all duration-200 ${
                  mode === 'relative'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                }`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                +/- Adjustment
              </Button>
              <Button
                type="button"
                onClick={() => setMode('absolute')}
                className={`flex-1 h-11 font-semibold transition-all duration-200 ${
                  mode === 'absolute'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-purple-300'
                }`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Overwrite
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleSubmitWrapper)} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {mode === 'relative' ? 'Adjustment Amount' : 'New Stock Value'}
                </label>
                <Input
                  type="number"
                  {...register('quantity', { required: true })}
                  placeholder={mode === 'relative' ? '+10 or -5' : 'New stock value'}
                  className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Reason</label>
                <Input 
                  {...register('reason')} 
                  placeholder="e.g. audit, restock, damage, sale return"
                  required 
                  className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes (Optional)</label>
                <Input 
                  {...register('note')} 
                  placeholder="Additional details about this adjustment"
                  className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
                />
              </div>
            </div>

            {/* Preview */}
            <div className={`border rounded-xl p-4 ${
              isNaN(finalQty) || finalQty < 0
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                : finalQty === activeStock
                ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Final Stock Level:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    isNaN(finalQty) || finalQty < 0 ? 'text-red-700' 
                    : finalQty === activeStock ? 'text-gray-700'
                    : 'text-green-700'
                  }`}>
                    {isNaN(finalQty) ? '–' : finalQty} units
                  </span>
                  {!isNaN(finalQty) && finalQty !== activeStock && (
                    <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                      changeAmount > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {changeAmount > 0 ? '+' : ''}{changeAmount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm Adjustment
                </div>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-gray-900">
                  Negative Stock Warning
                </AlertDialogTitle>
                <p className="text-sm text-gray-600">This adjustment will result in negative inventory</p>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This adjustment will set the stock to <strong>{finalQty}</strong> units, 
              which is below zero. This may indicate overselling or data entry errors.
            </p>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to proceed with this adjustment?
          </p>
          
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={submitForm}
              className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-semibold"
            >
              Yes, Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
