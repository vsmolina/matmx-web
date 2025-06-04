'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'

export default function CreateCustomerDialog({ open, onOpenChange, onSuccess }: any) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/crm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to create')
      toast.success('Customer created')
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
          <DialogTitle>Create Customer</DialogTitle>
        </DialogHeader>

        <Input name="name" placeholder="Name" onChange={handleChange} className="mb-2" />
        <Input name="company" placeholder="Company" onChange={handleChange} className="mb-2" />
        <Input name="email" placeholder="Email" onChange={handleChange} className="mb-2" />
        <Input name="phone" placeholder="Phone" onChange={handleChange} className="mb-2" />
        <Input name="status" placeholder="Status (lead, active...)" onChange={handleChange} className="mb-2" />
        <Textarea name="notes" placeholder="Notes" onChange={handleChange} className="mb-2" />

        <Button onClick={handleSubmit} disabled={loading}>Create</Button>
      </DialogContent>
    </Dialog>
  )
}
