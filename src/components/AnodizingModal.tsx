'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { apiCall } from '@/lib/api'

interface AnodizingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  job?: any
  isEditMode: boolean
}

interface Customer {
  id: number
  name: string
  company_name?: string
}

interface Product {
  id: number
  name: string
  sku: string
}

export default function AnodizingModal({
  isOpen,
  onClose,
  onSave,
  job,
  isEditMode
}: AnodizingModalProps) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    order_id: '',
    quote_id: '',
    anodizing_type: '',
    color: '',
    thickness: '',
    finish_type: '',
    surface_area_sqft: '',
    quantity: '1',
    status: 'pending',
    priority: 'normal',
    received_date: '',
    estimated_completion: '',
    notes: '',
    special_instructions: '',
    internal_notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
      fetchProducts()
      
      if (isEditMode && job) {
        setFormData({
          customer_id: job.customer_id?.toString() || '',
          product_id: job.product_id?.toString() || '',
          order_id: job.order_id?.toString() || '',
          quote_id: job.quote_id?.toString() || '',
          anodizing_type: job.anodizing_type || '',
          color: job.color || '',
          thickness: job.thickness || '',
          finish_type: job.finish_type || '',
          surface_area_sqft: job.surface_area_sqft?.toString() || '',
          quantity: job.quantity?.toString() || '1',
          status: job.status || 'pending',
          priority: job.priority || 'normal',
          received_date: job.received_date ? job.received_date.split('T')[0] : '',
          estimated_completion: job.estimated_completion ? job.estimated_completion.split('T')[0] : '',
          notes: job.notes || '',
          special_instructions: job.special_instructions || '',
          internal_notes: job.internal_notes || ''
        })
      }
    }
  }, [isOpen, isEditMode, job])

  const fetchCustomers = async () => {
    try {
      const response = await apiCall('/api/crm/customers?limit=100')
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await apiCall('/api/inventory/products?limit=100')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.anodizing_type) {
      toast.error('Anodizing type is required')
      return
    }

    setLoading(true)
    
    try {
      const payload = {
        ...formData,
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
        product_id: formData.product_id ? parseInt(formData.product_id) : null,
        order_id: formData.order_id ? parseInt(formData.order_id) : null,
        quote_id: formData.quote_id ? parseInt(formData.quote_id) : null,
        quantity: parseInt(formData.quantity) || 1,
        surface_area_sqft: formData.surface_area_sqft ? parseFloat(formData.surface_area_sqft) : null,
        received_date: formData.received_date || null,
        estimated_completion: formData.estimated_completion || null
      }

      const url = isEditMode ? `/api/anodizing/${job.id}` : '/api/anodizing'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await apiCall(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(isEditMode ? 'Anodizing job updated successfully' : 'Anodizing job created successfully')
        onSave()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save anodizing job')
      }
    } catch (error: any) {
      console.error('Error saving anodizing job:', error)
      toast.error(error.message || 'Failed to save anodizing job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Anodizing Job' : 'Create New Anodizing Job'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the anodizing job details' : 'Enter the details for the new anodizing job'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({...formData, customer_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name} {customer.company_name && `(${customer.company_name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_id">Product</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData({...formData, product_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anodizing_type">Anodizing Type *</Label>
              <Input
                id="anodizing_type"
                value={formData.anodizing_type}
                onChange={(e) => setFormData({...formData, anodizing_type: e.target.value})}
                placeholder="e.g., Type II, Type III"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                placeholder="e.g., Black, Clear, Gold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thickness">Thickness</Label>
              <Input
                id="thickness"
                value={formData.thickness}
                onChange={(e) => setFormData({...formData, thickness: e.target.value})}
                placeholder="e.g., 0.001 inch"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finish_type">Finish Type</Label>
              <Input
                id="finish_type"
                value={formData.finish_type}
                onChange={(e) => setFormData({...formData, finish_type: e.target.value})}
                placeholder="e.g., Matte, Glossy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surface_area_sqft">Surface Area (sq ft)</Label>
              <Input
                id="surface_area_sqft"
                type="number"
                step="0.01"
                value={formData.surface_area_sqft}
                onChange={(e) => setFormData({...formData, surface_area_sqft: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="received_date">Received Date</Label>
              <Input
                id="received_date"
                type="date"
                value={formData.received_date}
                onChange={(e) => setFormData({...formData, received_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_completion">Estimated Completion</Label>
              <Input
                id="estimated_completion"
                type="date"
                value={formData.estimated_completion}
                onChange={(e) => setFormData({...formData, estimated_completion: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
              placeholder="Any special customer requirements..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Customer Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notes visible to customer..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="internal_notes">Internal Notes</Label>
            <Textarea
              id="internal_notes"
              value={formData.internal_notes}
              onChange={(e) => setFormData({...formData, internal_notes: e.target.value})}
              placeholder="Internal notes for staff only..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}