'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiCall } from '@/lib/api'

export default function AdminLoginPage() {
  const router = useRouter()
  const { user, loading: userLoading, refreshUser } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Redirect to admin if already logged in
  useEffect(() => {
    if (!userLoading && user) {
      router.replace('/admin')
    }
  }, [user, userLoading, router])

  // Force refresh user context on mount to ensure we have fresh data
  useEffect(() => {
    refreshUser()
  }, [])

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl mb-4 border border-white/10">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-300 text-lg font-medium">Authenticating session...</p>
        </div>
      </div>
    )
  }

  // Don't show login form if user is already logged in
  if (user) {
    // Show a brief loading state while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl mb-4 border border-white/10">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-300 text-lg font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const toastId = toast.loading('Logging in...')

    try {
      const res = await apiCall('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        toast.success('Login successful', { id: toastId })
        // Refresh user context with latest user data
        await refreshUser()
        router.push('/admin')
      } else {
        const data = await res.json()
        // Ensure error is always a string, not an object
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Login failed'
        setError(errorMessage)
        toast.error(errorMessage, { id: toastId })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Server error'
      setError(errorMessage)
      toast.error(errorMessage, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Desktop Only */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12 xl:px-20">
          <div className="max-w-lg">
            {/* Logo Section */}
            <div className="flex items-center gap-4 mb-12">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">MATMX LLC</h1>
              </div>
            </div>

            {/* Welcome Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Secure access to your business operations. Manage inventory, customers, sales, and more with enterprise-grade security.
              </p>
              
              <div className="flex items-center gap-3 text-slate-400">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-sm">256-bit SSL encryption protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">MatMX LLC</h1>
              <p className="text-slate-400">Administrator Portal</p>
            </div>

            {/* Login Card */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl lg:rounded-2xl border border-white/10 shadow-2xl p-8 lg:p-6">
              <div className="mb-6 lg:mb-8">
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">Sign In</h3>
                <p className="text-slate-400 text-sm lg:text-base">Access your administrative dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200 font-medium text-sm">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@matmx.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 lg:h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:bg-white/10 transition-all rounded-2xl lg:rounded-xl pl-4 pr-12"
                    />
                    <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200 font-medium text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 lg:h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:bg-white/10 transition-all rounded-2xl lg:rounded-xl pl-4 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl lg:rounded-xl p-4">
                    <div className="flex items-start gap-3 text-red-300">
                      <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 lg:h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl lg:rounded-xl shadow-lg transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 lg:mt-8 space-y-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-slate-400 hover:text-white hover:bg-white/5 transition-colors rounded-2xl lg:rounded-xl"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Website
              </Button>
              
              <div className="text-xs text-slate-500">
                <p>Secure administrative access • All sessions monitored</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
