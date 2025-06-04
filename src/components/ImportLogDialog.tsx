'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface ImportLog {
  id: number
  timestamp: string
  user_name: string
  filename: string
  success_count: number
  failure_count: number
  note?: string
}

export default function ImportLogDialog() {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<ImportLog[]>([])
  const [searchUser, setSearchUser] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) fetchLogs()
  }, [open])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchUser) params.append('user', searchUser)
      if (searchDate) params.append('date', searchDate)

      const res = await fetch(`http://localhost:4000/api/inventory/imports?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch logs')
      const data = await res.json()
      setLogs(data.logs)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load import logs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchLogs()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Import Logs</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inventory Import Logs</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Filter by user name..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-4 text-sm">
            {loading ? (
              <p>Loading...</p>
            ) : logs.length === 0 ? (
              <p className="text-gray-500">No import logs found.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border-l-2 border-blue-600 pl-4 relative">
                  <div className="absolute left-[-0.6rem] top-1 w-3 h-3 bg-blue-600 rounded-full" />
                  <div className="text-xs text-gray-500">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy hh:mm a')}
                  </div>
                  <div className="font-medium text-sm">{log.user_name}</div>
                  <div>
                    File: <span className="font-mono">{log.filename}</span><br />
                    ✅ {log.success_count} &nbsp; ❌ {log.failure_count}
                  </div>
                  {log.note && <div className="text-xs italic text-gray-600 mt-1">"{log.note}"</div>}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
