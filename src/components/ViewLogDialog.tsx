'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ViewLogDialog({ customer, onClose }: any) {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetch(`http://localhost:4000/api/crm/${customer.id}/logs`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .catch(console.error)
  }, [customer])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Activity Log for {customer.name}</DialogTitle>
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
