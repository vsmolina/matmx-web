'use client'

import { useUser } from '@/context/UserContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useEffect, useState, useRef } from 'react'

interface SalesHeaderProps {
  filter: {
    customer: string
    status: string
    repId: string
    startDate?: string
    endDate?: string
  }
  onFilterChange: (newFilter: SalesHeaderProps['filter']) => void
}

export default function SalesHeader({ filter, onFilterChange }: SalesHeaderProps) {
  const { user } = useUser()
  if (!user) return null

  const [localFilter, setLocalFilter] = useState(filter)
  const [reps, setReps] = useState<{ id: number; name: string }[]>([])
  const [customerSuggestions, setCustomerSuggestions] = useState<{ id: number; name: string }[]>([])
  const [allCustomers, setAllCustomers] = useState<{ id: number; name: string }[]>([])
  const [activePreset, setActivePreset] = useState('last_30_days')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch sales reps
  useEffect(() => {
    if (user.role === 'super_admin') {
      fetch('http://localhost:4000/api/users/roles?role=sales_rep', { credentials: 'include' })
        .then(res => res.json())
        .then(setReps)
        .catch(() => setReps([]))
    }
  }, [user.role])

  // Fetch all customers on mount
  useEffect(() => {
    fetch('http://localhost:4000/api/crm/', { credentials: 'include' })
      .then(res => res.json())
      .then(setAllCustomers)
      .catch(() => setAllCustomers([]))
  }, [])

  // Dynamic search if user types 2+ characters
  useEffect(() => {
    const delay = setTimeout(() => {
      if (localFilter.customer.length < 2) {
        setCustomerSuggestions([])
        return
      }

      fetch(`http://localhost:4000/api/crm/search?search=${encodeURIComponent(localFilter.customer)}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(setCustomerSuggestions)
        .catch(() => setCustomerSuggestions([]))
    }, 250)

    return () => clearTimeout(delay)
  }, [localFilter.customer])

  // Default to last 30 days on mount
  useEffect(() => {
    if (!localFilter.startDate && !localFilter.endDate) {
      applyDatePreset('last_30_days')
    }
  }, [])

  const applyDatePreset = (label: string) => {
    const today = new Date()
    const start = new Date(today)
    const end = new Date(today)

    switch (label) {
      case 'today':
        break
      case 'last_7_days':
        start.setDate(today.getDate() - 6)
        break
      case 'last_30_days':
        start.setDate(today.getDate() - 29)
        break
      case 'this_month':
        start.setDate(1)
        break
      case 'last_month':
        start.setMonth(today.getMonth() - 1)
        start.setDate(1)
        end.setMonth(today.getMonth() - 1)
        end.setDate(new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate())
        break
    }

    const format = (d: Date) => d.toISOString().split('T')[0]
    handleChange('startDate', format(start))
    handleChange('endDate', format(end))
    setActivePreset(label)
  }

  const handleChange = (field: keyof typeof localFilter, value: string) => {
    const updated = { ...localFilter, [field]: value }
    setLocalFilter(updated)
    onFilterChange(updated)
  }

  const filteredList = localFilter.customer.length < 2
    ? allCustomers
    : customerSuggestions

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end justify-between bg-white p-4 rounded-xl shadow mb-6 relative">
      {/* Customer autocomplete */}
      <div className="flex flex-col relative">
        <Label htmlFor="customer">Customer</Label>
        <Input
          id="customer"
          placeholder="Search by customer name"
          value={localFilter.customer}
          onChange={(e) => {
            handleChange('customer', e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          autoComplete="off"
        />
        {showDropdown && filteredList.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md z-10 mt-1 max-h-40 overflow-y-auto text-sm">
            {filteredList.map((c) => (
              <li
                key={c.id}
                className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleChange('customer', c.name)
                  setShowDropdown(false)
                }}
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status filter */}
      <div className="flex flex-col">
        <Label htmlFor="status">Status</Label>
        <Select
          value={localFilter.status}
          onValueChange={(v) => handleChange('status', v)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales rep filter */}
      {user.role === 'super_admin' && (
        <div className="flex flex-col">
          <Label htmlFor="rep">Sales Rep</Label>
          <Select
            value={localFilter.repId}
            onValueChange={(v) => handleChange('repId', v)}
          >
            <SelectTrigger id="rep">
              <SelectValue placeholder="All reps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {reps.map(rep => (
                <SelectItem key={rep.id} value={String(rep.id)}>
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date Range: Start Date */}
      <div className="flex flex-col">
        <Label htmlFor="start-date">Start Date</Label>
        <Input
          id="start-date"
          type="date"
          value={localFilter.startDate || ''}
          onChange={(e) => {
            setActivePreset('')
            handleChange('startDate', e.target.value)
          }}
        />
      </div>

      {/* Date Range: End Date */}
      <div className="flex flex-col">
        <Label htmlFor="end-date">End Date</Label>
        <Input
          id="end-date"
          type="date"
          value={localFilter.endDate || ''}
          onChange={(e) => {
            setActivePreset('')
            handleChange('endDate', e.target.value)
          }}
        />
      </div>

      {/* Quick Presets */}
      <div className="flex flex-col">
        <Label htmlFor="preset">Quick Range</Label>
        <Select
          value={activePreset}
          onValueChange={applyDatePreset}
        >
          <SelectTrigger id="preset">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
