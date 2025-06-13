'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface ConvertToOrderDialogProps {
  quoteId: number
  onConverted: (orderId: number) => void
}

export default function ConvertToOrderDialog({ quoteId, onConverted }: ConvertToOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConvert = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/sales/quotes/${quoteId}/convert`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success('Quote converted to order')
      onConverted(data.order_id)
      setOpen(false)
    } catch {
      toast.error('Conversion failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Convert</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert Quote #{quoteId}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Are you sure you want to convert this quote into an order?
        </p>

        <Button onClick={handleConvert} disabled={loading} className="w-full">
          {loading ? 'Converting...' : 'Convert to Order'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
