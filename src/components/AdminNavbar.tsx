'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { Menu, ChevronDown, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { apiCall } from '@/lib/api'

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, refreshUser } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    const res = await apiCall('/api/logout', {
      method: 'POST',
    })

    if (res.ok) {
      // Clear any cached user data by refreshing
      await refreshUser()
      // Redirect to login page
      router.push('/admin/login')
    }
  }

  // Automatically close menus on route change
  useEffect(() => {
    setMenuOpen(false)
    setProfileDropdownOpen(false)
  }, [pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (loading || !user) return null

  const roleLinks = {
    super_admin: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/anodizing', label: 'Anodizing' },
      { href: '/admin/vendors', label: 'Vendors' },
      { href: '/admin/crm', label: 'Customers' },
      { href: '/admin/sales', label: 'Quotes & Orders' },
      { href: '/admin/receiving', label: 'Receiving'},
      { href: '/admin/documents', label: 'Documents'},
    ],
    inventory_manager: [
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/anodizing', label: 'Anodizing' },
      { href: '/admin/vendors', label: 'Vendors' },
      { href: '/admin/receiving', label: 'Receiving'},
    ],
    accountant: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/sales', label: 'Quotes & Orders' },
    ],
    sales_rep: [
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/anodizing', label: 'Anodizing' },
      { href: '/admin/crm', label: 'Customers' },
      { href: '/admin/sales', label: 'Quotes & Orders' },
      { href: '/admin/receiving', label: 'Receiving'},
    ],
    warehouse_worker: [
      { href: '/admin/receiving', label: 'Receiving'},
      { href: '/admin/documents', label: 'Documents'},
    ]
  }

  const validRoles = ['super_admin', 'inventory_manager', 'accountant', 'sales_rep', 'warehouse_worker'] as const
  type Role = typeof validRoles[number]

  const role = user.role as Role
  const links = roleLinks[role] || []

  // Get current page label
  const getCurrentPageLabel = () => {
    const currentLink = links.find(link => link.href === pathname)
    return currentLink?.label || 'Dashboard'
  }

  return (
    <>
      <nav className="bg-white border-b shadow-sm px-4 py-3 relative z-50">
        {/* Desktop Layout */}
        <div className="hidden sm:flex justify-between items-center">
          <Link href="/admin">
            <img 
              src="/matmx_logo.png" 
              alt="MatMX Logo" 
              className="h-8 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>

          <div className="flex-1 mx-4 overflow-x-auto scrollbar-on-hover">
            <div className="flex gap-6 items-center justify-center text-sm font-medium min-w-max px-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'hover:underline whitespace-nowrap px-2 py-1 rounded transition-colors',
                    pathname === link.href 
                      ? 'text-blue-600 font-semibold bg-blue-50' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
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

        {/* Mobile Layout */}
        <div className="sm:hidden flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle Menu"
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>
            <span className="text-sm font-medium text-gray-900">
              {getCurrentPageLabel()}
            </span>
          </div>

          {/* Mobile Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img 
                src="/matmx_logo.png" 
                alt="MatMX Logo" 
                className="h-6 w-auto"
              />
              <ChevronDown className={clsx(
                "h-4 w-4 text-gray-500 transition-transform",
                profileDropdownOpen && "rotate-180"
              )} />
            </button>

            {/* Mobile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role?.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div 
        className={clsx(
          "sm:hidden fixed inset-0 z-40 bg-white transition-transform duration-300 ease-out",
          menuOpen ? "translate-y-0" : "-translate-y-full"
        )}
        onClick={() => setMenuOpen(false)}
      >
        {/* Menu dropdown */}
        <div 
          ref={menuRef}
          className="absolute top-[73px] left-0 right-0 bg-white border-b shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1 p-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  pathname === link.href 
                    ? 'text-blue-600 bg-blue-50 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
