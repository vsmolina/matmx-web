'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface QuoteItem {
  product_id: number
  quantity: number
  unit_price: number
  markup_percent?: number
  discount_percent?: number
  total_price: number
}

interface LineItemEditorProps {
  items: QuoteItem[]
  onItemsChange: (updated: QuoteItem[]) => void
}

export default function LineItemEditor({ items, onItemsChange }: LineItemEditorProps) {
  const updateItem = (index: number, field: keyof QuoteItem, value: number) => {
    const updated = [...items]
    const item = { ...updated[index], [field]: value }

    // Recalculate total price
    const markedUp = item.unit_price * (1 + (item.markup_percent || 0) / 100)
    const discounted = markedUp * (1 - (item.discount_percent || 0) / 100)
    item.total_price = Number((discounted * item.quantity).toFixed(2))

    updated[index] = item
    onItemsChange(updated)
  }

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index)
    onItemsChange(updated)
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
          <div>
            <Label>Product ID</Label>
            <Input
              type="number"
              value={item.product_id}
              onChange={(e) => updateItem(i, 'product_id', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Qty</Label>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              value={item.unit_price}
              onChange={(e) => updateItem(i, 'unit_price', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Markup %</Label>
            <Input
              type="number"
              value={item.markup_percent || 0}
              onChange={(e) => updateItem(i, 'markup_percent', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Discount %</Label>
            <Input
              type="number"
              value={item.discount_percent || 0}
              onChange={(e) => updateItem(i, 'discount_percent', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Total</Label>
            <Input value={item.total_price.toFixed(2)} disabled />
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeItem(i)}>Remove</Button>
        </div>
      ))}
    </div>
  )
}
