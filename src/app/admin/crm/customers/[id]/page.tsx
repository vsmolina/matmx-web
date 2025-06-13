'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import EditCustomerDialog from '@/components/EditCustomerDialog'
import CustomerLogInteractionDialog from '@/components/CustomerLoginInteractionDialog'
import AssignRepsDialog from '@/components/AssignRepsDialog'
import PipelineStageDialog from '@/components/PipelineStageDialog'
import { MessageCircle, PhoneCall, Mail, Users } from 'lucide-react'
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

  if (!customer) return <div className="p-6">Loading...</div>

  const canEditPipeline =
    user?.role === 'super_admin' || (customer?.assigned_user_ids || []).includes(user?.userId)

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/admin/crm')}>
          ← Back to CRM
        </Button>

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            {customer.assigned_user_names?.length > 0 && (
              <p className="text-sm text-muted-foreground">
                <strong>Assigned Rep(s):</strong> {customer.assigned_user_names.join(', ')}
              </p>
            )}
          </div>
          <Link href={`/admin/crm/customers/${id}/tasks`}>
            <Button variant="default">View Tasks ({taskCount})</Button>
          </Link>
          {user?.role === 'super_admin' && (
            <div className="py-4 block md:hidden">
              <Button variant="outline" onClick={() => setShowAssignDialog(true)}>Manage Reps</Button>
            </div>
          )}
        </div>
      </div>

      <div className="border rounded p-4 hidden md:block">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowLog(true)}>Log Interaction</Button>
          <Button variant="outline" onClick={() => setShowEdit(true)}>Edit Customer</Button>
          {canEditPipeline && (
            <Button variant="outline" onClick={() => setShowPipelineDialog(true)}>Update Stage</Button>
          )}
          {user?.role === 'super_admin' && (
            <Button variant="outline" onClick={() => setShowAssignDialog(true)}>Manage Reps</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Contact Info</h3>
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
          </div>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <p><strong>Company:</strong> {customer.company}</p>
          <p><strong>Industry:</strong> {customer.industry || '—'}</p>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p>{customer.notes || 'No notes yet.'}</p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pipeline.length > 0 && (
          <div className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold mb-3">Sales Pipeline</h3>
              {canEditPipeline && (
                <Button variant="outline" size="sm" onClick={() => setShowPipelineDialog(true)}>Update</Button>
              )}
            </div>
            <div className="max-h-[200px] overflow-y-auto pr-2">
              <ul className="space-y-4">
                {pipeline.map((entry: any, index: number) => (
                  <li key={index} className="relative pl-6 border-l border-gray-300">
                    <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary" />
                    <p className="text-sm font-medium capitalize">{entry.stage.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">
                      by {entry.moved_by_name} on {format(new Date(entry.created_at), 'PPP p')}
                    </p>
                    {entry.comment && <p className="text-muted-foreground text-sm mt-1">{entry.comment}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold mb-3">Interaction History</h3>
              <Button variant="outline" size="sm" onClick={() => setShowLog(true)}>Log</Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <ul className="space-y-4">
                {logs.map((log: any) => (
                  <li key={log.id} className="flex gap-2 items-start">
                    <div className="mt-1">{iconByType[log.type as LogType]}</div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        <span className="capitalize">{log.type}</span> by <strong>{log.user_name}</strong> &middot;{' '}
                        {format(new Date(log.created_at), 'PPP p')}
                      </p>
                      <p>{log.note || '—'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {user?.role === 'super_admin' && (
        <div className="py-6 border-t place-self-center">
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            Delete Customer
          </Button>
        </div>
      )}

      {/* Modals */}
      {customer && (
        <EditCustomerDialog customer={customer} open={showEdit} onOpenChange={setShowEdit} onSave={refetchCustomer} />
      )}
      <CustomerLogInteractionDialog customerId={customer.id} open={showLog} onOpenChange={setShowLog} onSuccess={fetchAll} />
      <PipelineStageDialog customerId={customer.id} open={showPipelineDialog} onOpenChange={setShowPipelineDialog} onSuccess={fetchPipeline} />
      <AssignRepsDialog customerId={customer.id} open={showAssignDialog} onOpenChange={setShowAssignDialog} currentUserIds={customer.assigned_user_ids} onSuccess={refetchCustomer} />

      {/* Delete Confirmation */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete <strong>{customer.name}</strong> and all their associated tasks, logs, and records?
          </p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
