'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { FileText, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiCall } from '@/lib/api'

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

      const res = await apiCall(`/api/inventory/imports?${params.toString()}`)
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
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          View Import Logs
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:left-[50%] sm:top-[50%] sm:max-w-4xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]",
            "max-h-screen overflow-hidden sm:max-h-[85vh]"
          )}
        >
        <DialogHeader className="pb-4 sticky top-0 bg-white z-10 p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Import Logs</DialogTitle>
                <p className="text-sm text-gray-600">Track all inventory CSV import activities</p>
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
          {/* Search Filters */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Filters
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-700 mb-1 block">User Name</label>
                <Input
                  placeholder="Filter by user name..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="h-9 border-2 border-gray-200 focus:border-orange-400 bg-white"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-700 mb-1 block">Date</label>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="h-9 border-2 border-gray-200 focus:border-orange-400 bg-white"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  className="h-9 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Import Logs */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden min-h-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin"></div>
                  Loading import logs...
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">No import logs found.</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="p-6">
                  <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <span className="font-medium">Showing {logs.length} import log{logs.length !== 1 ? 's' : ''}</span>
                    {logs.length > 0 && <span> • Scroll to see all entries</span>}
                  </div>
                  <div className="border-l-2 border-orange-200 ml-4 space-y-6 pl-6">
                    {logs.map((log) => {
                      const hasFailures = log.failure_count > 0
                      const isSuccess = log.success_count > 0 && log.failure_count === 0

                      return (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[1.1rem] top-1 w-3 h-3 bg-orange-600 rounded-full border-2 border-white shadow-sm" />
                          
                          <div className={`border rounded-lg p-4 ${
                            hasFailures ? 'bg-red-50 border-red-200' :
                            isSuccess ? 'bg-green-50 border-green-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="text-xs text-gray-500 font-medium">
                                {format(new Date(log.timestamp), 'MMM dd, yyyy • hh:mm a')}
                              </div>
                              <div className="flex gap-2">
                                {log.success_count > 0 && (
                                  <div className="text-xs px-2 py-1 rounded-full font-medium text-green-700 bg-green-100 border border-green-200">
                                    ✅ {log.success_count} successful
                                  </div>
                                )}
                                {log.failure_count > 0 && (
                                  <div className="text-xs px-2 py-1 rounded-full font-medium text-red-700 bg-red-100 border border-red-200">
                                    ❌ {log.failure_count} failed
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="font-semibold text-sm text-gray-900 mb-2">
                              {log.user_name || 'Unknown User'}
                            </div>
                            
                            <div className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">File:</span>{' '}
                              <span className="font-mono bg-white/50 px-2 py-1 rounded border text-xs">
                                {log.filename}
                              </span>
                            </div>
                            
                            {log.note && (
                              <div className="text-xs text-gray-600 italic bg-white/50 p-2 rounded border">
                                "{log.note}"
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
