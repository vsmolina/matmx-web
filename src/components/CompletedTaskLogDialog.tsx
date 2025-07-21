'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { CheckCircle, Undo2, Calendar, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface Task {
  id: number
  title: string
  due_date: string
  assigned_to_name: string
  created_by_name: string
  customer_name: string
}

interface Grouped {
  rep_name: string
  tasks: Task[]
}

export default function CompletedTaskLogDialog({
  open,
  onOpenChange,
  customerId = null,
  onTaskUndo = () => {}
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  customerId?: number | null,
  onTaskUndo?: () => void
}) {
  const [groupedTasks, setGroupedTasks] = useState<Grouped[]>([])
  const [loading, setLoading] = useState(true)
  const [undoingId, setUndoingId] = useState<number | null>(null)

  const fetchTasks = () => {
    setLoading(true)
    const url = customerId
      ? `http://localhost:4000/api/crm/tasks/completed?customerId=${customerId}`
      : 'http://localhost:4000/api/crm/tasks/completed'

    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setGroupedTasks(data.grouped || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open) fetchTasks()
  }, [open, customerId])

  const handleUndo = async (taskId: number) => {
    setUndoingId(taskId)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/tasks/${taskId}/undo`, {
        method: 'POST',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to undo')
      toast.success('Task re-opened')
      fetchTasks()
      onTaskUndo()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUndoingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        <DialogHeader className="pb-4 sticky top-0 bg-white z-10 p-3 sm:p-6 border-b">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Completed Tasks</DialogTitle>
                <p className="text-xs sm:text-sm text-gray-600">Last 3 months activity</p>
              </div>
            </div>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="p-4 sm:p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Loading completed tasks...</span>
              </div>
            </div>
          ) : groupedTasks.length === 0 ? (
            <div className="p-4 sm:p-8 text-center">
              <div className="text-gray-400 mb-2">
                <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto" />
              </div>
              <p className="text-xs sm:text-sm text-gray-500">No completed tasks found.</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                {groupedTasks.map(group => (
                  <div key={group.rep_name} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-lg text-green-800 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {group.rep_name}
                      </h3>
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-3 text-left font-medium text-gray-700">Customer</th>
                            <th className="p-3 text-left font-medium text-gray-700">Title</th>
                            <th className="p-3 text-left font-medium text-gray-700">Due Date</th>
                            <th className="p-3 text-left font-medium text-gray-700">Assigned To</th>
                            <th className="p-3 text-left font-medium text-gray-700">Created By</th>
                            <th className="p-3 text-left font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.tasks.map(task => (
                            <tr key={task.id} className="border-t hover:bg-gray-50">
                              <td className="p-3 font-medium text-gray-900">{task.customer_name}</td>
                              <td className="p-3">{task.title}</td>
                              <td className="p-3 text-gray-600">{format(new Date(task.due_date), 'MMM dd, yyyy')}</td>
                              <td className="p-3 text-gray-600">{task.assigned_to_name}</td>
                              <td className="p-3 text-gray-600">{task.created_by_name}</td>
                              <td className="p-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUndo(task.id)}
                                  disabled={undoingId === task.id}
                                  className="flex items-center gap-1"
                                >
                                  <Undo2 className="h-3 w-3" />
                                  {undoingId === task.id ? 'Undoing...' : 'Undo'}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Mobile Card View */}
                    <div className="sm:hidden p-3 space-y-2">
                      {group.tasks.map(task => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs text-gray-900 truncate">{task.title}</h4>
                              <p className="text-xs text-gray-600 truncate">{task.customer_name}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-xs mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">Assigned: {task.assigned_to_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">Created: {task.created_by_name}</span>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndo(task.id)}
                            disabled={undoingId === task.id}
                            className="w-full flex items-center gap-1 justify-center text-xs h-8"
                          >
                            <Undo2 className="h-3 w-3" />
                            {undoingId === task.id ? 'Undoing...' : 'Undo'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}