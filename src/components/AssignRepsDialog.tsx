'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

export default function AssignRepsDialog({ customerId, open, onOpenChange, currentUserIds = [], onSuccess }: any) {
  const [users, setUsers] = useState<any[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  if (!open) return

  fetch('http://localhost:4000/api/users', {
    credentials: 'include'
  })
      .then(async (res) => {
        const text = await res.text()
        try {
          const json = JSON.parse(text)
          setUsers((json.users || []).filter((u: any) => u.role === 'sales_rep'))

          setSelected(currentUserIds)
        } catch (e) {
          console.error('Failed to parse user list:', text)
        }
      })
      .catch(console.error)
  }, [open])

  const cleanUserIds = selected.filter((id) => typeof id === 'number' && !isNaN(id))

  const saveAssignments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/${customerId}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: cleanUserIds })
      })
      if (!res.ok) throw new Error('Failed to assign reps')
      toast.success('Reps updated')
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(uid => uid !== id)
        : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>Assign Sales Reps</DialogTitle>
            </DialogHeader>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto px-1">
            {users.length === 0 ? (
                <p className="text-muted text-sm">No users available.</p>
            ) : (
                users.map((u) => (
                <div key={u.id} className="flex items-center gap-2">
                    <Checkbox
                    id={`user-${u.id}`}
                    checked={selected.includes(u.id)}
                    onCheckedChange={() => toggle(u.id)}
                    />
                    <Label htmlFor={`user-${u.id}`}>{u.name}</Label>
                </div>
                ))
            )}
            </div>

            <div className="pt-4 flex justify-end">
            <Button onClick={saveAssignments} disabled={loading}>
                Save
            </Button>
            </div>
        </DialogContent>
    </Dialog>
  )
}
