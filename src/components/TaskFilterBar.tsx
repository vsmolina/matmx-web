'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

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
    <div className="flex flex-wrap gap-4 mb-4 items-center border p-4 rounded-md bg-white shadow-sm">
      <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-600">Customer Name</label>
        <Input
          value={localFilters.customerName}
          onChange={(e) => handleUpdate('customerName', e.target.value)}
          placeholder="Search customer"
          className="w-48"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-600">Status</label>
        <Select
          value={localFilters.status}
          onValueChange={(val) => handleUpdate('status', val)}
        >
          <SelectTrigger className="w-40">
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

      <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-600">Due Date</label>
        <Select
          value={localFilters.due}
          onValueChange={(val) => handleUpdate('due', val)}
        >
          <SelectTrigger className="w-40">
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
  )
}
