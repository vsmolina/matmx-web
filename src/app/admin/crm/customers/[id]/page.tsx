'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import EditCustomerDialog from '@/components/EditCustomerDialog'
import CustomerLogInteractionDialog from '@/components/CustomerLoginInteractionDialog'
import AssignRepsDialog from '@/components/AssignRepsDialog'
import PipelineStageDialog from '@/components/PipelineStageDialog'
import { MessageCircle, PhoneCall, Mail, Users, ArrowLeft, Edit, UserCheck, Target, Trash2, Clock, Building2, User, Phone, MapPin, FileText, Activity, AlertTriangle } from 'lucide-react'
import { useUser } from '@/context/UserContext'

type LogType = 'call' | 'email' | 'meeting' | 'note'

const iconByType: Record<LogType, React.ReactElement> = {
  call: <PhoneCall className="w-4 h-4 text-blue-500" />,
  email: <Mail className="w-4 h-4 text-green-600" />,
  meeting: <Users className="w-4 h-4 text-purple-600" />,
  note: <MessageCircle className="w-4 h-4 text-muted-foreground" />
}

export default function CustomerProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useUser()

  const [customer, setCustomer] = useState<any>(null)
  const [taskCount, setTaskCount] = useState(0)
  const [showEdit, setShowEdit] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showPipelineDialog, setShowPipelineDialog] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [pipeline, setPipeline] = useState<any[]>([])

  useEffect(() => {
    fetchAll()
    fetchPipeline()
  }, [id])

  const fetchAll = async () => {
    const [customerRes, tasksRes, logsRes] = await Promise.all([
      fetch(`http://localhost:4000/api/crm/customers/${id}`, { credentials: 'include' }),
      fetch(`http://localhost:4000/api/crm/tasks/customer/${id}/open`, { credentials: 'include' }),
      fetch(`http://localhost:4000/api/crm/${id}/interactions`, { credentials: 'include' })
    ])

    const customerData = await customerRes.json()
    setCustomer(customerData.customer)

    const taskData = await tasksRes.json()
    setTaskCount(taskData.tasks.length)

    const logData = await logsRes.json()
    setLogs(logData.logs || [])
  }

  const fetchPipeline = async () => {
    const res = await fetch(`http://localhost:4000/api/crm/${id}/pipeline`, { credentials: 'include' })
    const data = await res.json()
    setPipeline(data.pipeline)
  }

  const refetchCustomer = async () => {
    const res = await fetch(`http://localhost:4000/api/crm/customers/${id}`, {
      credentials: 'include'
    })
    const data = await res.json()
    setCustomer(data.customer)
  }

  const handleDelete = async () => {
    const res = await fetch(`http://localhost:4000/api/crm/customers/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (res.ok) {
      alert('Customer deleted')
      router.push('/admin/crm')
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to delete customer')
    }
  }

  // Memoized handlers for modal callbacks
  const handleShowLog = useCallback(() => setShowLog(true), [])
  const handleShowEdit = useCallback(() => setShowEdit(true), [])
  const handleShowAssignDialog = useCallback(() => setShowAssignDialog(true), [])
  const handleShowPipelineDialog = useCallback(() => setShowPipelineDialog(true), [])
  const handleShowDeleteModal = useCallback(() => setShowDeleteModal(true), [])
  const handleBackToList = useCallback(() => router.push('/admin/crm'), [router])

  if (!customer) return <div className="p-6">Loading...</div>

  const canEditPipeline =
    user?.role === 'super_admin' || (customer?.assigned_user_ids || []).includes(user?.userId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToList}
              className="text-white hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to CRM
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                  <p className="text-blue-100 text-lg mt-1">{customer.company || 'Individual Customer'}</p>
                  {customer.assigned_user_names?.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <UserCheck className="h-4 w-4 text-blue-200" />
                      <span className="text-blue-100 text-sm">
                        Assigned to: {customer.assigned_user_names.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/admin/crm/customers/${id}/tasks`}>
                <Button className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-all duration-200">
                  <Target className="h-4 w-4 mr-2" />
                  View Tasks ({taskCount})
                </Button>
              </Link>
              {user?.role === 'super_admin' && (
                <Button 
                  variant="ghost"
                  onClick={handleShowAssignDialog}
                  className="text-white hover:bg-white/20 border border-white/30 md:hidden"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Reps
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hidden md:block">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={handleShowLog}
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Log Interaction
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShowEdit}
              className="border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Customer
            </Button>
            {canEditPipeline && (
              <Button 
                variant="outline" 
                onClick={handleShowPipelineDialog}
                className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
              >
                <Target className="h-4 w-4 mr-2" />
                Update Stage
              </Button>
            )}
            {user?.role === 'super_admin' && (
              <Button 
                variant="outline" 
                onClick={handleShowAssignDialog}
                className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Reps
              </Button>
            )}
          </div>
        </div>

        {/* Contact Information and Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShowEdit}
                className="text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{customer.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{customer.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium text-gray-900">{customer.company || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Industry</p>
                  <p className="font-medium text-gray-900">{customer.industry || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {customer.notes || 'No notes available for this customer yet.'}
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline and Interaction History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Pipeline Card */}
          {pipeline.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Sales Pipeline</h3>
                </div>
                {canEditPipeline && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleShowPipelineDialog}
                    className="text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Update
                  </Button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="space-y-4">
                  {pipeline.map((entry: any, index: number) => (
                    <div key={index} className="relative pl-8 pb-4">
                      {index !== pipeline.length - 1 && (
                        <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 to-transparent" />
                      )}
                      <div className="absolute left-0 top-2 h-6 w-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full" />
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="font-medium text-purple-900 capitalize">
                          {entry.stage.replace('_', ' ')}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>by {entry.moved_by_name} on {format(new Date(entry.created_at), 'PPP p')}</span>
                        </div>
                        {entry.comment && (
                          <p className="text-sm text-purple-700 mt-2 bg-white/70 rounded p-2">
                            {entry.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interaction History Card */}
          {logs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Interaction History</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShowLog}
                  className="text-green-600 hover:bg-green-50 transition-colors duration-200"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Log
                </Button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {logs.map((log: any) => (
                    <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex-shrink-0 mt-0.5">
                        {iconByType[log.type as LogType]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <span className="capitalize font-medium">{log.type}</span>
                          <span>•</span>
                          <span>{log.user_name}</span>
                          <span>•</span>
                          <span>{format(new Date(log.created_at), 'PPp')}</span>
                        </div>
                        <p className="text-gray-900 leading-relaxed">
                          {log.note || 'No additional notes'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        {user?.role === 'super_admin' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
            </div>
            <p className="text-red-700 mb-4">
              Permanently delete this customer and all associated data. This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleShowDeleteModal}
              className="bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Customer
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {customer && (
        <EditCustomerDialog customer={customer} open={showEdit} onOpenChange={setShowEdit} onSave={refetchCustomer} />
      )}
      <CustomerLogInteractionDialog customerId={customer.id} open={showLog} onOpenChange={setShowLog} onSuccess={fetchAll} />
      <PipelineStageDialog customerId={customer.id} open={showPipelineDialog} onOpenChange={setShowPipelineDialog} onSuccess={fetchPipeline} />
      <AssignRepsDialog customerId={customer.id} open={showAssignDialog} onOpenChange={setShowAssignDialog} currentUserIds={customer.assigned_user_ids} onSuccess={refetchCustomer} />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 text-left">
                  Confirm Deletion
                </DialogTitle>
                <p className="text-sm text-gray-600 text-left">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Are you sure you want to permanently delete <strong className="font-semibold">{customer.name}</strong> and all their associated tasks, logs, and records?
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
