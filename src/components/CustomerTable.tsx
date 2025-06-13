'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import CreateCustomerDialog from '@/components/CreateCustomerDialog'
import ViewLogDialog from '@/components/ViewLogDialog'
import AdminLogDialog from '@/components/AdminLogDialog'
import TaskDialog from './TaskDialog'

export default function CustomerTable() {
  const [customers, setCustomers] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [activeCustomerId, setActiveCustomerId] = useState<number | null>(null)
  const [taskCount, setTaskCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [openAdminLog, setOpenAdminLog] = useState(false)
  const [adminLogCustomerId, setAdminLogCustomerId] = useState<number | null>(null)
  const [openViewLog, setOpenViewLog] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [logLoading, setLogLoading] = useState(false)

  useEffect(() => {
    fetch('http://localhost:4000/api/crm', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCustomers(data.customers))
      .catch(console.error)

    fetch('http://localhost:4000/api/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(console.error)

    fetchTaskCount()
  }, [])

  const fetchTaskCount = async () => {
    const res = await fetch('http://localhost:4000/api/crm/tasks', {
      credentials: 'include'
    })
    const data = await res.json()
    setTaskCount(data?.tasks?.length || 0)
  }

  const fetchLogsForCustomer = async (customerId: number) => {
    setLogLoading(true)
    const res = await fetch(`http://localhost:4000/api/crm/${customerId}/interactions`, {
      credentials: 'include'
    })
    const data = await res.json()
    setLogs(data.logs || [])
    setLogLoading(false)
  }

  const handleOpenTaskDialog = (customer: any) => {
    setSelectedCustomer(customer)
    setActiveCustomerId(customer.id)
    setOpenTaskDialog(true)
  }

  const handleOpenViewLogs = async (customer: any) => {
    setSelectedCustomer(customer)
    await fetchLogsForCustomer(customer.id)
    setOpenViewLog(true)
  }

  const handleOpenAdminLogDialog = (id: number) => {
    setAdminLogCustomerId(id)
    setOpenAdminLog(true)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-lg font-medium">Customers</h2>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/crm/tasks">
            <Button variant="default">
              View Tasks {taskCount > 0 && `(${taskCount})`}
            </Button>
          </Link>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Customer
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Stage</th>
                <th className="p-2 text-left">Rep(s)</th>
                <th className="p-2 text-left">Actions</th>
                <th className="p-2 text-left">Last Contact</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust: any) => (
                <tr key={cust.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{cust.name}</td>
                  <td className="p-2">{cust.company}</td>
                  <td className="p-2">{cust.current_stage || '—'}</td>
                  <td className="p-2">{cust.assigned_user_names?.join(', ') || '—'}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleOpenTaskDialog(cust)}>+ Task</Button>
                      <Button size="sm" variant="outline" onClick={() => handleOpenViewLogs(cust)}>View Logs</Button>
                      <Link href={`/admin/crm/customers/${cust.id}`}>
                        <Button size="sm" variant="outline">Profile</Button>
                      </Link>
                      {user?.role === 'super_admin' && (
                        <Button size="sm" variant="outline" onClick={() => handleOpenAdminLogDialog(cust.id)}>Admin Logs</Button>
                      )}
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {cust.last_contacted_at
                      ? new Date(cust.last_contacted_at).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 sm:hidden">
        {customers.map((cust: any) => (
          <div key={cust.id} className="border rounded-xl p-4 shadow-sm bg-white">
            <div className="mb-2">
              <p className="text-sm font-semibold text-[#003cc5]">{cust.name}</p>
              <p className="text-xs text-gray-500">{cust.company}</p>
            </div>
            <div className="text-xs text-gray-600 space-y-1 mb-2">
              <p><span className="font-medium">Stage:</span> {cust.current_stage || '—'}</p>
              <p><span className="font-medium">Rep(s):</span> {cust.assigned_user_names?.join(', ') || '—'}</p>
              <p><span className="font-medium">Last Contact:</span> {cust.last_contacted_at
                ? new Date(cust.last_contacted_at).toLocaleDateString()
                : '—'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleOpenTaskDialog(cust)}>+ Task</Button>
              <Button size="sm" variant="outline" onClick={() => handleOpenViewLogs(cust)}>Logs</Button>
              <Link href={`/admin/crm/customers/${cust.id}`}>
                <Button size="sm" variant="outline">Profile</Button>
              </Link>
              {user?.role === 'super_admin' && (
                <Button size="sm" variant="outline" onClick={() => handleOpenAdminLogDialog(cust.id)}>Admin Logs</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <CreateCustomerDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => window.location.reload()}
      />

      {selectedCustomer && (
        <ViewLogDialog
          customer={selectedCustomer}
          open={openViewLog}
          onOpenChange={(open) => {
            setOpenViewLog(open)
            if (!open) setSelectedCustomer(null)
          }}
          logs={logs}
          loading={logLoading}
        />
      )}

      {activeCustomerId !== null && (
        <TaskDialog
          customerId={activeCustomerId}
          open={openTaskDialog}
          onOpenChange={setOpenTaskDialog}
          repName={selectedCustomer?.assigned_user_names?.[0] || ''}
          onSuccess={async () => {
            await fetchTaskCount()
            setOpenTaskDialog(false)
            setActiveCustomerId(null)
            setSelectedCustomer(null)
          }}
        />
      )}

      {adminLogCustomerId !== null && (
        <AdminLogDialog
          customerId={adminLogCustomerId}
          open={openAdminLog}
          onOpenChange={setOpenAdminLog}
        />
      )}
    </div>
  )
}
