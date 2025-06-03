'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const toastId = toast.loading('Logging in...')

    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        toast.success('Login successful', { id: toastId })
        router.push('/admin')
      } else {
        const data = await res.json()
        setError(data.error || 'Login failed')
        toast.error('Login failed', { id: toastId })
      }
    } catch (err) {
      setError('Server error')
      toast.error('Server error', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Admin Login</h2>

        <label className="block mb-2 text-sm font-medium">
          Email
          <input
            type="email"
            className="mt-1 block w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4 text-sm font-medium">
          Password
          <input
            type="password"
            className="mt-1 block w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full mt-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to Home
        </button>
      </form>
    </div>
  )
}
