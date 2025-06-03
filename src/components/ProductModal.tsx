'use client'

import { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Product {
  id?: number
  name: string
  sku: string
  vendor: string
  stock: number
  reorder_threshold: number
  unit_price: number
  category: string
  notes?: string
}

interface Props {
  mode: 'add' | 'edit'
  defaultValues?: Product
  onSave: () => void
  trigger: React.ReactNode
}

export default function ProductModal({ mode, defaultValues, onSave, trigger }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<Product>({
    defaultValues: defaultValues || {
      name: '',
      sku: '',
      vendor: '',
      stock: 0,
      reorder_threshold: 0,
      unit_price: 0,
      category: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = async (data: Product) => {
    try {
      const res = await fetch(
        mode === 'add'
          ? 'http://localhost:4000/api/inventory'
          : `http://localhost:4000/api/inventory/${defaultValues?.id}`,
        {
          method: mode === 'add' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      )

      if (!res.ok) throw new Error('Failed to save product')
      toast.success(`Product ${mode === 'add' ? 'created' : 'updated'} successfully`)
      onSave()
    } catch (err) {
      console.error(err)
      toast.error('Error saving product')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input {...register('name')} placeholder="Name" required />
          <Input {...register('sku')} placeholder="SKU" required />
          <Input {...register('vendor')} placeholder="Vendor" />
          <Input type="number" {...register('stock')} placeholder="Initial Stock" required />
          <Input type="number" {...register('reorder_threshold')} placeholder="Reorder Threshold" required />
          <Input type="number" step="0.01" {...register('unit_price')} placeholder="Unit Price" required />
          <Input {...register('category')} placeholder="Category" />
          <Input {...register('notes')} placeholder="Notes" />

          <Button type="submit" disabled={isSubmitting}>
            {mode === 'add' ? 'Create' : 'Update'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
