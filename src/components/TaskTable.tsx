'use client'

import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Users, Plus, Clock, CheckCircle, User, Calendar } from 'lucide-react'

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
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">{customer.name}</h3>
              <p className="text-xs text-gray-600">Customer ID: {customer.id}</p>
            </div>
          </div>
          {canCreate && (
            <Button size="sm" onClick={() => onCreate(customer.id)} className="flex items-center gap-1 text-sm">
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Task</span>
            </Button>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-4 sm:p-8 text-center">
          <div className="text-gray-400 mb-2">
            <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500">No tasks found for this customer.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-700">Title</th>
                  <th className="p-3 text-left font-medium text-gray-700">Due</th>
                  <th className="p-3 text-left font-medium text-gray-700">Status</th>
                  <th className="p-3 text-left font-medium text-gray-700">Assigned To</th>
                  <th className="p-3 text-left font-medium text-gray-700">Created By</th>
                  <th className="p-3 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                  return (
                    <tr key={task.id} className={`border-t hover:bg-gray-50 transition-colors ${
                      isOverdue ? 'bg-red-50 border-red-200' : ''
                    }`}>
                      <td className="p-3 font-medium text-gray-900">{task.title}</td>
                      <td className="p-3">
                        {task.due_date ? (
                          <span className={`flex items-center gap-1 ${
                            isOverdue ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {format(new Date(task.due_date), 'MMM dd, yyyy')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          {task.assigned_to_name || task.assigned_to}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          {task.created_by_name || task.created_by}
                        </span>
                      </td>
                      <td className="p-3">
                        {task.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleComplete(task.id)}
                            disabled={loadingId === task.id}
                            className="flex items-center gap-1"
                          >
                            {loadingId === task.id ? (
                              <Clock className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            {loadingId === task.id ? 'Marking...' : 'Complete'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="sm:hidden p-3 space-y-3">
            {tasks.map(task => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
              return (
                <div key={task.id} className={`border rounded-lg shadow-sm overflow-hidden ${
                  isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                }`}>
                  {/* Card Header */}
                  <div className={`p-3 border-b ${
                    isOverdue ? 'bg-red-100 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 flex-1 mr-2">{task.title}</h4>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {/* Due Date - Prominent if overdue */}
                    {task.due_date && (
                      <div className={`flex items-center gap-1 text-xs ${
                        isOverdue ? 'text-red-700 font-medium' : 'text-gray-600'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                        {isOverdue && <span className="text-red-600 font-bold ml-1">• OVERDUE</span>}
                      </div>
                    )}
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-3 space-y-2">
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                        <span className="text-gray-500">Assigned:</span>
                        <span className="font-medium text-gray-900 truncate">{task.assigned_to_name || task.assigned_to}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                        <span className="text-gray-500">Created:</span>
                        <span className="font-medium text-gray-900 truncate">{task.created_by_name || task.created_by}</span>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    {task.status !== 'completed' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          size="sm"
                          onClick={() => handleComplete(task.id)}
                          disabled={loadingId === task.id}
                          className={`w-full flex items-center gap-2 justify-center text-sm h-9 ${
                            isOverdue 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {loadingId === task.id ? (
                            <>
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>Marking...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Complete</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}