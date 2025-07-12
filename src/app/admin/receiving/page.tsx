'use client'

import { useState } from 'react'
import AdminGuard from '@/components/AdminGuard'
import ReceivingForm from '@/components/ReceivingForm'
import InventoryTableViewOnly from '@/components/InventoryTableViewOnly'
import { useFetchProductByBarcode } from '@/hooks/useFetchProductByBarcode'
import { Product } from '@/types/ProductTypes'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import ScanBarcodeDialog from '@/components/ScanBarcodeDialog'
import ChooseScanMethodDialog from '@/components/ChooseScanMethodDialog'
import TeraScannerDialog from '@/components/TeraScannerDialog'

export default function ReceivingPage() {
  const [scanned, setScanned] = useState<string | null>(null)
  const [openScanner, setOpenScanner] = useState(false)
  const [showChooseScan, setShowChooseScan] = useState(false)
  const [useTera, setUseTera] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0)
  const [showTeraDialog, setShowTeraDialog] = useState(false)

  const { product, loading, error } = useFetchProductByBarcode(scanned)

  const handleScan = (barcode: string) => {
    toast.dismiss()
    toast.success(`Scanned: ${barcode}`)
    setScanned(barcode)
    setOpenScanner(false)
    setUseTera(false)
    setInputValue('')
    setShowTeraDialog(false)
  }

  const reset = () => {
    setScanned(null)
    setInputValue('')
    setUseTera(false)
  }

  const handleSubmitted = () => {
    reset()
    setInventoryRefreshKey((prev) => prev + 1)
  }

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      handleScan(inputValue.trim())
    }
  }

  return (
    <AdminGuard allowedRoles={['super_admin', 'inventory_manager', 'warehouse_worker']}>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">Receiving</h1>

        {!scanned && (
          <>
            <Button onClick={() => setShowChooseScan(true)}>Scan Product</Button>
            <ChooseScanMethodDialog
              open={showChooseScan}
              onClose={() => setShowChooseScan(false)}
              onSelect={(method) => {
                setShowChooseScan(false)
                if (method === 'camera') setOpenScanner(true)
                else if (method === 'tera') setShowTeraDialog(true)
              }}
            />
          </>
        )}

        {useTera && !scanned && (
          <form onSubmit={handleManualScanSubmit}>
            <input
              autoFocus
              className="border p-2 rounded w-full"
              placeholder="Scan barcode with Tera scanner"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </form>
        )}

        <ScanBarcodeDialog
          open={openScanner}
          onClose={() => setOpenScanner(false)}
          onScanned={handleScan}
        />

        <TeraScannerDialog
          open={showTeraDialog}
          onClose={() => setShowTeraDialog(false)}
          onScanned={handleScan}
        />

        {scanned && (
          <div className="space-y-4">
            {loading && <p>Loading product details...</p>}
            {error && (
              <div className="text-red-600">
                Product not found for barcode: {scanned}
                <div>
                  <Button onClick={reset} className="mt-2">Try Again</Button>
                </div>
              </div>
            )}
            {product && (
              <>
                <ReceivingForm product={product} onSubmitted={handleSubmitted} />
                <div>
                  <Button variant="secondary" onClick={reset}>
                    Cancel and Reset
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <InventoryTableViewOnly key={inventoryRefreshKey} />
      </div>
    </AdminGuard>
  )
}
