'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'

interface Adjustment {
  id: number
  timestamp: string
  adjusted_by_name: string
  change: number
  resulting_stock: number
  reason: string
  note?: string
}

export default function InventoryHistoryDialog({
  productId,
  role,
  refreshKey = 0
}: {
  productId: number
  role: string
  refreshKey?: number
}) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<Adjustment[]>([])
  const [filtered, setFiltered] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState(false)

  const [days, setDays] = useState(180)
  const [selectedUser, setSelectedUser] = useState('')

  useEffect(() => {
    if (open) fetchHistory()
  }, [open, refreshKey])

  useEffect(() => {
    const since = subDays(new Date(), days)
    const f = history.filter((h) => {
      const ts = new Date(h.timestamp)
      return ts >= since && (!selectedUser || h.adjusted_by_name === selectedUser)
    })
    setFiltered(f)
  }, [history, days, selectedUser])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/inventory/${productId}/history`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const text = await res.text()
        console.error('Fetch failed:', text)
        throw new Error('Fetch failed')
      }
      const data = await res.json()
      setHistory(data)
    } catch (err) {
      console.error(err)
      toast.error('Error loading history')
    } finally {
      setLoading(false)
    }
  }

  if (role !== 'super_admin') return null

  const users = Array.from(
    new Set(history.map((h) => h.adjusted_by_name).filter(Boolean))
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">History</Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Inventory History</DialogTitle>
          <DialogDescription>Filter by date and user</DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 items-center text-sm mb-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
          </select>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u} value={u}>{u || '(Unknown User)'}</option>
            ))}
          </select>
        </div>

        <ScrollArea className="h-[400px] pr-2">
          <div className="border-l-2 border-gray-300 ml-4 space-y-6 pl-6">
            {loading ? (
              <p>Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-500">No history for selected filters.</p>
            ) : (
              filtered.map((entry) => {
                const changeColor =
                  entry.change > 0 ? 'text-green-600' :
                  entry.change < 0 ? 'text-red-600' :
                  'text-gray-600'

                return (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[1.1rem] top-1 w-3 h-3 bg-blue-600 rounded-full" />
                    <div className="text-xs text-gray-500">
                      {format(new Date(entry.timestamp), 'MMM dd, yyyy hh:mm a')}
                    </div>
                    <div className="font-medium text-sm">{entry.adjusted_by_name}</div>
                    <div className={`text-sm ${changeColor}`}>
                      Change: <span className="font-semibold">{entry.change > 0 ? `+${entry.change}` : entry.change}</span>{' '}
                      → <span className="font-semibold">{entry.resulting_stock}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Reason: {entry.reason}
                      {entry.note && <div className="text-xs text-gray-500 italic mt-1">“{entry.note}”</div>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
