'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  productId: number
  vendorId: number
  vendorName: string
  currentStock: number
  onSave: () => void
  trigger: React.ReactNode
}

type Mode = 'relative' | 'absolute'

export default function AdjustInventoryModal({
  productId,
  vendorId,
  vendorName,
  currentStock,
  onSave,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('relative')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      quantity: 0,
      reason: '',
      note: '',
    },
  })

  const quantityInput = watch('quantity')

  const parsedQuantity = Number(quantityInput)
  const finalQty = mode === 'relative'
    ? currentStock + parsedQuantity
    : parsedQuantity

  const changeAmount = finalQty - currentStock

  const submitForm = async () => {
    if (isNaN(parsedQuantity)) {
      toast.error('Invalid quantity input')
      return
    }

    try {
      const res = await fetch(`http://localhost:4000/api/inventory/${productId}/receive`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          quantity: changeAmount,
          reason: watch('reason'),
          note: watch('note'),
        }),
      })

      if (!res.ok) throw new Error('Failed to receive inventory')

      toast.success('Inventory updated')
      reset()
      onSave()
      setOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to receive inventory')
    }
  }

  const handleSubmitWrapper = () => {
    if (isNaN(parsedQuantity)) {
      toast.error('Invalid quantity input')
      return
    }

    if (finalQty < 0) {
      setConfirmOpen(true)
    } else {
      submitForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Inventory</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Vendor: <strong>{vendorName}</strong>
          </div>
          <div className="text-sm text-gray-600">
            Current Stock: <span className="font-semibold">{currentStock}</span>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'relative' ? 'default' : 'outline'}
              onClick={() => setMode('relative')}
            >
              +/- Adjustment
            </Button>
            <Button
              type="button"
              variant={mode === 'absolute' ? 'default' : 'outline'}
              onClick={() => setMode('absolute')}
            >
              Overwrite
            </Button>
          </div>

          <form
            onSubmit={handleSubmit(handleSubmitWrapper)}
            className="space-y-4"
          >
            <Input
              type="number"
              {...register('quantity', { required: true })}
              placeholder={mode === 'relative' ? '+10 or -5' : 'New stock value'}
            />
            <Input {...register('reason')} placeholder="Reason (e.g. audit, restock)" required />
            <Input {...register('note')} placeholder="Optional note" />

            <div className="text-sm text-gray-500">
              Final Stock: <strong>{isNaN(finalQty) ? '–' : finalQty}</strong>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              Confirm Adjustment
            </Button>
          </form>
        </div>
      </DialogContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Warning: This will result in negative stock.
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to proceed?
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitForm}>Yes, proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
