'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onSelect: (method: 'camera' | 'tera') => void
  onClose: () => void
}

export default function ChooseScanMethodDialog({ open, onSelect, onClose }: Props) {
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null)

  useEffect(() => {
    if (open) {
      checkCameraAccess()
    }
  }, [open])

  const checkCameraAccess = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraAccess(false)
        return
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      if (videoDevices.length === 0) {
        setHasCameraAccess(false)
        return
      }

      // Test if we can actually access a camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      // Stop the stream immediately since we just needed to test access
      stream.getTracks().forEach(track => track.stop())
      setHasCameraAccess(true)
    } catch (error) {
      console.warn('Camera access check failed:', error)
      setHasCameraAccess(false)
    }
  }

  const getCameraButtonText = () => {
    if (hasCameraAccess === null) return 'Checking Camera...'
    if (hasCameraAccess === false) return 'Camera Unavailable'
    return 'Use Camera'
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-2xl p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Select Scan Method</DialogTitle>
              <p className="text-blue-100 text-sm mt-1">Choose how you want to scan the barcode</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Camera Option */}
          <button
            onClick={() => hasCameraAccess === true && onSelect('camera')}
            disabled={hasCameraAccess !== true}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 ${
              hasCameraAccess === true
                ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-3 ${
                hasCameraAccess === true ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className={`font-semibold text-lg ${
                  hasCameraAccess === true ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {getCameraButtonText()}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {hasCameraAccess === null ? 'Checking camera permissions...' :
                   hasCameraAccess === false ? 'Camera access denied or unavailable' :
                   'Scan using your device camera'}
                </div>
              </div>
              {hasCameraAccess === true && (
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </button>

          {/* Tera Scanner Option */}
          <button
            onClick={() => onSelect('tera')}
            className="w-full p-6 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300 hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-600 rounded-full p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-lg text-gray-900">Use Tera Scanner</div>
                <div className="text-sm text-gray-500 mt-1">Scan using handheld scanner device</div>
              </div>
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
