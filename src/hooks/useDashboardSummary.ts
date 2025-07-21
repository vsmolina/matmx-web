'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/context/UserContext'

export function useDashboardSummary() {
  const { user } = useUser()
  const [data, setData] = useState({
    openTasks: 0,
    assignedCustomers: 0,
    recentInteractions: 0,
  })
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   if (!user?.id) return

  //   const fetchData = async () => {
  //       try {
  //           const [tasksRes, customersRes] = await Promise.all([
  //           fetch('http://localhost:4000/api/crm/tasks', { credentials: 'include' }),
  //           fetch('http://localhost:4000/api/crm', { credentials: 'include' })
  //           ])

  //           // Check for rate limiting
  //           if (tasksRes.status === 429 || customersRes.status === 429) {
  //               console.warn('Rate limited - skipping dashboard data fetch')
  //               return
  //           }

  //           if (!tasksRes.ok || !customersRes.ok) {
  //               console.error('API request failed:', { 
  //                   tasksStatus: tasksRes.status, 
  //                   customersStatus: customersRes.status 
  //               })
  //               return
  //           }

  //           const tasksData = await tasksRes.json()
  //           const customersData = await customersRes.json()

  //           // Check if API responses are valid
  //           if (!tasksData || !customersData) {
  //               console.error('Invalid API response:', { tasksData, customersData })
  //               return
  //           }

  //           const customers = customersData.customers || []

  //           // Skip interaction fetching to avoid rate limits for now
  //           // This can be optimized later with a single bulk API endpoint
  //           setData({
  //           openTasks: tasksData.tasks?.length || 0,
  //           assignedCustomers: customers.length,
  //           recentInteractions: 0, // Temporarily disabled to prevent rate limiting
  //           })
  //       } catch (err) {
  //           console.error('Failed to load dashboard summary', err)
  //       } finally {
  //           setLoading(false)
  //       }
  //   }

  //   fetchData()
  // }, [user?.id])

  return { ...data, loading }
}
