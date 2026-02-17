'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Textarea } from '@/components/ui/textarea'
import { apiCall } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ImportResult {
  success: number
  failed: number
  warnings?: number
  details?: any[]
  sheets?: any[]
}

export default function ImportExcelModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const [vendorId, setVendorId] = useState('1')
  const [category, setCategory] = useState('General')
  const [warehouseId, setWarehouseId] = useState('1')
  const [vendors, setVendors] = useState<{ id: number; name: string }[]>([])
  const [warehouses, setWarehouses] = useState<{ id: number; name: string }[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [fileType, setFileType] = useState<'csv' | 'excel'>('excel')

  // Fetch vendors and warehouses when modal opens
  useEffect(() => {
    if (open) {
      fetchVendors()
      fetchWarehouses()
    }
  }, [open])

  const fetchVendors = async () => {
    try {
      const res = await apiCall('/api/vendors')
      const data = await res.json()
      setVendors(data.vendors || [])
    } catch (err) {
      console.error('Error fetching vendors:', err)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const res = await apiCall('/api/warehouses')
      const data = await res.json()
      setWarehouses(data.warehouses || [])
    } catch (err) {
      console.error('Error fetching warehouses:', err)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0]
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File is too large (max 10MB)')
        return
      }
      setFile(selected)
      setImportResult(null)
      
      // Auto-detect file type
      const extension = selected.name.split('.').pop()?.toLowerCase()
      if (extension === 'csv') {
        setFileType('csv')
      } else if (['xlsx', 'xls'].includes(extension || '')) {
        setFileType('excel')
      }
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return toast.error('No file selected')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('note', note)
    formData.append('vendor_id', vendorId)
    formData.append('category', category)
    formData.append('warehouse_id', warehouseId)

    setUploading(true)
    setImportResult(null)
    
    try {
      const endpoint = fileType === 'excel' ? '/api/inventory/import-excel' : '/api/inventory/import'
      const res = await apiCall(endpoint, { 
        method: 'POST',
        body: formData 
      })

      let data
      try {
        data = await res.json()
      } catch (err) {
        throw new Error('Invalid JSON response — server may have crashed')
      }

      if (!res.ok) throw new Error(data.error || 'Upload failed')
      
      setImportResult(data)
      
      const message = data.warnings 
        ? `Import complete: ${data.success} succeeded, ${data.failed} failed, ${data.warnings} warnings`
        : `Import complete: ${data.success} succeeded, ${data.failed} failed`
      
      toast.success(message)
      onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Unknown import error')
    } finally {
      setUploading(false)
    }
  }

  const resetModal = () => {
    setFile(null)
    setImportResult(null)
    setNote('')
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetModal()
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Import Products
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Products from File</DialogTitle>
          <div className="text-sm text-gray-600">
            Upload a CSV or Excel file to import products. 
            <a 
              href="/sample_inventory_upload.csv" 
              download 
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Download sample CSV template
            </a>
          </div>
        </DialogHeader>

        <Tabs value={fileType} onValueChange={(v) => setFileType(v as 'csv' | 'excel')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="excel">Excel (.xlsx)</TabsTrigger>
            <TabsTrigger value="csv">CSV</TabsTrigger>
          </TabsList>
          
          <TabsContent value="excel" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Excel Import Information</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your Excel file should have columns: Part No., Description, Unit Price</li>
                    <li>All sheets in the workbook will be processed</li>
                    <li>Products will be created with minimal info - you can edit them later</li>
                    <li>Existing products (matching SKU) will be updated</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="csv" className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">CSV Import Information</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>CSV should have headers: name, sku, vendor_id, category, unit_price, reorder_threshold</li>
                    <li>Use the sample template for reference</li>
                    <li>All fields are optional except name, sku, and vendor_id</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Vendor</label>
            <Select value={vendorId} onValueChange={setVendorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map(vendor => (
                  <SelectItem key={vendor.id} value={vendor.id.toString()}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Warehouse</label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map(warehouse => (
                  <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Default Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., General, Electronics, Parts"
          />
        </div>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note about this import"
          className="mb-4"
        />

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 p-6 rounded-lg cursor-pointer text-center hover:border-blue-400 transition-colors"
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="space-y-2">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-green-600" />
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
              <p>Drag and drop a file here, or click to select</p>
              <p className="text-sm text-gray-500">Supports CSV and Excel files</p>
            </div>
          )}
        </div>

        {importResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold">Import Results</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Successful:</span>
                <span className="ml-2 font-semibold text-green-600">{importResult.success}</span>
              </div>
              <div>
                <span className="text-gray-600">Failed:</span>
                <span className="ml-2 font-semibold text-red-600">{importResult.failed}</span>
              </div>
              {importResult.warnings !== undefined && (
                <div>
                  <span className="text-gray-600">Warnings:</span>
                  <span className="ml-2 font-semibold text-yellow-600">{importResult.warnings}</span>
                </div>
              )}
            </div>
            
            {importResult.sheets && importResult.sheets.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <h5 className="text-sm font-medium mb-2">Sheet Summary:</h5>
                <div className="space-y-1">
                  {importResult.sheets.map((sheet: any, idx: number) => (
                    <div key={idx} className="text-xs text-gray-600">
                      {sheet.name}: {sheet.success} imported, {sheet.errors} failed
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleUpload} 
            className="flex-1" 
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Import Products'}
          </Button>
          {importResult && (
            <Button 
              onClick={() => {
                setFile(null)
                setImportResult(null)
              }}
              variant="outline"
            >
              Import Another File
            </Button>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <span className="text-sm text-gray-600">Processing file...</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}