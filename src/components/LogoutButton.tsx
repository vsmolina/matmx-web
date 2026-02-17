'use client'

import { apiCall } from '@/lib/api'

export default function LogoutButton() {
  async function handleLogout() {
    await apiCall('/api/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
    >
      Log Out
    </button>
  )
}
