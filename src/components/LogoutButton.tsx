'use client'

export default function LogoutButton() {
  async function handleLogout() {
    await fetch('http://localhost:4000/api/logout', {
      method: 'POST',
      credentials: 'include',
    })
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
