'use client'

import { useState, useCallback, useRef } from 'react'
import AdminGuard from '@/components/AdminGuard'
import { useUser } from '@/context/UserContext'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { useDashboardDetails } from '@/hooks/useDashboardDetails'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import KPIChart from '@/components/KPIChart'
import CustomerTable from '@/components/CustomerTable'
import { 
  CheckCircle, 
  Users, 
  MessageCircle, 
  Calendar,
  UserCheck,
  TrendingUp,
  Award
} from 'lucide-react'

export default function CRMPage() {
  const { user, loading: userLoading } = useUser()
  const {
    openTasks,
    assignedCustomers,
    recentInteractions,
    loading: summaryLoading
  } = useDashboardSummary()

  const {
    tasks: upcomingTasks,
    customers: recentCustomers,
    taskStats,
    loading: detailsLoading
  } = useDashboardDetails()

  const isSuperAdmin = user?.role === 'super_admin'

  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAssignTask, setShowAssignTask] = useState(false)

  if (userLoading || summaryLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <AdminGuard allowedRoles={['super_admin', 'sales_rep']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || '...'}!
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                Manage your customer relationships and track your success
              </p>
            </div>
          </div>

          {/* Customer Table Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <CustomerTable />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Open Tasks Card */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                  Active
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Open Tasks</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{openTasks}</p>
                <p className="text-xs text-gray-600">Tasks awaiting completion</p>
              </div>
            </div>

            {/* Assigned Customers Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                  Assigned
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Assigned Customers</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{assignedCustomers}</p>
                <p className="text-xs text-gray-600">Under your management</p>
              </div>
            </div>

            {/* Recent Interactions Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  Recent
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-700">Recent Interactions</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{recentInteractions}</p>
                <p className="text-xs text-gray-600">This week's engagements</p>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks + Recently Contacted Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100 p-3 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
                </div>
              </div>
              <div className="p-3 sm:p-6">
                {detailsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : upcomingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No tasks due soon</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{task.title}</p>
                          <p className="text-xs text-gray-600">Due {new Date(task.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recently Contacted Customers */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100 p-3 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recently Contacted</h3>
                </div>
              </div>
              <div className="p-3 sm:p-6">
                {detailsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : recentCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No recent contacts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{customer.name}</p>
                          <p className="text-xs text-gray-600">Last contacted {new Date(customer.last_contacted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Super Admin Section */}
          {isSuperAdmin && (
            <>
              <div className="flex items-center gap-3 mt-6 sm:mt-8 mb-4 sm:mb-6">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Admin Insights</h2>
                  <p className="text-gray-600 text-xs sm:text-sm">Performance analytics and team overview</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                {/* Task Completion Rate */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 p-3 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Task Completion Rate</h3>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6">
                    {detailsLoading ? (
                      <Skeleton className="h-40" />
                    ) : (
                      <KPIChart
                        title="Task Completion Rate (%)"
                        data={taskStats.completionRates.map((stat) => ({
                          name: stat.rep,
                          value: stat.rate
                        }))}
                      />
                    )}
                  </div>
                </div>

                {/* Top Active Reps */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 p-3 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Active Reps</h3>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6">
                    {detailsLoading ? (
                      <Skeleton className="h-40" />
                    ) : (
                      <KPIChart
                        title="Interactions Logged"
                        data={taskStats.activeReps.map((rep) => ({
                          name: rep.rep,
                          value: rep.count
                        }))}
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}
