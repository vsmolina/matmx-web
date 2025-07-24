'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { 
  UserPlus, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Activity, 
  FileText,
  CheckCircle,
  Users,
  Info
} from 'lucide-react'

interface CreateCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CreateCustomerDialog({ open, onOpenChange, onSuccess }: CreateCustomerDialogProps) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'lead',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleStatusChange = (value: string) => {
    setForm({ ...form, status: value })
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Customer name is required')
      return
    }
    if (form.email && !form.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/crm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to create customer')
      toast.success('Customer created successfully!')
      
      // Reset form
      setForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'lead',
        notes: ''
      })
      
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = form.name.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 text-left">
                Create New Customer
              </DialogTitle>
              <p className="text-sm text-gray-600 text-left">
                Add a new customer to your CRM system
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Name Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-semibold text-gray-700">Customer Name *</Label>
            </div>
            <Input 
              name="name"
              value={form.name}
              onChange={handleChange} 
              placeholder="Enter customer's full name"
              className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
            />
          </div>

          {/* Company Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              <Label className="text-sm font-semibold text-gray-700">Company</Label>
            </div>
            <Input 
              name="company"
              value={form.company}
              onChange={handleChange} 
              placeholder="Company name (optional)"
              className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <Label className="text-sm font-semibold text-gray-700">Email</Label>
              </div>
              <Input 
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange} 
                placeholder="customer@email.com"
                className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <Label className="text-sm font-semibold text-gray-700">Phone</Label>
              </div>
              <Input 
                name="phone"
                value={form.phone}
                onChange={handleChange} 
                placeholder="(555) 123-4567"
                className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
              />
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              <Label className="text-sm font-semibold text-gray-700">Customer Status</Label>
            </div>
            <Select value={form.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white">
                <SelectValue placeholder="Select customer status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                    <span>Lead</span>
                  </div>
                </SelectItem>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                    <span>Active</span>
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    <span>Inactive</span>
                  </div>
                </SelectItem>
                <SelectItem value="prospect">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    <span>Prospect</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-500" />
              <Label className="text-sm font-semibold text-gray-700">Notes</Label>
            </div>
            <Textarea 
              name="notes"
              value={form.notes}
              onChange={handleChange} 
              rows={4}
              placeholder="Additional notes or comments about this customer..."
              className="border-2 border-gray-200 focus:border-blue-400 bg-white resize-none"
            />
          </div>

          {/* Customer Info Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Customer Information</span>
            </div>
            <div className="space-y-1 text-xs text-green-700">
              <p>• New customers will appear in your CRM dashboard</p>
              <p>• You can assign tasks and track interactions with them</p>
              <p>• Email validation ensures proper communication setup</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !isFormValid}
              className="flex-1 h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Create Customer
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
