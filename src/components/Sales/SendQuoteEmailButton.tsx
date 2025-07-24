'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { Mail } from 'lucide-react'

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
        <DialogContent className="w-[90vw] max-w-lg mx-auto rounded-2xl overflow-hidden p-0 md:w-[500px] md:max-w-none [&>button]:hidden">
          {/* Header with green gradient */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    Send Quote Email
                  </DialogTitle>
                  <p className="text-green-100 text-sm mt-1">
                    Send quote to customer via email
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                <Input disabled value={customerEmail} className="bg-gray-50" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
                <Input value={caption} onChange={e => setCaption(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                <Textarea value={body} onChange={e => setBody(e.target.value)} rows={6} />
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {hasPDF ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Quote PDF will be attached</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">PDF not found — generate before sending</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSend}
                disabled={loading || !hasPDF}
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl disabled:bg-gray-400"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
