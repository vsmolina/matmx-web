'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

export default function TaskFilterBar({
  filters,
  onChange
}: {
  filters: {
    customerName: string
    status: string
    due: string
  }
  onChange: (newFilters: { customerName: string; status: string; due: string }) => void
}) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleUpdate = (key: string, value: string) => {
    const updated = { ...localFilters, [key]: value }
    setLocalFilters(updated)
    onChange(updated)
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100 p-3 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Task Filters</h3>
        </div>
      </div>
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-700 mb-1 block">Customer Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={localFilters.customerName}
                onChange={(e) => handleUpdate('customerName', e.target.value)}
                placeholder="Search customer..."
                className="pl-10 h-9 border-2 border-gray-200 focus:border-blue-400 bg-white text-sm"
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
            <Select
              value={localFilters.status}
              onValueChange={(val) => handleUpdate('status', val)}
            >
              <SelectTrigger className="w-full sm:w-40 h-9 border-2 border-gray-200 focus:border-blue-400 bg-white text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-xs font-medium text-gray-700 mb-1 block">Due Date</label>
            <Select
              value={localFilters.due}
              onValueChange={(val) => handleUpdate('due', val)}
            >
              <SelectTrigger className="w-full sm:w-40 h-9 border-2 border-gray-200 focus:border-blue-400 bg-white text-sm">
                <SelectValue placeholder="Due filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="past">Past Due</SelectItem>
                <SelectItem value="next7">Next 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
