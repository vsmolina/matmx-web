'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select'
import toast from 'react-hot-toast'

const STAGES = ['lead', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost']

export default function PipelineStageDialog({ customerId, open, onOpenChange, onSuccess }: any) {
  const [stage, setStage] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/${customerId}/pipeline`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, comment })
      })
      if (!res.ok) throw new Error('Failed to update pipeline')
      toast.success('Stage updated')
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
          <DialogTitle>Update Sales Stage</DialogTitle>
        </DialogHeader>

        <Label className="block mb-1">Stage</Label>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map(s => (
              <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label className="block mt-4 mb-1">Comment (optional)</Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Context or note"
        />

        <div className="flex justify-end pt-4">
          <Button onClick={submit} disabled={loading || !stage}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
