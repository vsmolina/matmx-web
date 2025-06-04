'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateCustomerDialog from '@/components/CreateCustomerDialog'
import ViewLogDialog from '@/components/ViewLogDialog'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function CustomerTable() {
  const [customers, setCustomers] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  useEffect(() => {
    fetch('http://localhost:4000/api/crm', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCustomers(data.customers))
      .catch(console.error)
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Customers</h2>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Customer
        </Button>
      </div>

      <ScrollArea className="border rounded-md max-h-[70vh]">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Company</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Rep(s)</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((cust: any) => (
              <tr key={cust.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{cust.name}</td>
                <td className="p-2">{cust.company}</td>
                <td className="p-2">{cust.status}</td>
                <td className="p-2">{cust.assigned_user_ids?.join(', ')}</td>
                <td className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    View Logs
                  </Button>
                </td>
                <td>{cust.last_contacted_at ? new Date(cust.last_contacted_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>

      <CreateCustomerDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => window.location.reload()}
      />

      {selectedCustomer && (
        <ViewLogDialog
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  )
}
