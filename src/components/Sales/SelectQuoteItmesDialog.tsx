'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product } from '@/types/ProductTypes'
import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Package } from 'lucide-react'

interface SelectQuoteItemsDialogProps {
  open: boolean
  onClose: () => void
  products: Product[]
  onSelect: (items: { product_id: number; quantity: number; unit_price: number }[]) => void
  initialItems?: { product_id: number; quantity: number; unit_price: number }[]
}

export default function SelectQuoteItemsDialog({
  open,
  onClose,
  products,
  onSelect,
  initialItems = [],
}: SelectQuoteItemsDialogProps) {
  const [selected, setSelected] = useState<
    { product_id: number; quantity: number; unit_price: number }[]
  >([])

  useEffect(() => {
    if (open) setSelected(initialItems || [])
  }, [open, initialItems])

  const handleQtyChange = (product_id: number, quantity: number) => {
    if (quantity <= 0) return
    
    setSelected(prev => {
      const existing = prev.find(p => p.product_id === product_id)
      const product = products.find(p => p.id === product_id)

      if (existing) {
        return prev.map(p =>
          p.product_id === product_id ? { ...p, quantity } : p
        )
      } else {
        return [
          ...prev,
          {
            product_id,
            quantity,
            unit_price: product?.unit_price || 0,
          },
        ]
      }
    })
  }

  const handleRemove = (product_id: number) => {
    setSelected(prev => prev.filter(p => p.product_id !== product_id))
  }

  const handleSubmit = () => {
    onSelect(selected.filter(i => i.quantity > 0))
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-3xl mx-auto rounded-2xl overflow-hidden p-0 md:w-[800px] md:max-w-none [&>button]:hidden">
        {/* Header with neutral gradient */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Select Products
                </DialogTitle>
                <p className="text-gray-100 text-sm mt-1">
                  Add quantities for the products you want to quote
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-3">
              {products.map((product, index) => {
                const item = selected.find(i => i.product_id === product.id)

                return (
                  <div key={`product-${product.id}-${index}`} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{product.sku}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{formatCurrency(product.unit_price)}</span>
                          <span>Stock: {product.stock}</span>
                          {product.category && <span>Category: {product.category}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item ? (
                          <>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">Qty:</label>
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity.toString()}
                                onChange={e => {
                                  const value = e.target.value
                                  const numValue = parseInt(value, 10)
                                  if (!isNaN(numValue) && numValue >= 1) {
                                    handleQtyChange(product.id, numValue)
                                  }
                                }}
                                onBlur={e => {
                                  const value = e.target.value
                                  const numValue = parseInt(value, 10)
                                  if (isNaN(numValue) || numValue < 1) {
                                    handleQtyChange(product.id, 1)
                                  }
                                }}
                                className="w-20 h-9"
                                data-product-id={product.id}
                              />
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemove(product.id)}
                              className="h-9 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              Remove
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleQtyChange(product.id, 1)}
                            className="h-9 bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            Add to Quote
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {item && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                        <span className="text-sm text-gray-600">Subtotal: </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency((product.unit_price || 0) * item.quantity)}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Summary and Actions */}
          {selected.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Selected Products Summary</span>
                <span className="text-sm text-gray-600">{selected.length} item(s)</span>
              </div>
              <div className="space-y-2 mb-3">
                {selected.map((item) => {
                  const product = products.find(p => p.id === item.product_id)
                  return (
                    <div key={item.product_id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate block">
                          {product?.name || `Product #${item.product_id}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatCurrency(product?.unit_price || 0)} each
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) handleQtyChange(item.product_id, item.quantity - 1)
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.product_id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                        <span className="text-sm font-medium text-gray-900 w-20 text-right">
                          {formatCurrency((product?.unit_price || 0) * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.product_id)}
                          className="ml-1 text-red-400 hover:text-red-600 transition-colors p-1"
                          title="Remove"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="text-right border-t border-gray-200 pt-2">
                <span className="text-lg font-bold text-gray-900">
                  Total: {formatCurrency(
                    selected.reduce((sum, item) => {
                      const product = products.find(p => p.id === item.product_id)
                      return sum + ((product?.unit_price || 0) * item.quantity)
                    }, 0)
                  )}
                </span>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={selected.length === 0}
              className="flex-1 h-12 bg-gray-600 hover:bg-gray-700 rounded-xl disabled:bg-gray-400"
            >
              Add {selected.length} item{selected.length !== 1 ? 's' : ''} to Quote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
