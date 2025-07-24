'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import { Users, UserCheck, CheckCircle, Info } from 'lucide-react'

export default function AssignRepsDialog({ customerId, open, onOpenChange, currentUserIds = [], onSuccess }: any) {
  const [users, setUsers] = useState<any[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  if (!open) return

  fetch('http://localhost:4000/api/users', {
    credentials: 'include'
  })
      .then(async (res) => {
        const text = await res.text()
        try {
          const json = JSON.parse(text)
          setUsers((json.users || []).filter((u: any) => u.role === 'sales_rep'))

          setSelected(currentUserIds)
        } catch (e) {
          console.error('Failed to parse user list:', text)
        }
      })
      .catch(console.error)
  }, [open])

  const cleanUserIds = selected.filter((id) => typeof id === 'number' && !isNaN(id))

  const saveAssignments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/${customerId}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: cleanUserIds })
      })
      if (!res.ok) throw new Error('Failed to assign reps')
      toast.success('Reps updated')
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(uid => uid !== id)
        : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 text-left">
                Assign Sales Representatives
              </DialogTitle>
              <p className="text-sm text-gray-600 text-left">
                Select team members to manage this customer
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sales Reps Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-orange-500" />
              <Label className="text-sm font-semibold text-gray-700">
                Available Sales Representatives ({users.length})
              </Label>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No sales representatives available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200">
                      <Checkbox
                        id={`user-${u.id}`}
                        checked={selected.includes(u.id)}
                        onCheckedChange={() => toggle(u.id)}
                        className="border-2 border-gray-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-8 w-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <Label 
                            htmlFor={`user-${u.id}`} 
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            {u.name}
                          </Label>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      {selected.includes(u.id) && (
                        <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selected.length > 0 && (
              <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                <strong>{selected.length}</strong> representative{selected.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Assignment Info Card */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Assignment Information</span>
            </div>
            <div className="space-y-1 text-xs text-orange-700">
              <p>• Assigned reps can view and manage this customer's details</p>
              <p>• They will receive notifications for customer activities</p>
              <p>• Multiple reps can be assigned for team collaboration</p>
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
              onClick={saveAssignments} 
              disabled={loading}
              className="flex-1 h-11 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Save Assignments
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
