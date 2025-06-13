'use client'

interface LineItem {
  total_price: number
}

interface PriceSummaryBoxProps {
  items: LineItem[]
  taxRate?: number // default: 8.25%
}

export default function PriceSummaryBox({ items, taxRate = 0.0825 }: PriceSummaryBoxProps) {
  const subtotal = items.reduce((acc, item) => acc + Number(item.total_price), 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return (
    <div className="p-4 rounded-xl bg-muted/20 w-full max-w-md ml-auto">
      <div className="flex justify-between text-sm mb-2">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-base">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  )
}
