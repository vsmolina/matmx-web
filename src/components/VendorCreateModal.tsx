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
import { 
  Loader2, 
  Store, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  Package,
  X
} from 'lucide-react'

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
      <DialogContent className="sm:max-w-xl max-h-[95vh] w-[95vw] sm:w-full p-0 gap-0 flex flex-col [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Create New Vendor</DialogTitle>
        </DialogHeader>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100 p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Vendor</h2>
                <p className="text-xs sm:text-sm text-gray-600">Add a new supplier to your system</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0 hover:bg-purple-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form className="p-4 sm:p-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Store className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      {...register('name', { required: 'Vendor name is required' })} 
                      placeholder="Enter vendor name"
                      className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      {...register('contact_name')} 
                      placeholder="Enter contact person name"
                      className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Mail className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-medium text-gray-900">Contact Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...register('email', {
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email format',
                        },
                      })}
                      type="email"
                      placeholder="Enter email address"
                      className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      {...register('phone')} 
                      placeholder="Enter phone number"
                      className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...register('website', {
                        pattern: {
                          value: /^(https?:\/\/)?([\w.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?$/,
                          message: 'Invalid website URL',
                        },
                      })}
                      placeholder="Enter website URL"
                      className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  {errors.website && <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Package className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-medium text-gray-900">Additional Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Quantity</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      {...register('min_order_qty', { valueAsNumber: true })}
                      placeholder="Enter minimum order quantity"
                      className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      {...register('notes')}
                      rows={3}
                      placeholder="Add any additional notes about this vendor"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-purple-500 focus:ring-1 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 mr-2" />
                    Create Vendor
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
