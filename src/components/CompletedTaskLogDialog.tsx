'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Completed Tasks (Last 3 Months)</DialogTitle>
        </DialogHeader>

        {loading ? <p>Loading...</p> : (
          <ScrollArea className="h-[60vh]">
            {groupedTasks.map(group => (
              <div key={group.rep_name} className="mb-4">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">
                  {group.rep_name}
                </h3>
                <table className="w-full text-sm border rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Customer</th>
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Due Date</th>
                      <th className="p-2 text-left">Assigned To</th>
                      <th className="p-2 text-left">Created By</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.tasks.map(task => (
                      <tr key={task.id} className="border-t">
                        <td className="p-2">{task.customer_name}</td>
                        <td className="p-2">{task.title}</td>
                        <td className="p-2">{format(new Date(task.due_date), 'yyyy-MM-dd')}</td>
                        <td className="p-2">{task.assigned_to_name}</td>
                        <td className="p-2">{task.created_by_name}</td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndo(task.id)}
                            disabled={undoingId === task.id}
                          >
                            {undoingId === task.id ? 'Undoing...' : 'Undo'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
