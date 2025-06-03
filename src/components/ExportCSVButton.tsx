'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function ExportCSVButton() {
  const handleDownload = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/inventory/export', {
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to export CSV')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'inventory_export.csv'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Failed to download CSV')
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  )
}
