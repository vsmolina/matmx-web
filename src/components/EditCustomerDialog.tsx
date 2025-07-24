'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import { 
  Edit3,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  Info
} from 'lucide-react'

export default function EditCustomerDialog({ customer, open, onOpenChange, onSave }: any) {
  const [form, setForm] = useState({ ...customer })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customer) setForm({ ...customer })
  }, [customer])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/${customer.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to update customer')
      toast.success('Customer updated')
      onOpenChange(false)
      onSave()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = form.name?.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Edit3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 text-left">
                Edit Customer Details
              </DialogTitle>
              <p className="text-sm text-gray-600 text-left">
                Update customer information and preferences
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
              value={form.name || ''}
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
              value={form.company || ''}
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
                value={form.email || ''}
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
                value={form.phone || ''}
                onChange={handleChange} 
                placeholder="(555) 123-4567"
                className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
              />
            </div>
          </div>

          {/* Industry Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-500" />
              <Label className="text-sm font-semibold text-gray-700">Industry</Label>
            </div>
            <Input 
              name="industry"
              value={form.industry || ''}
              onChange={handleChange} 
              placeholder="e.g., Technology, Healthcare, Manufacturing"
              className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
            />
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-500" />
              <Label className="text-sm font-semibold text-gray-700">Notes</Label>
            </div>
            <Textarea 
              name="notes"
              value={form.notes || ''}
              onChange={handleChange} 
              rows={4}
              placeholder="Additional notes or comments about this customer..."
              className="border-2 border-gray-200 focus:border-blue-400 bg-white resize-none"
            />
          </div>

          {/* Update Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Update Information</span>
            </div>
            <div className="space-y-1 text-xs text-blue-700">
              <p>• Changes will be saved immediately after confirmation</p>
              <p>• Updated information will reflect across all related records</p>
              <p>• Name field is required and cannot be empty</p>
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
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
