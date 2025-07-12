'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

export default function ConvertToOrderDialog({
  open,
  onClose,
  quoteId,
  onConverted
}: {
  open: boolean
  onClose: () => void
  quoteId: number
  onConverted: () => void
}) {
  const [status, setStatus] = useState('received')
  const [shippingMethod, setShippingMethod] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!shippingMethod.trim()) {
      toast.error('Please enter a shipping method')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/sales/quotes/${quoteId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          shipping_method: shippingMethod,
          status,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to convert quote')
      }

      toast.success('Quote converted to order')
      onClose()
      onConverted()
    } catch (err) {
      console.error(err)
      toast.error('Error converting quote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Convert Quote to Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="shipping_method">Shipping Method</Label>
          <Input
            id="shipping_method"
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value)}
            placeholder="e.g. FedEx, UPS, Hand delivery"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Initial Fulfillment Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="received">Received</option>
            <option value="packed">Packed</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Converting...' : 'Convert'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
