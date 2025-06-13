'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { Menu } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    const res = await fetch('http://localhost:4000/api/logout', {
      method: 'POST',
      credentials: 'include',
    })

    if (res.ok) {
      router.push('/')
    }
  }

  if (loading || !user) return null

  const roleLinks = {
    super_admin: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/crm', label: 'Customers' },
      { href: '/admin/sales', label: 'Quotes & Orders' },
    ],
    inventory_manager: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/products', label: 'Products' },
    ],
    accountant: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/sales', label: 'Quotes & Orders' },
    ],
    sales_rep: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/crm', label: 'Customers' },
      { href: '/admin/sales', label: 'Quotes & Orders' },
    ],
  }

  const links = roleLinks[user.role] || []

  // Automatically close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="sm:hidden"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
          <span className="hidden sm:inline-block font-bold text-lg">Admin Panel</span>
        </div>

        <div className="hidden sm:flex gap-6 items-center text-sm font-medium">
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
          <span className="text-gray-600">
            Hi {user.name?.split(' ')[0] ?? 'Admin'}
          </span>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Animated mobile menu */}
      <div
        ref={menuRef}
        className={clsx(
          'sm:hidden overflow-hidden transition-all duration-300 ease-in-out',
          menuOpen ? 'max-h-[500px] mt-4' : 'max-h-0'
        )}
      >
        <div className="flex flex-col gap-2 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'px-2 py-1 rounded hover:bg-gray-100',
                pathname === link.href ? 'text-blue-600 font-semibold' : 'text-gray-700'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
