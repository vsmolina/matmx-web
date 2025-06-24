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

interface Props {
  productId: number
  vendorId: number
  defaultValues?: Partial<FormValues>
  onSaved: () => void
  trigger: React.ReactNode
}

interface FormValues {
  unit_price: number
  lead_time_days: number
  payment_terms: string
  notes: string
}

export default function VendorTermsModal({ productId, vendorId, defaultValues, onSaved, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      unit_price: defaultValues?.unit_price || 0,
      lead_time_days: defaultValues?.lead_time_days || 0,
      payment_terms: defaultValues?.payment_terms || '',
      notes: defaultValues?.notes || '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch(`http://localhost:4000/api/vendors/${vendorId}/products/${productId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save terms')

      toast.success('Vendor terms saved')
      setOpen(false)
      onSaved()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save terms')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Vendor Terms</DialogTitle>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          <Input type="number" step="0.01" {...register('unit_price')} placeholder="Unit Price" required />
          <Input type="number" {...register('lead_time_days')} placeholder="Lead Time (days)" required />
          <Input {...register('payment_terms')} placeholder="Payment Terms" required />
          <Input {...register('notes')} placeholder="Optional Notes" />
          <Button type="submit" disabled={isSubmitting}>
            Save Terms
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
