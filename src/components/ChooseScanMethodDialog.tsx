'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onSelect: (method: 'camera' | 'tera') => void
  onClose: () => void
}

export default function ChooseScanMethodDialog({ open, onSelect, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-sm space-y-4">
        <DialogHeader>
          <DialogTitle>Select Scan Method</DialogTitle>
        </DialogHeader>
        <Button onClick={() => onSelect('camera')} className="w-full">Use Camera</Button>
        <Button onClick={() => onSelect('tera')} className="w-full">Use Tera Scanner</Button>
      </DialogContent>
    </Dialog>
  )
}
