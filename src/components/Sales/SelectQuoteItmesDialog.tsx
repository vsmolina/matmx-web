'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'react-hot-toast'

interface Product {
  id: number
  name: string
  default_price: number
}

interface QuoteItem {
  product_id: number
  quantity: number
  unit_price: number
  markup_percent?: number
  discount_percent?: number
  total_price: number
}

interface SelectQuoteItemsDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (items: QuoteItem[]) => void
  initialItems?: QuoteItem[]
}

export default function SelectQuoteItemsDialog({
  open,
  onClose,
  onConfirm,
  initialItems = []
}: SelectQuoteItemsDialogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Record<number, QuoteItem>>({})

  useEffect(() => {
    if (!open) return

    fetch('http://localhost:4000/api/inventory/', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.products)) {
          const clean = data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            default_price: Number(p.unit_price) || 0
          }))
          setProducts(clean)
        } else {
          toast.error('Invalid product data')
          setProducts([])
        }
      })
      .catch(() => toast.error('Failed to load products'))
  }, [open])

  useEffect(() => {
    const initMap = initialItems.reduce((map, item) => {
      map[item.product_id] = item
      return map
    }, {} as Record<number, QuoteItem>)
    setSelected(initMap)
  }, [initialItems])

  const handleQtyChange = (productId: number, qty: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const unit_price = product.default_price
    const total_price = qty * unit_price

    setSelected(prev => ({
      ...prev,
      [productId]: {
        product_id: productId,
        quantity: qty,
        unit_price,
        total_price
      }
    }))
  }

  const handleRemove = (productId: number) => {
    const copy = { ...selected }
    delete copy[productId]
    setSelected(copy)
  }

  const items = Object.values(selected)
  const total = items.reduce((sum, i) => sum + i.total_price, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
          <DialogDescription>Select inventory items and enter quantities</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-2 space-y-4">
          {products.map(product => {
            const item = selected[product.id]
            return (
              <div key={product.id} className="flex items-center gap-4 border-b pb-2">
                <div className="flex-1">
                  <Label>{product.name}</Label>
                  <p className="text-sm text-muted-foreground">
                    ${product.default_price.toFixed(2)} per unit
                  </p>
                </div>
                {item ? (
                  <>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleQtyChange(product.id, Number(e.target.value))}
                      className="w-20"
                    />
                    <Button variant="ghost" onClick={() => handleRemove(product.id)}>
                      Remove
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => handleQtyChange(product.id, 1)}>Add</Button>
                )}
              </div>
            )
          })}
        </ScrollArea>

        <div className="flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">Total: ${total.toFixed(2)}</div>
          <Button onClick={() => onConfirm(items)}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
