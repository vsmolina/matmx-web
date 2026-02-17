// src/context/UserContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiCall } from '@/lib/api'

interface User {
  userId: number
  role: string
  name: string
  email?: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({ 
  user: null, 
  loading: true,
  refreshUser: async () => {}
})

export const useUser = () => useContext(UserContext)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const res = await apiCall('/api/me', {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    setLoading(true)
    await fetchUser()
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}
