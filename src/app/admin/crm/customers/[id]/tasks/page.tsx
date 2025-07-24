'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@/context/UserContext'
import TaskGroupByRep from '@/components/TaskGroupByRep'
import TaskDialog from '@/components/TaskDialog'
import { Button } from '@/components/ui/button'
import CompletedTaskLogDialog from '@/components/CompletedTaskLogDialog'
import { ArrowLeft, Plus, ClipboardList, CheckCircle, User, Target, Clock } from 'lucide-react'

export default function CustomerTaskPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useUser()

  const [tasks, setTasks] = useState<any[]>([])
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [taskDialogCustomerId, setTaskDialogCustomerId] = useState<number | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }, [id])

  useEffect(() => {
    if (user) fetchTasks()
  }, [user, id])

  const handleCreateClick = useCallback(() => {
    setTaskDialogCustomerId(Number(id))
    setTaskDialogOpen(true)
  }, [id])

  const handleBackClick = useCallback(() => {
    router.back()
  }, [router])

  const handleShowCompleted = useCallback(() => {
    setShowCompleted(true)
  }, [])

  const handleTaskDialogSuccess = useCallback(() => {
    setTaskDialogOpen(false)
    setTaskDialogCustomerId(null)
    fetchTasks()
  }, [fetchTasks])

  if (!user) return <p>Loading...</p>

  // Get total task count for display
  const totalTasks = tasks.reduce((acc, rep) => {
    return acc + rep.customers.reduce((customerAcc: number, customer: any) => {
      return customerAcc + customer.tasks.length
    }, 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="text-white hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customer
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Customer Tasks</h1>
                  <p className="text-blue-100 text-lg mt-1">Customer #{id}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Target className="h-4 w-4 text-blue-200" />
                    <span className="text-blue-100 text-sm">
                      {totalTasks} active task{totalTasks !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleCreateClick}
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
              <Button 
                variant="ghost"
                onClick={handleShowCompleted}
                className="text-white hover:bg-white/20 border border-white/30"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                View Completed
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Task Statistics Card */}
        {totalTasks > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Task Overview</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Active Tasks</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">{totalTasks}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Assigned Reps</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 mt-1">{tasks.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Completion Rate</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">Active</p>
              </div>
            </div>
          </div>
        )}

        {/* Tasks by Representative */}
        {tasks.length > 0 ? (
          <div className="space-y-6">
            {tasks.map(rep => (
              <div key={rep.rep_id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <TaskGroupByRep
                  rep={rep}
                  currentUserId={user.userId}
                  isSuperAdmin={user.role === 'super_admin'}
                  onCreateTask={handleCreateClick}
                  onTaskUpdate={fetchTasks}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Tasks</h3>
            <p className="text-gray-600 mb-6">This customer doesn't have any active tasks assigned yet.</p>
            <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {taskDialogCustomerId !== null && (
        <TaskDialog
          customerId={taskDialogCustomerId}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onSuccess={handleTaskDialogSuccess}
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
