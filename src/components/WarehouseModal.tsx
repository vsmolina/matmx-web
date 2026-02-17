'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import { apiCall } from '@/lib/api'
import toast from 'react-hot-toast'

interface Warehouse {
  id?: number
  name: string
  code: string
  address?: string
  city?: string
  state?: string
  country?: string
  zip?: string
  phone?: string
  email?: string
  manager_name?: string
  capacity?: number
  notes?: string
  is_active?: boolean
}

interface WarehouseModalProps {
  warehouse: Warehouse | null
  onClose: () => void
  onSave: () => void
}

export default function WarehouseModal({ warehouse, onClose, onSave }: WarehouseModalProps) {
  const [formData, setFormData] = useState<Warehouse>({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    phone: '',
    email: '',
    manager_name: '',
    capacity: 0,
    notes: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (warehouse) {
      setFormData(warehouse)
    }
  }, [warehouse])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Warehouse name is required'
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Warehouse code is required'
    } else if (!/^[A-Z0-9-]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters, numbers, and hyphens'
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const url = warehouse?.id 
        ? `/api/warehouses/${warehouse.id}`
        : '/api/warehouses'
      
      const method = warehouse?.id ? 'PUT' : 'POST'
      
      const res = await apiCall(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save warehouse')
      }
      
      toast.success(warehouse?.id ? 'Warehouse updated successfully' : 'Warehouse created successfully')
      onSave()
    } catch (err: any) {
      console.error('Error saving warehouse:', err)
      toast.error(err.message || 'Failed to save warehouse')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Warehouse, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {warehouse?.id ? 'Edit Warehouse' : 'Add New Warehouse'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Warehouse Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Main Distribution Center"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="code">Warehouse Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., EP-001"
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">{errors.code}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="State"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="zip">ZIP/Postal Code</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
                placeholder="ZIP Code"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="warehouse@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manager_name">Manager Name</Label>
              <Input
                id="manager_name"
                value={formData.manager_name}
                onChange={(e) => handleChange('manager_name', e.target.value)}
                placeholder="Warehouse manager"
              />
            </div>

            <div>
              <Label htmlFor="capacity">Capacity (items)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                placeholder="Maximum capacity"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this warehouse"
              rows={3}
            />
          </div>

          {warehouse?.id && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Warehouse is active
              </Label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {loading ? 'Saving...' : (warehouse?.id ? 'Update Warehouse' : 'Create Warehouse')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}