'use client'

import { UserProvider } from '@/context/UserContext'

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}