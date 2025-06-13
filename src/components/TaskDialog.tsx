'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { useUser } from '@/context/UserContext'

export default function TaskDialog({
  customerId,
  onSuccess = () => {},
  open,
  onOpenChange = () => {},
  repName
}: {
  customerId?: number,
  open: boolean,
  onOpenChange?: (open: boolean) => void,
  onSuccess?: () => void,
  repName?: string
}) {
  const { user } = useUser()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [salesReps, setSalesReps] = useState<any[]>([])

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetch('http://localhost:4000/api/users?role=sales_rep', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => setSalesReps(data.users || []))
        .catch(console.error)
    }
  }, [user])

  const handleCreate = async () => {
    if (!title || !dueDate) return toast.error('Title and due date are required')
    if (!user) return toast.error('User not found')

    const finalAssignedTo = user.role === 'super_admin' ? assignedTo : user.userId
    if (!finalAssignedTo) return toast.error('Assigned user is missing')

    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/crm/tasks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          title,
          description,
          due_date: dueDate,
          assigned_to: finalAssignedTo
        })
      })
      if (!res.ok) throw new Error('Failed to create task')
      toast.success('Task created')
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign Task {repName && user?.role !== 'super_admin' ? `for ${repName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <Label className="mb-1">Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3" />

        <Label className="mb-1">Due Date</Label>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mb-3" />

        <Label className="mb-1">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

        {user?.role === 'super_admin' && (
          <>
            <Label className="mt-3 mb-1">Assign To Rep</Label>
            <Select onValueChange={(val) => setAssignedTo(Number(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sales rep" />
              </SelectTrigger>
              <SelectContent>
                {salesReps.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id.toString()}>
                    {rep.name} ({rep.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        <Button className="mt-4" onClick={handleCreate} disabled={loading}>Create</Button>
      </DialogContent>
    </Dialog>
  )
}
