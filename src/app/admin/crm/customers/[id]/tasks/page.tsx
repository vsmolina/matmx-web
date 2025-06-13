'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUser } from '@/context/UserContext'
import TaskGroupByRep from '@/components/TaskGroupByRep'
import TaskDialog from '@/components/TaskDialog'
import { Button } from '@/components/ui/button'
import CompletedTaskLogDialog from '@/components/CompletedTaskLogDialog'

export default function CustomerTaskPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useUser()

  const [tasks, setTasks] = useState<any[]>([])
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [taskDialogCustomerId, setTaskDialogCustomerId] = useState<number | null>(null)

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:4000/api/crm/tasks/grouped', {
      credentials: 'include'
    })
    const data = await res.json()
    const filtered = data.groupedTasks
    .map((rep: any) => ({
      ...rep,
      customers: rep.customers
        .filter((c: any) => c.customer_id === Number(id))
        .map((c: any) => ({
          ...c,
          tasks: c.tasks.filter((t: any) => t.status !== 'completed')
        }))
    }))
    .filter((rep: any) => rep.customers.length > 0)

    setTasks(filtered)
  }

  useEffect(() => {
    if (user) fetchTasks()
  }, [user, id])

  const handleCreateClick = () => {
    setTaskDialogCustomerId(Number(id))
    setTaskDialogOpen(true)
  }

  if (!user) return <p>Loading...</p>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-xl font-bold">Tasks for Customer #{id}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateClick}>+ Task</Button>
          <Button variant="outline" onClick={() => setShowCompleted(true)}>
            View Completed Tasks
          </Button>
        </div>
      </div>

      {tasks.map(rep => (
        <TaskGroupByRep
          key={rep.rep_id}
          rep={rep}
          currentUserId={user.userId}
          isSuperAdmin={user.role === 'super_admin'}
          onCreateTask={handleCreateClick}
          onTaskUpdate={fetchTasks}
        />
      ))}

      {taskDialogCustomerId !== null && (
        <TaskDialog
          customerId={taskDialogCustomerId}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onSuccess={() => {
            setTaskDialogOpen(false)
            setTaskDialogCustomerId(null)
            fetchTasks()
          }}
        />
      )}

      <CompletedTaskLogDialog
        open={showCompleted}
        onOpenChange={setShowCompleted}
        customerId={Number(id)}
        onTaskUndo={fetchTasks}
      />
    </div>
  )
}
