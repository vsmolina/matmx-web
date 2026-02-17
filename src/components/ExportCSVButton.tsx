'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import ExportPreviewModal from './ExportPreviewModal'

export default function ExportCSVButton() {
  return (
    <ExportPreviewModal
      trigger={
        <Button variant="outline" className="whitespace-nowrap">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      }
    />
  )
}
