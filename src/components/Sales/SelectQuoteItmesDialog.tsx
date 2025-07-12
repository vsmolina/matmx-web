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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
          <DialogDescription>
            Add quantities for the products you want to quote
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-2 space-y-4">
          {products.map(product => {
            const item = selected.find(i => i.product_id === product.id)

            return (
              <div key={product.id} className="flex items-center gap-4 border-b pb-2">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                  <p className="text-sm mt-1">{formatCurrency(product.unit_price)}</p>
                </div>

                {item ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e =>
                        handleQtyChange(product.id, Number(e.target.value))
                      }
                      className="w-20"
                    />
                    <Button variant="ghost" onClick={() => handleRemove(product.id)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleQtyChange(product.id, 1)}>Add</Button>
                )}
              </div>
            )
          })}
        </ScrollArea>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSubmit} disabled={selected.length === 0}>
            Add {selected.length} item{selected.length !== 1 && 's'} to Quote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
