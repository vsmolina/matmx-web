'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AdminLogDialog({ customerId, open, onOpenChange }: any) {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    if (!open) return
    fetch(`http://localhost:4000/api/crm/${customerId}/logs`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .catch(console.error)
  }, [open, customerId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>CRM Action Log</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {logs.map((log: any) => (
            <div key={log.id} className="border-b pb-1">
              <p className="text-sm">{log.user_name} — {log.action}</p>
              <p className="text-xs text-muted">{log.details}</p>
              <p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
