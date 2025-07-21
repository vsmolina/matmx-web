'use client'

import AdminGuard from '@/components/AdminGuard'

export default function DocumentsPage() {
  return (
    <AdminGuard allowedRoles={['super_admin', 'admin', 'user']}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-6 shadow-lg md:px-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Documents</h1>
                <p className="text-purple-100 text-sm mt-1 md:text-base">Manage invoices, reports, and contracts</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4">
                <svg className="h-6 w-6 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="max-w-2xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            {/* Main Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-lg mb-8">
              <svg className="h-12 w-12 md:h-16 md:w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Title and Description */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Documents Coming Soon
            </h2>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}