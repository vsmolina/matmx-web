'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface SendQuoteEmailButtonProps {
  quoteId: number
  customerEmail: string
}

export default function SendQuoteEmailButton({ quoteId, customerEmail }: SendQuoteEmailButtonProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('Quote from MatMX')
  const [caption, setCaption] = useState('')
  const [body, setBody] = useState('Please find the attached quote. Let us know if you have any questions.')
  const [loading, setLoading] = useState(false)
  const [hasPDF, setHasPDF] = useState(false)

  useEffect(() => {
    checkPDFExists()
  }, [quoteId])

  async function checkPDFExists() {
    try {
      const res = await fetch(`http://localhost:4000/api/email/quote/${quoteId}/pdf`, { 
        method: 'GET', 
        credentials: 'include' 
      })
      setHasPDF(res.ok)
    } catch (error) {
      // Silently handle 404 errors - PDF endpoint may not exist
      setHasPDF(false)
    }
  }

  async function handleSend() {
    if (!hasPDF) {
      toast.error('You must generate the PDF before sending.');
      return;
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quoteId,
          to: customerEmail,
          subject,
          caption,
          body
        })
      })

      if (!res.ok) throw new Error('Send failed')

      toast.success('Email sent')
      setOpen(false)
    } catch (err) {
      toast.error('Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setOpen(true)
    checkPDFExists()
  }

  return (
    <>
      <Button size='sm' variant="outline" onClick={handleOpenDialog}>
        Email Quote
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quote Email</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input disabled value={customerEmail} placeholder="Recipient Email" />
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
            <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Optional Caption" />
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Message Body" rows={6} />
            {hasPDF ? (
              <p className="text-green-600 text-sm font-medium">✅ Quote PDF will be attached</p>
            ) : (
              <p className="text-yellow-600 text-sm font-medium">⚠️ PDF not found — generate before sending</p>
            )}
            <Button onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
