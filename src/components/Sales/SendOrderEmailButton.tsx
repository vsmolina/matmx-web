'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiCall } from '@/lib/api'

interface Props {
  orderId: number
  customerEmail: string
}

export default function SendOrderEmailButton({ orderId, customerEmail }: Props) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('Order Confirmation')
  const [body, setBody] = useState('Attached is your order confirmation PDF. Thank you!')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!customerEmail) {
      toast.error('Customer email not available')
      return
    }
    setLoading(true)
    try {
      const res = await apiCall('/api/email/send', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          subject,
          body,
          orderId
        })
      })
      if (!res.ok) throw new Error()
      toast.success('Email sent')
      setOpen(false)
    } catch {
      toast.error('Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
        <Mail className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Order Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject"
            />
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Body text"
              rows={5}
            />
            <p className="text-green-600 text-sm font-medium">✅ Order PDF will be attached</p>
          </div>
          <DialogFooter>
            <Button onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
