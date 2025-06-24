'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  onSaved: () => void
  trigger: React.ReactNode
}

interface FormValues {
  name: string
  contact_name?: string
  email?: string
  phone?: string
  website?: string
  notes?: string
  min_order_qty?: number
}

export default function VendorCreateModal({ onSaved, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    try {
      const trimmedData = {
        ...data,
        name: data.name.trim(),
        contact_name: data.contact_name?.trim(),
        email: data.email?.trim(),
        phone: data.phone?.trim(),
        website: data.website?.trim(),
        notes: data.notes?.trim(),
      }

      const res = await fetch(`http://localhost:4000/api/vendors`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedData),
      })

      if (!res.ok) throw new Error('Failed to create vendor')

      toast.success('Vendor created')
      setOpen(false)
      reset()
      onSaved()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create vendor')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Vendor</DialogTitle>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input {...register('name', { required: 'Vendor name is required' })} placeholder="Vendor Name" />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <Input {...register('contact_name')} placeholder="Contact Name (optional)" />

          <div>
            <Input
              {...register('email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              })}
              placeholder="Email (optional)"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <Input {...register('phone')} placeholder="Phone (optional)" />

          <div>
            <Input
              {...register('website', {
                pattern: {
                  value: /^(https?:\/\/)?([\w.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?$/,
                  message: 'Invalid website URL',
                },
              })}
              placeholder="Website (optional)"
            />
            {errors.website && <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>}
          </div>

          <Input {...register('notes')} placeholder="Notes (optional)" />

          <div>
            <Input
              type="number"
              {...register('min_order_qty', { valueAsNumber: true })}
              placeholder="Minimum Order Quantity (optional)"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save Vendor
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
