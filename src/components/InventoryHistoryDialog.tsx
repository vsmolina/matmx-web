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
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Adjustment {
  id: number
  timestamp: string
  user_name: string
  change: number
  resulting_stock: number
  reason: string
  note?: string
}

export default function InventoryHistoryDialog({
  productId,
  role,
}: {
  productId: number
  role: string
}) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchHistory()
    }
  }, [open])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/inventory/${productId}/history`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch history')
      const data = await res.json()
      setHistory(data.history)
    } catch (err) {
      console.error(err)
      toast.error('Error loading history')
    } finally {
      setLoading(false)
    }
  }

  if (role !== 'super_admin') return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          History
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Inventory History</DialogTitle>
          <DialogDescription>Last 6 months of activity</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-2">
          <div className="border-l-2 border-gray-300 ml-4 space-y-6 pl-6">
            {loading ? (
              <p>Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-500">No history available.</p>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="relative">
                  <div className="absolute -left-[1.1rem] top-1 w-3 h-3 bg-blue-600 rounded-full" />
                  {entry.timestamp && (
                    <div className="text-xs text-gray-500">
                      {format(new Date(entry.timestamp), 'MMM dd, yyyy hh:mm a')}
                    </div>
                  )}
                  <div className="font-medium text-sm">{entry.user_name}</div>
                  <div className="text-sm">
                    Change: <span className="font-semibold">{entry.change > 0 ? `+${entry.change}` : entry.change}</span>{' '}
                    → <span className="font-semibold">{entry.resulting_stock}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Reason: {entry.reason}
                    {entry.note && <div className="text-xs text-gray-500 italic mt-1">“{entry.note}”</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
