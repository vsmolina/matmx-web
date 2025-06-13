'use client'

import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function TaskTable({
  customer,
  tasks,
  currentUserId,
  canCreate,
  onCreate,
  onTaskUpdate
}: {
  customer: { id: number; name: string },
  tasks: any[],
  currentUserId: number,
  canCreate: boolean,
  onCreate: (customerId: number) => void,
  onTaskUpdate?: () => void
}) {
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const handleComplete = async (taskId: number) => {
    setLoadingId(taskId)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/tasks/${taskId}/complete`, {
        method: 'POST',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to mark complete')
      toast.success('Task marked as completed')
      onTaskUpdate?.()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="mb-6 border rounded-md bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <div>
          <h3 className="font-semibold text-sm">Customer: {customer.name}</h3>
          <p className="text-xs text-muted-foreground">Customer ID: {customer.id}</p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => onCreate(customer.id)}>
            + Task
          </Button>
        )}
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Due</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Assigned To</th>
            <th className="p-2 text-left">Created By</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{task.title}</td>
              <td className="p-2">
                {task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '—'}
              </td>
              <td className="p-2">{task.status}</td>
              <td className="p-2">{task.assigned_to_name || task.assigned_to}</td>
              <td className="p-2">{task.created_by_name || task.created_by}</td>
              <td className="p-2">
                {task.status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleComplete(task.id)}
                    disabled={loadingId === task.id}
                  >
                    {loadingId === task.id ? 'Marking...' : 'Mark Complete'}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
