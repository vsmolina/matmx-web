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
      <DialogContent className="max-w-lg w-[95vw] sm:w-full mx-auto rounded-2xl p-0" hideCloseButton>
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Tera Scanner</DialogTitle>
                <p className="text-green-100 text-sm mt-1">Scan using handheld device</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scan Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="scan" className="text-sm font-medium text-gray-700 mb-2 block">
                Scan Barcode
              </Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="scan"
                  placeholder="Position cursor here and scan..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoFocus
                  className="w-full h-14 text-lg border-2 border-gray-200 focus:border-green-500 rounded-xl pl-12 font-mono"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">Ready to scan</span>
              </div>
            </div>
          </form>

          {/* Connection Instructions Toggle */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowInstructions((prev) => !prev)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-full p-2">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">
                  {showInstructions ? 'Hide Setup Instructions' : 'Scanner Setup Instructions'}
                </span>
              </div>
              <svg 
                className={`h-5 w-5 text-gray-500 transition-transform ${showInstructions ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Instructions Panel */}
            {showInstructions && (
              <div className="mt-4 bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4 animate-fade-in">
                <h3 className="font-semibold text-gray-900 text-lg">Scanner Connection Options</h3>
                
                {/* Option 1 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">2.4G USB Connection</h4>
                      <p className="text-blue-800 text-sm">
                        Plug the included USB receiver into your computer. The scanner will automatically connect and be ready to use.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Option 2 */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Bluetooth Connection</h4>
                      <div className="text-purple-800 text-sm space-y-1">
                        <p>• Power on the scanner</p>
                        <p>• Scan the "Bluetooth HID" barcode from manual</p>
                        <p>• Pair via system Bluetooth (name: "Tera Barcode Scanner")</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-600 rounded-full p-2 flex-shrink-0">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">Troubleshooting</h4>
                      <p className="text-amber-800 text-sm">
                        If connection fails, scan the "Restore Default Settings" barcode and try again.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final Step */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 rounded-full p-2">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-800 text-sm font-medium">
                      Once connected, click in the input field above and scan your barcode
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
