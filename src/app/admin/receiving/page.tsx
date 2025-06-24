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

export default function ReceivingPage() {
  const [scanned, setScanned] = useState<string | null>(null)
  const [openScanner, setOpenScanner] = useState(false)
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0)

  const { product, loading, error } = useFetchProductByBarcode(scanned)

  const handleScan = (barcode: string) => {
    toast.dismiss()
    toast.success('Product scanned')
    setScanned(barcode)
    setOpenScanner(false)
  }

  const reset = () => setScanned(null)

  const handleSubmitted = () => {
    reset()
    setInventoryRefreshKey((prev) => prev + 1)
  }

  return (
    <AdminGuard allowedRoles={['super_admin', 'inventory_manager', 'warehouse_worker']}>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">Receiving</h1>

        {!scanned && (
          <Button onClick={() => setOpenScanner(true)}>Scan Product</Button>
        )}

        <ScanBarcodeDialog
          open={openScanner}
          onClose={() => setOpenScanner(false)}
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
              <ReceivingForm product={product} onSubmitted={handleSubmitted} />
            )}
          </div>
        )}

        <InventoryTableViewOnly key={inventoryRefreshKey} />
      </div>
    </AdminGuard>
  )
}
