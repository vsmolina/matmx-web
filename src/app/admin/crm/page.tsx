'use client'

import { useState } from 'react'
import AdminGuard from '@/components/AdminGuard'
import { useUser } from '@/context/UserContext'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { useDashboardDetails } from '@/hooks/useDashboardDetails'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import KPIChart from '@/components/KPIChart'
import CustomerTable from '@/components/CustomerTable'

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
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <AdminGuard allowedRoles={['super_admin', 'sales_rep']}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-[#003cc5]">
          Welcome back, {user?.name || '...'}!
        </h1>
        <div className='p-6'>
          <CustomerTable />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Open Tasks</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-[#003cc5]">
              {openTasks}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Customers</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-[#003cc5]">
              {assignedCustomers}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Interactions</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-[#003cc5]">
              {recentInteractions}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tasks + Recently Contacted Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {detailsLoading ? (
                <Skeleton className="h-24" />
              ) : upcomingTasks.length === 0 ? (
                <p className="text-muted-foreground">No tasks due soon.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <li key={task.id} className="text-sm">
                      <strong>{task.title}</strong> — Due {new Date(task.due_date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recently Contacted Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {detailsLoading ? (
                <Skeleton className="h-24" />
              ) : recentCustomers.length === 0 ? (
                <p className="text-muted-foreground">No recent contacts.</p>
              ) : (
                <ul className="space-y-2">
                  {recentCustomers.map((customer) => (
                    <li key={customer.id} className="text-sm">
                      <strong>{customer.name}</strong> — Last contacted{' '}
                      {new Date(customer.last_contacted_at).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <>
            <h2 className="text-xl font-semibold text-[#003cc5] mt-6">Admin Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Task Completion Rate</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Active Reps</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
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
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  )
}
