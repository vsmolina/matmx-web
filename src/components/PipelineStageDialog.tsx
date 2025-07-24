'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { Target, TrendingUp, FileText, CheckCircle, Info, ArrowRight } from 'lucide-react'

const STAGES = ['lead', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost']

export default function PipelineStageDialog({ customerId, open, onOpenChange, onSuccess }: any) {
  const [stage, setStage] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/crm/${customerId}/pipeline`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, comment })
      })
      if (!res.ok) throw new Error('Failed to update pipeline')
      toast.success('Stage updated')
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStageColor = (stageName: string) => {
    const colors = {
      lead: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      qualified: 'bg-blue-100 text-blue-800 border-blue-200',
      proposal_sent: 'bg-purple-100 text-purple-800 border-purple-200',
      negotiation: 'bg-orange-100 text-orange-800 border-orange-200',
      won: 'bg-green-100 text-green-800 border-green-200',
      lost: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[stageName as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const isFormValid = stage.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 text-left">
                Update Sales Pipeline Stage
              </DialogTitle>
              <p className="text-sm text-gray-600 text-left">
                Move customer through the sales process
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stage Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <Label className="text-sm font-semibold text-gray-700">Sales Stage *</Label>
            </div>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-400 bg-white">
                <SelectValue placeholder="Select the current sales stage" />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map(s => (
                  <SelectItem key={s} value={s}>
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageColor(s)}`}>
                          {s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
                        </div>
                      </div>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stage && (
              <div className="mt-2">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStageColor(stage)}`}>
                  Selected: {stage.replace('_', ' ').charAt(0).toUpperCase() + stage.replace('_', ' ').slice(1)}
                </div>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-500" />
              <Label className="text-sm font-semibold text-gray-700">Stage Update Notes</Label>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Add context about this stage change. What prompted this update? What are the next steps? Any important details..."
              className="border-2 border-gray-200 focus:border-blue-400 bg-white resize-none"
            />
          </div>

          {/* Pipeline Info Card */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Pipeline Management</span>
            </div>
            <div className="space-y-1 text-xs text-purple-700">
              <p>• Stage changes are tracked with timestamps and user information</p>
              <p>• Comments help team members understand the progression</p>
              <p>• Pipeline history is visible to all assigned representatives</p>
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
              onClick={submit} 
              disabled={loading || !isFormValid}
              className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Update Stage
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
