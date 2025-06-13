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

interface EmailQuoteDialogProps {
  quoteId: number
}

export default function EmailQuoteDialog({ quoteId }: EmailQuoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)
    try {
      const res = await fetch(`http://localhost:4000/api/sales/quotes/${quoteId}/email`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!res.ok) throw new Error()
      toast.success('Quote emailed')
      setOpen(false)
    } catch {
      toast.error('Failed to email quote')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email Quote #{quoteId}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Send a copy of this quote to the customer via email?
        </p>

        <Button onClick={handleSend} disabled={sending} className="w-full">
          {sending ? 'Sending...' : 'Send Quote Email'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
