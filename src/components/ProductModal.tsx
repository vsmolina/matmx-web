'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Product {
  id?: number
  name: string
  sku: string
  vendor_id: number
  reorder_threshold: number
  unit_price: number
  category: string
  notes?: string
  initial_stock: number
  lead_time_days: number
  payment_terms: string
  vendor_notes?: string
}

interface Vendor {
  id: number
  name: string
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
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm<Product>({
    defaultValues: defaultValues || {
      name: '',
      sku: '',
      vendor_id: 0,
      reorder_threshold: 0,
      unit_price: 0,
      category: '',
      notes: '',
      initial_stock: 0,
      lead_time_days: 0,
      payment_terms: '',
      vendor_notes: ''
    }
  })

  const [vendors, setVendors] = useState<Vendor[]>([])

  // Load vendors
  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch('http://localhost:4000/api/vendors', {
          credentials: 'include'
        })
        const data = await res.json()
        setVendors(data.vendors || [])
      } catch (err) {
        console.error('Failed to load vendors', err)
      }
    }
    fetchVendors()
  }, [])

  // Preload data for edit mode
  useEffect(() => {
    async function preloadTerms() {
      if (mode === 'edit' && defaultValues?.id) {
        try {
          const res = await fetch(`http://localhost:4000/api/products/${defaultValues.id}/vendor-terms`, {
            credentials: 'include'
          })
          if (res.ok) {
            const terms = await res.json()
            setValue('lead_time_days', terms.lead_time_days)
            setValue('payment_terms', terms.payment_terms)
            setValue('vendor_notes', terms.vendor_notes || '')
          }
        } catch (err) {
          console.error('Failed to fetch vendor terms for product', err)
        }
      }
    }

    if (defaultValues) reset(defaultValues)
    preloadTerms()
  }, [defaultValues, reset, mode, setValue])

  // Auto-fill terms on vendor select (add mode only)
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'vendor_id' && mode === 'add' && value.vendor_id) {
        // Delay fetching slightly to prevent racing on render
        setTimeout(async () => {
          try {
            const res = await fetch(`http://localhost:4000/api/vendors/${value.vendor_id}/default-terms`, {
              credentials: 'include'
            })
            if (res.ok) {
              const terms = await res.json()
              setValue('lead_time_days', terms.lead_time_days)
              setValue('payment_terms', terms.payment_terms)
              setValue('vendor_notes', terms.vendor_notes || '')
            }
          } catch (err) {
            console.error('Failed to autofill vendor terms', err)
          }
        }, 100) // small debounce to break render cycle
      }
    })

    return () => subscription.unsubscribe?.()
  }, [watch, setValue, mode])

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
          body: JSON.stringify(data)
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

          <div className="flex gap-2 items-center">
            <select
              className="flex-1 border rounded px-3 py-2 text-sm"
              {...register('vendor_id', { valueAsNumber: true })}
              defaultValue={defaultValues?.vendor_id || ''}
            >
              <option value="">-- Select Vendor --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <Link href="/admin/vendors">
              <Button type="button" variant="outline" size="sm">Create New</Button>
            </Link>
          </div>

          <hr className="h-px my-6 bg-black border-0 dark:bg-gray-700" />

          <div className='text-sm pl-2'>Initial Stock</div>
          <Input type="number" {...register('initial_stock', { valueAsNumber: true })} placeholder="" required />

          <div className='text-sm pl-2'>Reorder Threshold</div>
          <Input type="number" {...register('reorder_threshold', { valueAsNumber: true })} placeholder="" required />

          <div className='text-sm pl-2'>Unit Price</div>
          <Input type="number" step="0.01" {...register('unit_price', { valueAsNumber: true })} placeholder="" required />

          <Input {...register('category')} placeholder="Category" />
          <Input {...register('notes')} placeholder="Notes" />

          <hr className="h-px my-6 bg-black border-0 dark:bg-gray-700" />

          <div className='text-sm pl-2'>Lead Time (Days)</div>
          <Input type="number" {...register('lead_time_days', { valueAsNumber: true })} required />

          <div className='text-sm pl-2'>Payment Terms</div>
          <Input {...register('payment_terms')} placeholder="e.g. Net 30" required />

          <div className='text-sm pl-2'>Vendor Notes</div>
          <Input {...register('vendor_notes')} placeholder="Optional notes" />

          <Button type="submit" disabled={isSubmitting}>
            {mode === 'add' ? 'Create' : 'Update'}
          </Button>
        </form>

        {mode === 'edit' && defaultValues?.id && (
          <div className="mt-6 border-t pt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Barcode Preview</p>
            <img
              src={`http://localhost:4000/api/inventory/${defaultValues.id}/barcode.png`}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.alt = 'Barcode not available'
              }}
              alt="Barcode"
              className="mx-auto border bg-white p-2"
              width={300}
              height={80}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
