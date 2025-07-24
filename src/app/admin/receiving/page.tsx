'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import AdminGuard from '@/components/AdminGuard'
import ReceivingForm from '@/components/ReceivingForm'
import InventoryTableViewOnly from '@/components/InventoryTableViewOnly'
import { useFetchProductByBarcode } from '@/hooks/useFetchProductByBarcode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [inventorySearch, setInventorySearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Loading protection ref
  const loadingRef = useRef(false)

  const { product, loading: productLoading, error } = useFetchProductByBarcode(scanned)

  // Memoized handlers to prevent excessive re-renders and API calls
  const handleScan = useCallback((barcode: string) => {
    if (loadingRef.current) return
    
    toast.dismiss()
    toast.success(`Scanned: ${barcode}`)
    setScanned(barcode)
    setOpenScanner(false)
    setUseTera(false)
    setInputValue('')
    setShowTeraDialog(false)
  }, [])

  const reset = useCallback(() => {
    if (loadingRef.current) return
    
    setScanned(null)
    setInputValue('')
    setUseTera(false)
  }, [])

  const handleSubmitted = useCallback(() => {
    if (loadingRef.current) return
    
    reset()
    setInventoryRefreshKey((prev) => prev + 1)
  }, [reset])

  const handleManualScanSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (loadingRef.current || !inputValue.trim()) return
    
    handleScan(inputValue.trim())
  }, [inputValue, handleScan])

  // Debounced search handler
  const debouncedSetInventorySearch = useCallback(
    useMemo(() => {
      let timeoutId: NodeJS.Timeout
      return (value: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setInventorySearch(value)
        }, 300)
      }
    }, []),
    []
  )

  // Modal handlers
  const handleShowChooseScan = useCallback(() => {
    if (loadingRef.current) return
    setShowChooseScan(true)
  }, [])

  const handleCloseChooseScan = useCallback(() => {
    setShowChooseScan(false)
  }, [])

  const handleScanMethodSelect = useCallback((method: string) => {
    setShowChooseScan(false)
    if (method === 'camera') setOpenScanner(true)
    else if (method === 'tera') setShowTeraDialog(true)
  }, [])

  const handleCloseScanner = useCallback(() => {
    setOpenScanner(false)
  }, [])

  const handleCloseTeraDialog = useCallback(() => {
    setShowTeraDialog(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleInventorySearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetInventorySearch(e.target.value)
  }, [debouncedSetInventorySearch])

  // Update loading ref when productLoading changes
  loadingRef.current = productLoading || loading

  return (
    <AdminGuard allowedRoles={['super_admin', 'inventory_manager', 'warehouse_worker']}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Mobile-First Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6 shadow-lg md:px-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Receiving</h1>
                <p className="text-blue-100 text-sm mt-1 md:text-base">Scan and receive inventory items</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4">
                <svg className="h-6 w-6 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6 max-w-7xl mx-auto">
          {!scanned && (
            <>
              {/* Mobile Scan Button - Primary Action */}
              <div className="md:hidden">
                <button 
                  onClick={handleShowChooseScan}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold">Scan Product</div>
                      <div className="text-blue-100 text-sm">Tap to scan barcode</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-between items-center">
                <Button 
                  onClick={handleShowChooseScan}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Scan Product
                </Button>
                <div className="relative w-full sm:w-80 group">
                  <Input
                    placeholder=""
                    value={inventorySearch}
                    onChange={handleInventorySearchChange}
                    className="w-full pr-4 h-12 border-2 border-gray-200 focus:border-blue-400"
                  />
                  {!inventorySearch && (
                    <div 
                      className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground overflow-hidden whitespace-nowrap"
                      style={{
                        width: 'calc(100% - 2rem)'
                      }}
                    >
                      <span className="group-hover:animate-slide-text-hover">
                        Search inventory by name, SKU, vendor, or category...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            <ChooseScanMethodDialog
              open={showChooseScan}
              onClose={handleCloseChooseScan}
              onSelect={handleScanMethodSelect}
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
              onChange={handleInputChange}
            />
          </form>
        )}

        <ScanBarcodeDialog
          open={openScanner}
          onClose={handleCloseScanner}
          onScanned={handleScan}
        />

        <TeraScannerDialog
          open={showTeraDialog}
          onClose={handleCloseTeraDialog}
          onScanned={handleScan}
        />

        {scanned && (
          <div className="space-y-4">
            {/* Loading State - Mobile Optimized */}
            {productLoading && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="h-16 w-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 h-16 w-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Loading Product Details</p>
                    <p className="text-sm text-gray-500 mt-1">Barcode: {scanned}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error State - Mobile Optimized */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-md">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-red-100 rounded-full p-4">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.833-2.02-.833-2.75 0L3.34 16c-.77.833.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Product Not Found</h3>
                    <p className="text-red-700 mt-1">No product found for barcode:</p>
                    <p className="font-mono text-sm bg-red-100 px-3 py-1 rounded-lg mt-2 inline-block">{scanned}</p>
                  </div>
                  <Button 
                    onClick={reset} 
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            
            {/* Success State with Product */}
            {product && (
              <div className="space-y-4 animate-fade-in">
                <ReceivingForm product={product} onSubmitted={handleSubmitted} />
                <div className="text-center px-4">
                  <Button 
                    variant="outline" 
                    onClick={reset}
                    className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 font-medium"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel and Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

          <InventoryTableViewOnly 
            key={inventoryRefreshKey} 
            searchTerm={inventorySearch} 
            onSearchChange={debouncedSetInventorySearch}
          />
        </div>
      </div>
    </AdminGuard>
  )
}
