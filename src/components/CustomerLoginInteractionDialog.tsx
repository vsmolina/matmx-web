'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import toast from 'react-hot-toast'
import { PhoneCall, Mail, Users, MessageCircle, FileText, CheckCircle, Info, Clock } from 'lucide-react'

export default function CustomerLogInteractionDialog({ customerId, open, onOpenChange, onSuccess }: any) {
  const [type, setType] = useState('call')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/${customerId}/interactions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, note })
      })
      if (!res.ok) throw new Error('Failed to log interaction')
      toast.success('Interaction logged')
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const iconByType = {
    call: <PhoneCall className="mr-2 w-4 h-4 text-blue-500" />,
    email: <Mail className="mr-2 w-4 h-4 text-green-600" />,
    meeting: <Users className="mr-2 w-4 h-4 text-purple-600" />,
    note: <MessageCircle className="mr-2 w-4 h-4 text-muted-foreground" />
  }

  const isFormValid = note.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 text-left">
                Log Customer Interaction
              </DialogTitle>
              <p className="text-sm text-gray-600 text-left">
                Record communication and activities
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Interaction Type Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-semibold text-gray-700">Interaction Type *</Label>
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white">
                <SelectValue placeholder="Select interaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Phone Call</div>
                      <div className="text-xs text-gray-500">Voice conversation</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-xs text-gray-500">Email communication</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="meeting">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium">Meeting</div>
                      <div className="text-xs text-gray-500">In-person or virtual meeting</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="note">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Note</div>
                      <div className="text-xs text-gray-500">General note or observation</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-500" />
              <Label className="text-sm font-semibold text-gray-700">Details *</Label>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="Describe what happened during this interaction. Include key points discussed, outcomes, next steps, or any important details..."
              className="border-2 border-gray-200 focus:border-blue-400 bg-white resize-none"
            />
          </div>

          {/* Interaction Info Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Interaction Logging</span>
            </div>
            <div className="space-y-1 text-xs text-green-700">
              <p>• All interactions are timestamped and linked to your account</p>
              <p>• Detailed notes help track customer relationship progress</p>
              <p>• Interaction history is visible to assigned team members</p>
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
                  Logging...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Log Interaction
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
