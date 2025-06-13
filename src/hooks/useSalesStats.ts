'use client'

import { useEffect, useState } from 'react'

interface SalesStats {
  totalQuotes: number
  conversionRate: number
  pendingOrders: number
  fulfilledOrders: number
}

export function useSalesStats() {
  const [stats, setStats] = useState<SalesStats>({
    totalQuotes: 0,
    conversionRate: 0,
    pendingOrders: 0,
    fulfilledOrders: 0
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('http://localhost:4000/api/sales/metrics', {
          credentials: 'include'
        })

        if (!res.ok) throw new Error('Failed to fetch stats')

        const result = await res.json()
        setStats(result)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
