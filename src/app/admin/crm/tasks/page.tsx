'use client'

import { useEffect, useState } from 'react'
import TaskFilterBar from '@/components/TaskFilterBar'
import TaskGroupByRep from '@/components/TaskGroupByRep'
import TaskDialog from '@/components/TaskDialog'
import CompletedTaskLogDialog from '@/components/CompletedTaskLogDialog'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function CRMTaskPage() {
  const [groupedTasks, setGroupedTasks] = useState<any[]>([])
  const [filters, setFilters] = useState({
    customerName: '',
    status: 'all',
    due: 'all'
  })
  const [taskDialogCustomerId, setTaskDialogCustomerId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  const { user } = useUser()
  const router = useRouter()

  const loadTasks = async () => {
    const res = await fetch('http://localhost:4000/api/crm/tasks/grouped', { 
      credentials: 'include' 
    })
    const data = await res.json()
    setGroupedTasks(data.groupedTasks)
  }

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  const handleCreateClick = (customerId: number) => {
    setTaskDialogCustomerId(customerId)
    setDialogOpen(true)
  }

  const filterTasks = (tasks: any[]) => {
    return tasks.filter((task) => {
      const matchStatus =
        filters.status === 'all' || task.status.toLowerCase() === filters.status
      const matchCustomer =
        filters.customerName === '' || task.customer_name.toLowerCase().includes(filters.customerName.toLowerCase())
      const matchDue =
        filters.due === 'all' ||
        (filters.due === 'past' && new Date(task.due_date) < new Date()) ||
        (filters.due === 'next7' && new Date(task.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      return matchStatus && matchCustomer && matchDue
    })
  }

  if (!user) return <p>Loading...</p>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">CRM Task Center</h1>
        </div>
        <Button variant="outline" onClick={() => setShowCompleted(true)}>
          View Completed Tasks
        </Button>
      </div>

      <TaskFilterBar filters={filters} onChange={setFilters} />

      {groupedTasks.map((rep) => (
        <TaskGroupByRep
          key={rep.rep_id}
          rep={{
            ...rep,
            customers: rep.customers.map(c => ({
              ...c,
              tasks: filterTasks(c.tasks)
            }))
          }}
          currentUserId={user.userId}
          isSuperAdmin={user.role === 'super_admin'}
          onCreateTask={handleCreateClick}
          onTaskUpdate={loadTasks}
        />
      ))}

      {taskDialogCustomerId !== null && (
        <TaskDialog
          customerId={taskDialogCustomerId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => {
            setDialogOpen(false)
            setTaskDialogCustomerId(null)
            loadTasks()
          }}
        />
      )}

      <CompletedTaskLogDialog
        open={showCompleted}
        onOpenChange={setShowCompleted}
        onTaskUndo={loadTasks}
      />
    </div>
  )
}
