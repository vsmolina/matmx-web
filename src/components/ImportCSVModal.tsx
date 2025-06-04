'use client'

import { useCallback, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UploadCloud } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Textarea } from '@/components/ui/textarea'

export default function ImportCSVModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return toast.error('No file selected')

    const formData = new FormData()
    formData.append('csv', file)
    formData.append('note', note)

    setUploading(true)
    try {
    const res = await fetch('http://localhost:4000/api/inventory/import', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    let data
    try {
      data = await res.json()
    } catch (err) {
      throw new Error('Invalid JSON response — server may have crashed')
    }

    if (!res.ok) throw new Error(data.error || 'Upload failed')
    toast.success(`Import complete: ${data.success} succeeded, ${data.failed} failed`)
    onSuccess()
    setFile(null)
    setOpen(false)
  } catch (err: any) {
    console.error(err)
    toast.error(err.message || 'Unknown import error')
  } finally {
    setUploading(false)
  }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadCloud className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Inventory CSV</DialogTitle>
        </DialogHeader>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note about this import"
          className="mb-4"
        />

        <div
          {...getRootProps()}
          className="border border-dashed border-gray-400 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition"
        >
          <input {...getInputProps()} />
          <p className="text-sm text-gray-500">
            {isDragActive ? 'Drop the CSV here...' : 'Drag & drop a CSV here, or click to select'}
          </p>
          {file && <p className="mt-2 text-sm font-medium">{file.name}</p>}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            Ensure your CSV includes the following columns:{' '}
            <span className="font-medium">name, sku, vendor, stock, reorder_threshold, unit_price, category, notes</span>
          </p>
          <p className="mt-2">
            Need a sample?{' '}
            <a
              href="/sample_inventory_template.csv"
              download
              className="text-blue-600 underline hover:text-blue-800"
            >
              Download CSV Template
            </a>
          </p>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
