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
import { apiCall } from '@/lib/api'

export default function ImportCSVModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0]
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File is too large (max 5MB)')
        return
      }
      setFile(selected)
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return toast.error('No file selected')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('note', note)

    setUploading(true)
    try {
      const res = await apiCall('/api/inventory/import', { 
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

      <DialogContent className="max-w-md center">
        <DialogHeader>
          <DialogTitle>Import Inventory CSV</DialogTitle>
          <div className="text-sm text-gray-600">
            Upload a CSV file to import inventory products. 
            <a 
              href="/sample_inventory_upload.csv" 
              download 
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Download sample CSV template
            </a>
          </div>
        </DialogHeader>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note about this import"
          className="mb-4"
        />

        <div
          {...getRootProps()}
          className="border border-dashed p-4 rounded cursor-pointer text-center"
        >
          <input {...getInputProps()} />
          {file ? (
            <p>{file.name}</p>
          ) : (
            <p>Drag and drop a CSV file here, or click to select</p>
          )}
        </div>

        <Button onClick={handleUpload} className="mt-4 w-full" disabled={uploading}>
          Upload
        </Button>

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
            <span className="text-sm text-gray-500 animate-pulse">Uploading...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
