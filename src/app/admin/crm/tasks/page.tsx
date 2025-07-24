'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import TaskFilterBar from '@/components/TaskFilterBar'
import TaskGroupByRep from '@/components/TaskGroupByRep'
import TaskDialog from '@/components/TaskDialog'
import CompletedTaskLogDialog from '@/components/CompletedTaskLogDialog'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { CheckSquare, ArrowLeft, History, Calendar } from 'lucide-react'

export default function CRMTaskPage() {
  const [groupedTasks, setGroupedTasks] = useState<any[]>([])
  const [filters, setFilters] = useState({
    customerName: '',
    status: 'all',
    due: 'all'
  })
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)
  const [taskDialogCustomerId, setTaskDialogCustomerId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  const { user } = useUser()
  const router = useRouter()

  const loadTasks = useCallback(async () => {
    if (loadingRef.current) return
    
    loadingRef.current = true
    setLoading(true)
    
    try {
      const res = await fetch('http://localhost:4000/api/crm/tasks/grouped', { 
        credentials: 'include' 
      })
      const data = await res.json()
      setGroupedTasks(data.groupedTasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user && !loadingRef.current) {
      loadTasks()
    }
  }, [user, loadTasks])

  const handleCreateClick = useCallback((customerId: number) => {
    setTaskDialogCustomerId(customerId)
    setDialogOpen(true)
  }, [])

  const filterTasks = useCallback((tasks: any[]) => {
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
  }, [filters])

  // Memoized filtered tasks to prevent unnecessary re-renders
  const filteredGroupedTasks = useMemo(() => {
    return groupedTasks.map((rep) => ({
      ...rep,
      customers: rep.customers.map(c => ({
        ...c,
        tasks: filterTasks(c.tasks || [])
      }))
    }))
  }, [groupedTasks, filterTasks])

  // Memoized handlers
  const handleShowCompleted = useCallback(() => setShowCompleted(true), [])
  const handleTaskDialogSuccess = useCallback(() => {
    setDialogOpen(false)
    setTaskDialogCustomerId(null)
    loadTasks()
  }, [loadTasks])

  if (!user) return <p>Loading...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-1 sm:gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">CRM Task Center</h1>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Manage and track all customer tasks</p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleShowCompleted}
              className="flex items-center gap-2 w-full sm:w-auto text-sm"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">View Completed Tasks</span>
              <span className="sm:hidden">Completed</span>
            </Button>
          </div>
        </div>

        <TaskFilterBar filters={filters} onChange={setFilters} />

        {/* Tasks Section */}
        <div className="space-y-4 sm:space-y-6">
          {filteredGroupedTasks.map((rep) => (
            <TaskGroupByRep
              key={rep.rep_id}
              rep={rep}
              currentUserId={user.userId}
              isSuperAdmin={user.role === 'super_admin'}
              onCreateTask={handleCreateClick}
              onTaskUpdate={loadTasks}
            />
          ))}
        </div>

      {taskDialogCustomerId !== null && (
        <TaskDialog
          customerId={taskDialogCustomerId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleTaskDialogSuccess}
        />
      )}

        <CompletedTaskLogDialog
          open={showCompleted}
          onOpenChange={setShowCompleted}
          onTaskUndo={loadTasks}
        />
      </div>
    </div>
  )
}
