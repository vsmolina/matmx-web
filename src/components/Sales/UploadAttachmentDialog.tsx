'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { apiCall } from '@/lib/api'

interface UploadAttachmentDialogProps {
  relatedType: 'quote' | 'order'
  relatedId: number
}

export default function UploadAttachmentDialog({ relatedType, relatedId }: UploadAttachmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return toast.error('No file selected')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('related_id', String(relatedId))

    try {
      const res = await apiCall(`/api/sales/${relatedType}s/${relatedId}/attachment`, { 
        method: 'POST',
        body: formData 
      })

      if (!res.ok) throw new Error()
      toast.success('File uploaded')
      setOpen(false)
      setFile(null)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Upload</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Attachment</DialogTitle>
        </DialogHeader>

        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
          if (e.target.files?.[0]) setFile(e.target.files[0])
        }} />

        <Button onClick={handleUpload} disabled={uploading} className="w-full mt-4">
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
