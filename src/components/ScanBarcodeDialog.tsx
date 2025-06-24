'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import BarcodeScanner, { BarcodeScannerHandle } from './BarcodeScanner'
import toast from 'react-hot-toast'

interface ScanBarcodeDialogProps {
  open: boolean
  onClose: () => void
  onScanned: (barcode: string) => void
}

export default function ScanBarcodeDialog({ open, onClose, onScanned }: ScanBarcodeDialogProps) {
  const [scanned, setScanned] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const scannerRef = useRef<BarcodeScannerHandle>(null)

  const handleDetected = (barcode: string) => {
    if (scanned) return
    setScanned(true)
    toast.loading('Scanning...')
    onScanned(barcode)
    handleClose()
  }

  const handleClose = () => {
    scannerRef.current?.stopCamera()
    onClose()
  }

  useEffect(() => {
    if (open) {
      setScanned(false)
      setShowScanner(true)
    } else {
      setShowScanner(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose()
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>
        {showScanner && (
          <BarcodeScanner ref={scannerRef} onDetected={handleDetected} />
        )}
      </DialogContent>
    </Dialog>
  )
}
