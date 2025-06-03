'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'

interface User {
  userId: number
  role: string
  name: string
  email?: string
}

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('http://localhost:4000/api/me', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    const res = await fetch('http://localhost:4000/api/logout', {
      method: 'POST',
      credentials: 'include',
    })

    if (res.ok) {
      router.push('/')
    }
  }

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/products', label: 'Products' },
  ]

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
      <div className="flex gap-6 items-center text-sm font-medium">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'hover:underline',
              pathname === link.href ? 'text-blue-600 font-semibold' : 'text-gray-700'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm">
        {user && (
          <span className="text-gray-600">
            {user && (
                <span className="text-gray-600">
                    Hi {user.name?.split(' ')[0] ?? 'Admin'}
                </span>
            )}
          </span>
        )}
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  )
}
