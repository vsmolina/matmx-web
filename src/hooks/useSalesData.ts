'use client'
import { getApiBaseUrl } from '@/lib/api'

import { useEffect, useState } from 'react'
import { apiCall } from '@/lib/api'

type TabType = 'quotes' | 'orders'

interface SalesFilter {
  customer?: string
  status?: string
  repId?: string
}

export function useSalesData(tab: TabType, filter: SalesFilter, reloadKey: number) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()

        if (filter.customer) params.append('customer', filter.customer)
        if (filter.status && filter.status !== 'all') {
          params.append('status', filter.status)
        }
        if (filter.repId && filter.repId !== 'all') {
          params.append('rep_id', filter.repId)
        }

        const res = await fetch(`${getApiBaseUrl()}/api/sales/${tab}?` + params.toString(), {
          credentials: 'include',
          signal: controller.signal
        })

        if (!res.ok) throw new Error(`Failed to fetch ${tab}`)
        const result = await res.json()
        setData(result)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unknown error')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [tab, filter.customer, filter.status, filter.repId, reloadKey]) // ← added reloadKey

  return { data, loading, error }
}
