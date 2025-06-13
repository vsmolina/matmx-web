'use client'

import { useEffect, useState } from 'react'

export function useDashboardDetails() {
  const [tasks, setTasks] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [taskStats, setTaskStats] = useState({
    totalCreated: 0,
    completionRates: [] as { rep: string, rate: number }[],
    activeReps: [] as { rep: string, count: number }[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, customersRes] = await Promise.all([
          fetch('http://localhost:4000/api/crm/tasks', { credentials: 'include' }),
          fetch('http://localhost:4000/api/crm', { credentials: 'include' })
        ])

        const tasksData = await tasksRes.json()
        const customersData = await customersRes.json()

        const tasks = tasksData.tasks
        const customers = customersData.customers

        const createdLast30 = tasks.filter((t: any) => {
          const created = new Date(t.created_at)
          const daysAgo = new Date()
          daysAgo.setDate(daysAgo.getDate() - 30)
          return created >= daysAgo
        })

        const grouped = {} as Record<string, { completed: number, total: number }>
        for (const task of tasks) {
          const rep = task.assigned_to_name || 'Unassigned'
          grouped[rep] ??= { completed: 0, total: 0 }
          grouped[rep].total++
          if (task.status === 'completed') grouped[rep].completed++
        }

        const completionRates = Object.entries(grouped).map(([rep, val]) => ({
          rep,
          rate: val.total === 0 ? 0 : Math.round((val.completed / val.total) * 100)
        }))

        const interactionCounts: Record<string, number> = {}

        for (const customer of customers) {
          const res = await fetch(`http://localhost:4000/api/crm/${customer.id}/interactions`, {
            credentials: 'include'
          })
          if (!res.ok) continue
          const json = await res.json()
          for (const log of json.logs) {
            const rep = log.user_name
            interactionCounts[rep] = (interactionCounts[rep] || 0) + 1
          }
        }

        const activeReps = Object.entries(interactionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([rep, count]) => ({ rep, count }))

        // Upcoming task display
        const upcoming = tasks
          .filter((t: any) => t.status !== 'completed')
          .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

        const recentCustomers = customers
          .filter((c: any) => c.last_contacted_at)
          .sort((a: any, b: any) => new Date(b.last_contacted_at).getTime() - new Date(a.last_contacted_at).getTime())

        setTasks(upcoming.slice(0, 5))
        setCustomers(recentCustomers.slice(0, 5))
        setTaskStats({
          totalCreated: createdLast30.length,
          completionRates,
          activeReps
        })
      } catch (err) {
        console.error('Dashboard detail load failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { tasks, customers, taskStats, loading }
}
