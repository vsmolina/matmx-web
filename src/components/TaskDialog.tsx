'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { useUser } from '@/context/UserContext'
import { 
  ClipboardList, 
  Calendar, 
  FileText, 
  Users, 
  CheckCircle,
  UserPlus,
  Target,
  Clock
} from 'lucide-react'

export default function TaskDialog({
  customerId,
  onSuccess = () => {},
  open,
  onOpenChange = () => {},
  repName
}: {
  customerId?: number,
  open: boolean,
  onOpenChange?: (open: boolean) => void,
  onSuccess?: () => void,
  repName?: string
}) {
  const { user } = useUser()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [salesReps, setSalesReps] = useState<any[]>([])

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetch('http://localhost:4000/api/users?role=sales_rep', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => setSalesReps(data.users || []))
        .catch(console.error)
    }
  }, [user])

  const handleCreate = async () => {
    if (!title || !dueDate) return toast.error('Title and due date are required')
    if (!user) return toast.error('User not found')

    const finalAssignedTo = user.role === 'super_admin' ? assignedTo : user.userId
    if (!finalAssignedTo) return toast.error('Assigned user is missing')

    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/crm/tasks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          title,
          description,
          due_date: dueDate,
          assigned_to: finalAssignedTo
        })
      })
      if (!res.ok) throw new Error('Failed to create task')
      toast.success('Task created')
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 text-left">
                Assign New Task
              </DialogTitle>
              <p className="text-sm text-gray-600 text-left">
                {repName && user?.role !== 'super_admin' ? `Creating task for ${repName}` : 'Create and assign a new task'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Title Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-semibold text-gray-700">Task Title *</Label>
            </div>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter a clear, descriptive task title"
              className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
            />
          </div>

          {/* Due Date Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <Label className="text-sm font-semibold text-gray-700">Due Date *</Label>
            </div>
            <Input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white"
            />
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <Label className="text-sm font-semibold text-gray-700">Description</Label>
            </div>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={4}
              placeholder="Provide detailed instructions and context for this task..."
              className="border-2 border-gray-200 focus:border-blue-400 bg-white resize-none"
            />
          </div>

          {/* Assignment Section - Only for Super Admin */}
          {user?.role === 'super_admin' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-purple-500" />
                <Label className="text-sm font-semibold text-gray-700">Assign To Sales Rep *</Label>
              </div>
              <Select onValueChange={(val) => setAssignedTo(Number(val))}>
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white">
                  <SelectValue placeholder="Select a sales representative" />
                </SelectTrigger>
                <SelectContent>
                  {salesReps.map((rep) => (
                    <SelectItem key={rep.id} value={rep.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{rep.name}</div>
                          <div className="text-xs text-gray-500">{rep.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Task Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Task Information</span>
            </div>
            <div className="space-y-1 text-xs text-blue-700">
              <p>• Tasks will be visible in the assigned rep's task center</p>
              <p>• Due dates help prioritize work and track deadlines</p>
              <p>• Detailed descriptions ensure clear expectations</p>
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
              onClick={handleCreate} 
              disabled={loading || !title || !dueDate}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Create Task
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
