'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

export default function LogInteractionDialog({ customerId, open, onOpenChange, onSuccess }: any) {
  const [type, setType] = useState('call')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/${customerId}/logs`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, note })
      })
      if (!res.ok) throw new Error('Failed to log interaction')
      toast.success('Interaction logged')
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
        </DialogHeader>

        <Label className="mb-1 block">Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Interaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>

        <Label className="mb-1 block">Note</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened?" className="mb-4" />

        <Button onClick={handleSubmit} disabled={loading}>Log</Button>
      </DialogContent>
    </Dialog>
  )
}
