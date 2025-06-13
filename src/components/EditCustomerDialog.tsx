'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function EditCustomerDialog({ customer, open, onOpenChange, onSave }: any) {
  const [form, setForm] = useState({ ...customer })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customer) setForm({ ...customer })
  }, [customer])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/${customer.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to update customer')
      toast.success('Customer updated')
      onOpenChange(false)
      onSave()
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
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <Input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="mb-2" />
        <Input name="company" value={form.company || ''} onChange={handleChange} placeholder="Company" className="mb-2" />
        <Input name="email" value={form.email || ''} onChange={handleChange} placeholder="Email" className="mb-2" />
        <Input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Phone" className="mb-2" />
        <Input name="industry" value={form.industry || ''} onChange={handleChange} placeholder="Industry" className="mb-2" />
        <Textarea name="notes" value={form.notes || ''} onChange={handleChange} placeholder="Notes" className="mb-2" />

        <Button onClick={handleSubmit} disabled={loading}>Save</Button>
      </DialogContent>
    </Dialog>
  )
}
