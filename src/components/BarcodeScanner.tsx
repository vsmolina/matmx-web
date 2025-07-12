'use client'

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export interface BarcodeScannerHandle {
  stopCamera: () => void
}

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
}

function getInitialFacingMode(): 'environment' | 'user' {
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
  return isMobile ? 'environment' : 'user'
}

const BarcodeScanner = forwardRef<BarcodeScannerHandle, BarcodeScannerProps>(
  ({ onDetected }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [hasScanned, setHasScanned] = useState(false)
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
      getInitialFacingMode
    )
    const reader = useRef<BrowserMultiFormatReader | null>(null)

    const stopCameraStream = () => {
    const video = videoRef.current
    if (video && video.srcObject instanceof MediaStream) {
        const stream = video.srcObject
        stream.getTracks().forEach((track) => track.stop())
        video.srcObject = null
    }
    }

    const restartScanner = () => {
      const video = videoRef.current
      if (!video) return

      stopCameraStream()

      const constraints = {
        video: {
          facingMode: facingMode === 'environment'
            ? { ideal: 'environment' }
            : 'user',
        },
      }

      const codeReader = new BrowserMultiFormatReader()
      reader.current = codeReader

      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          video.srcObject = stream
          return new Promise<void>((resolve) => {
            video.onloadedmetadata = () => {
              video.play()
              resolve()
            }
          })
        })
        .then(() => {
          return codeReader.decodeOnceFromVideoElement(video)
        })
        .then((result) => {
          if (!hasScanned) {
            setHasScanned(true)
            new Audio('/sounds/beep.mp3').play()
            onDetected(result.getText())
          }
        })
        .catch((err) => {
          console.error('Camera error:', err)
          if (err.name === 'OverconstrainedError') {
            toast.error('Rear camera not available on this device')
          }
        })
    }


    useImperativeHandle(ref, () => ({
      stopCamera: () => {
        console.log('🔴 stopCamera CALLED') // ✅ Add this log

        const video = videoRef.current
        if (video && video.srcObject instanceof MediaStream) {
          console.log('📷 Stopping video tracks...')
          video.srcObject.getTracks().forEach((track) => track.stop())
          video.srcObject = null
        } else {
          console.log('⚠️ No active media stream to stop')
        }
      }
    }))

    useEffect(() => {
      restartScanner()

      return () => {
        stopCameraStream()
      }
    }, [facingMode, onDetected, hasScanned])

    const toggleCamera = () => {
      const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
      if (!isMobile) return
      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
    }

    return (
      <div className="relative w-full aspect-video overflow-hidden rounded shadow">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <div className="absolute top-1/2 left-0 w-full h-[5px] bg-red-500 opacity-70 animate-scanner-line pointer-events-none" />

        {/* Mobile-only toggle button */}
        <div className="sm:hidden absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
          <Button variant="secondary" size="sm" onClick={toggleCamera}>
            Switch Camera
          </Button>
        </div>
      </div>
    )
  }
)

export default BarcodeScanner
