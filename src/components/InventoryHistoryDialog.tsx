'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { format, subDays } from 'date-fns'
import { History } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiCall } from '@/lib/api'

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
      const res = await apiCall(`/api/inventory/${productId}/history`)
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
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-1" />
          History
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:left-[50%] sm:top-[50%] sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]",
            "max-h-screen overflow-hidden sm:max-h-[85vh]"
          )}
        >
        <DialogHeader className="pb-4 sticky top-0 bg-white z-10 p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Inventory History</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">Track all inventory adjustments and changes</DialogDescription>
              </div>
            </div>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex-1 flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-700 mb-1 block">Time Period</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-9 border-2 border-gray-200 rounded-lg px-3 text-sm bg-white focus:border-purple-400 focus:outline-none transition-colors"
                >
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={180}>Last 180 days</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs font-medium text-gray-700 mb-1 block">User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full h-9 border-2 border-gray-200 rounded-lg px-3 text-sm bg-white focus:border-purple-400 focus:outline-none transition-colors"
                >
                  <option value="">All Users</option>
                  {users.map((u) => (
                    <option key={u} value={u}>{u || '(Unknown User)'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                  Loading history...
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <History className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">No history found for selected filters.</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-6">
                  <div className="border-l-2 border-purple-200 ml-4 space-y-6 pl-6">
                    {filtered.map((entry) => {
                      const changeColor =
                        entry.change > 0 ? 'text-green-600' :
                        entry.change < 0 ? 'text-red-600' :
                        'text-gray-600'

                      const changeBgColor =
                        entry.change > 0 ? 'bg-green-100 border-green-200' :
                        entry.change < 0 ? 'bg-red-100 border-red-200' :
                        'bg-gray-100 border-gray-200'

                      return (
                        <div key={entry.id} className="relative">
                          <div className="absolute -left-[1.1rem] top-1 w-3 h-3 bg-purple-600 rounded-full border-2 border-white shadow-sm" />
                          
                          <div className={`border rounded-lg p-4 ${changeBgColor}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-xs text-gray-500 font-medium">
                                {format(new Date(entry.timestamp), 'MMM dd, yyyy • hh:mm a')}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full font-medium ${changeColor} bg-white border`}>
                                {entry.change > 0 ? `+${entry.change}` : entry.change} units
                              </div>
                            </div>
                            
                            <div className="font-semibold text-sm text-gray-900 mb-1">
                              {entry.adjusted_by_name || 'Unknown User'}
                            </div>
                            
                            <div className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">Reason:</span> {entry.reason}
                            </div>
                            
                            {entry.note && (
                              <div className="text-xs text-gray-600 italic bg-white/50 p-2 rounded border">
                                "{entry.note}"
                              </div>
                            )}
                            
                            <div className="mt-2 text-xs text-gray-600">
                              <span className="font-medium">New Stock Level:</span> {entry.resulting_stock} units
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
