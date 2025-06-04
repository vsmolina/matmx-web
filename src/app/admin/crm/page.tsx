'use client'

import { useEffect, useState } from 'react'
import CustomerTable from '@/components/CustomerTable'
import AdminGuard from '@/components/AdminGuard'

export default function CRMPage() {
  return (
    <AdminGuard allowedRoles={['super_admin', 'sales_rep'] }>
        <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Customer Relationship Management</h1>
        <CustomerTable />
        </div>
    </AdminGuard>
  )
}
