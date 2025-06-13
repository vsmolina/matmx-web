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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
        try {
            const [tasksRes, customersRes] = await Promise.all([
            fetch('http://localhost:4000/api/crm/tasks', { credentials: 'include' }),
            fetch('http://localhost:4000/api/crm', { credentials: 'include' })
            ])

            const tasksData = await tasksRes.json()
            const customersData = await customersRes.json()

            // Now fetch interaction logs from all assigned customers
            const customerIds = customersData.customers.map((c: any) => c.id)

            const interactionCounts = await Promise.all(
            customerIds.map(async (id: number) => {
                const res = await fetch(`http://localhost:4000/api/crm/${id}/interactions`, {
                credentials: 'include'
                })
                if (!res.ok) return []
                const json = await res.json()
                return json.logs.filter((i: any) => {
                const logDate = new Date(i.created_at)
                const oneWeekAgo = new Date()
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                return logDate >= oneWeekAgo
                })
            })
            )

            const recentInteractionCount = interactionCounts.flat().length

            setData({
            openTasks: tasksData.tasks.length,
            assignedCustomers: customersData.customers.length,
            recentInteractions: recentInteractionCount,
            })
        } catch (err) {
            console.error('Failed to load dashboard summary', err)
        } finally {
            setLoading(false)
        }
    }


    fetchData()
  }, [user])

  return { ...data, loading }
}
