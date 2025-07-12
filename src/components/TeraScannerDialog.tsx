'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

export default function TeraScannerDialog({
  open,
  onClose,
  onScanned
}: {
  open: boolean
  onClose: () => void
  onScanned: (barcode: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed.length > 0) {
      toast.success(`Scanned: ${trimmed}`)
      onScanned(trimmed)
      setValue('')
      onClose()
    }
  }

  useEffect(() => {
    if (open) {
      setValue('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Scan with Tera Scanner</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Label htmlFor="scan">Scan a barcode</Label>
          <Input
            ref={inputRef}
            id="scan"
            placeholder="Scan here with Tera scanner"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        </form>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setShowInstructions((prev) => !prev)}
        >
          {showInstructions ? 'Hide Instructions' : 'How to Connect the Scanner'}
        </Button>

        {showInstructions && (
          <div className="p-3 border rounded bg-gray-50 text-sm text-gray-700 space-y-2">
            <p className="font-semibold">Tera Scanner Setup Options:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Option 1: 2.4G USB</strong><br />
                Plug the included receiver into your USB port. The scanner will auto-connect.
              </li>
              <li>
                <strong>Option 2: Bluetooth</strong><br />
                - Power on the scanner<br />
                - Scan the “Bluetooth HID” barcode from the manual or select it from the connections menu in the scanner<br />
                - Pair via system Bluetooth (usually named “Tera Barcode Scanner”)
              </li>
              <li>
                If pairing fails, scan the “Restore Default Settings” barcode and try again.
              </li>
            </ul>
            <p className="mt-2">Once connected, scan a barcode into the input field above.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
