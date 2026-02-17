'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { apiCall } from '@/lib/api'
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react'
import AnodizingModal from './AnodizingModal'
import AnodizingDetailsModal from './AnodizingDetailsModal'

interface AnodizingJob {
  id: number
  job_number: string
  customer_id: number | null
  customer_name: string | null
  customer_company: string | null
  product_id: number | null
  product_name: string | null
  product_sku: string | null
  anodizing_type: string
  color: string | null
  thickness: string | null
  finish_type: string | null
  quantity: number
  status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  estimated_completion: string | null
  created_at: string
  updated_at: string
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

export default function AnodizingTable() {
  const [jobs, setJobs] = useState<AnodizingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedJob, setSelectedJob] = useState<AnodizingJob | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchJobs()
  }, [page, searchTerm, statusFilter, priorityFilter])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        sort: 'created_at',
        order: 'DESC'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)

      const response = await apiCall(`/api/anodizing?${params}`)
      const data = await response.json()

      if (data.success) {
        setJobs(data.jobs)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching anodizing jobs:', error)
      toast.error('Failed to fetch anodizing jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedJob(null)
    setIsEditMode(false)
    setModalOpen(true)
  }

  const handleEdit = (job: AnodizingJob) => {
    setSelectedJob(job)
    setIsEditMode(true)
    setModalOpen(true)
  }

  const handleView = (job: AnodizingJob) => {
    setSelectedJob(job)
    setDetailsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this anodizing job?')) return

    try {
      const response = await apiCall(`/api/anodizing/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Anodizing job deleted successfully')
        fetchJobs()
      } else {
        throw new Error('Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete anodizing job')
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedJob(null)
  }

  const handleModalSave = () => {
    fetchJobs()
    handleModalClose()
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Anodizing Services</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Job
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by job number, customer, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Est. Completion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No anodizing jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.job_number}</TableCell>
                  <TableCell>
                    {job.customer_name || '-'}
                    {job.customer_company && (
                      <div className="text-xs text-gray-500">{job.customer_company}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.product_name || '-'}
                    {job.product_sku && (
                      <div className="text-xs text-gray-500">{job.product_sku}</div>
                    )}
                  </TableCell>
                  <TableCell>{job.anodizing_type}</TableCell>
                  <TableCell>{job.color || '-'}</TableCell>
                  <TableCell>{job.quantity}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[job.status]}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[job.priority]}>
                      {job.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(job.estimated_completion)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(job)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {modalOpen && (
        <AnodizingModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          job={selectedJob}
          isEditMode={isEditMode}
        />
      )}

      {detailsModalOpen && selectedJob && (
        <AnodizingDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          jobId={selectedJob.id}
        />
      )}
    </div>
  )
}