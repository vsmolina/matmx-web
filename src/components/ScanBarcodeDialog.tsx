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
      <DialogContent className="max-w-lg w-[95vw] sm:w-full mx-auto rounded-2xl p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Scan Barcode</DialogTitle>
                <p className="text-blue-100 text-sm mt-1">Point camera at barcode to scan</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Scanner Content */}
        <div className="p-6">
          {showScanner ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black">
                <BarcodeScanner ref={scannerRef} onDetected={handleDetected} />
                {/* Overlay with scanning guide */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white rounded-lg opacity-60">
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-blue-500 rounded-tl"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-blue-500 rounded-tr"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-blue-500 rounded-bl"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-blue-500 rounded-br"></div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                    Align barcode within frame
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm">Scanning Tips</h4>
                    <ul className="text-blue-700 text-xs mt-1 space-y-1">
                      <li>• Hold camera steady</li>
                      <li>• Ensure good lighting</li>
                      <li>• Keep barcode flat and visible</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Cancel Button */}
              <Button 
                onClick={handleClose}
                variant="outline"
                className="w-full border-2 border-gray-300 hover:border-gray-400"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing camera...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
