'use client'

import { useState } from 'react'
import { Product } from '@/types/ProductTypes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import LabelPrintDialog from './LabelPrintDialog'

interface ReceivingFormProps {
  product: Product
  onSubmitted?: () => void
}

export default function ReceivingForm({ product, onSubmitted }: ReceivingFormProps) {
  const [quantity, setQuantity] = useState<number | ''>(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [hasReceived, setHasReceived] = useState(false) // ✅ prevent double update

  const handleReceive = async () => {
    if (hasReceived || quantity === '' || quantity <= 0) {
      toast.error('Invalid quantity or already received')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`http://localhost:4000/api/inventory/${product.id}/adjust`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          change: quantity,
          reason: 'received',
          note: note || 'Received via scan',
        }),
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
    <div className="space-y-4 p-4 border rounded-md bg-white shadow-md max-w-xl mx-auto">
      <div>
        <Label>Product</Label>
        <div className="text-lg font-semibold">{product.name}</div>
        <div className="text-sm text-gray-500">{product.sku} — {product.vendor}</div>
        <div className="text-sm text-gray-600 mt-1">Current Stock: {product.stock}</div>
      </div>

      <div>
        <Label>Quantity Received</Label>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            setQuantity(isNaN(val) ? '' : val)
          }}
        />
      </div>

      <div>
        <Label>Note</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
        />
      </div>

      <Button disabled={loading || hasReceived} onClick={handleReceive}>
        {loading ? 'Receiving...' : 'Receive and Print Labels'}
      </Button>

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
