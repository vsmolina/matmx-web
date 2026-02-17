'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiCall } from '@/lib/api'
import { Calendar, User, Package, FileText, Clock, AlertCircle } from 'lucide-react'

interface AnodizingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export default function AnodizingDetailsModal({
  isOpen,
  onClose,
  jobId
}: AnodizingDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [auditLog, setAuditLog] = useState<any[]>([])

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails()
    }
  }, [isOpen, jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const response = await apiCall(`/api/anodizing/${jobId}`)
      const data = await response.json()
      
      if (data.success) {
        setJob(data.job)
        setAuditLog(data.auditLog || [])
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString()
  }

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString()
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!job) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Job #{job.job_number}</span>
            <div className="flex gap-2">
              <Badge className={statusColors[job.status]}>
                {job.status.replace('_', ' ')}
              </Badge>
              <Badge className={priorityColors[job.priority]}>
                {job.priority}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-600">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{job.customer_name || 'No customer assigned'}</span>
                  </div>
                  {job.customer_company && (
                    <div className="text-sm text-gray-600 ml-6">{job.customer_company}</div>
                  )}
                  {job.customer_email && (
                    <div className="text-sm text-gray-600 ml-6">{job.customer_email}</div>
                  )}
                  {job.customer_phone && (
                    <div className="text-sm text-gray-600 ml-6">{job.customer_phone}</div>
                  )}
                </div>

                <h3 className="font-semibold text-sm text-gray-600 mt-4">Product Information</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{job.product_name || 'No product assigned'}</span>
                  </div>
                  {job.product_sku && (
                    <div className="text-sm text-gray-600 ml-6">SKU: {job.product_sku}</div>
                  )}
                  <div className="text-sm text-gray-600 ml-6">Quantity: {job.quantity}</div>
                </div>

                {(job.quote_number || job.order_number) && (
                  <>
                    <h3 className="font-semibold text-sm text-gray-600 mt-4">Related Documents</h3>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {job.quote_number && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Quote: {job.quote_number}</span>
                        </div>
                      )}
                      {job.order_number && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Order: {job.order_number}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-600">Timeline</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div className="text-sm">
                      <span className="font-medium">Created:</span> {formatDateTime(job.created_at)}
                    </div>
                  </div>
                  {job.received_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="text-sm">
                        <span className="font-medium">Received:</span> {formatDate(job.received_date)}
                      </div>
                    </div>
                  )}
                  {job.start_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="text-sm">
                        <span className="font-medium">Started:</span> {formatDate(job.start_date)}
                      </div>
                    </div>
                  )}
                  {job.completion_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="text-sm">
                        <span className="font-medium">Completed:</span> {formatDate(job.completion_date)}
                      </div>
                    </div>
                  )}
                  {job.delivery_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="text-sm">
                        <span className="font-medium">Delivered:</span> {formatDate(job.delivery_date)}
                      </div>
                    </div>
                  )}
                  {job.estimated_completion && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <div className="text-sm">
                        <span className="font-medium">Est. Completion:</span> {formatDate(job.estimated_completion)}
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-sm text-gray-600 mt-4">Created/Updated By</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {job.created_by_name && (
                    <div className="text-sm">
                      <span className="font-medium">Created by:</span> {job.created_by_name}
                    </div>
                  )}
                  {job.updated_by_name && (
                    <div className="text-sm">
                      <span className="font-medium">Last updated by:</span> {job.updated_by_name}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Last updated:</span> {formatDateTime(job.updated_at)}
                  </div>
                </div>
              </div>
            </div>

            {(job.notes || job.special_instructions || job.internal_notes) && (
              <div className="space-y-3 mt-4">
                {job.special_instructions && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600">Special Instructions</h3>
                    <div className="bg-yellow-50 rounded-lg p-3 mt-1">
                      <p className="text-sm whitespace-pre-wrap">{job.special_instructions}</p>
                    </div>
                  </div>
                )}
                {job.notes && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600">Customer Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-3 mt-1">
                      <p className="text-sm whitespace-pre-wrap">{job.notes}</p>
                    </div>
                  </div>
                )}
                {job.internal_notes && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600">Internal Notes</h3>
                    <div className="bg-blue-50 rounded-lg p-3 mt-1">
                      <p className="text-sm whitespace-pre-wrap">{job.internal_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="specifications" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Anodizing Details</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-600">Type</dt>
                      <dd className="font-medium">{job.anodizing_type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Color</dt>
                      <dd className="font-medium">{job.color || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Thickness</dt>
                      <dd className="font-medium">{job.thickness || '-'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Finish Details</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-600">Finish Type</dt>
                      <dd className="font-medium">{job.finish_type || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Surface Area</dt>
                      <dd className="font-medium">
                        {job.surface_area_sqft ? `${job.surface_area_sqft} sq ft` : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Quantity</dt>
                      <dd className="font-medium">{job.quantity} pieces</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {auditLog.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No audit history available
              </div>
            ) : (
              <div className="space-y-2">
                {auditLog.map((entry, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-sm">{entry.action}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          by {entry.user_name || 'System'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(entry.changed_at)}
                      </span>
                    </div>
                    {entry.action === 'UPDATE' && entry.old_values && entry.new_values && (
                      <div className="mt-2 text-xs text-gray-600">
                        Changes made to the job
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}