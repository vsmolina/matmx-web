'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { UserPlus, UserX, Edit, RotateCcw, Users, Shield, Eye, EyeOff } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  active: boolean
  last_login: string | null
}

export default function ManageUsersPage() {
  const { user: currentUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  console.log('Current user in ManageUsersPage:', currentUser)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('sales_rep')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)


  const router = useRouter()

  useEffect(() => {
    fetchUsers()

    // Fetch current user ID
    fetch('http://localhost:4000/api/me', {
        credentials: 'include',
    })
        .then((res) => res.json())
        .then((data) => setCurrentUserId(data.user?.userId || null))
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      console.log('Fetching users...')
      const res = await fetch('http://localhost:4000/api/admin/users?page=1&limit=50&sort=name&order=asc', {
        credentials: 'include',
      })
      console.log('Response status:', res.status)
      if (!res.ok) {
        const errorData = await res.json()
        console.log('Error response:', errorData)
        console.log('Full error details:', JSON.stringify(errorData, null, 2))
        throw new Error('Unauthorized')
      }
      const data = await res.json()
      setUsers(data.users)
    } catch (error) {
      console.log('Fetch error:', error)
      toast.error('Access denied')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return
    const res = await fetch(`http://localhost:4000/api/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) {
      toast.success('User deleted')
      fetchUsers()
    } else {
      toast.error('Failed to delete user')
    }
  }

  async function resetPassword() {
    const res = await fetch(`http://localhost:4000/api/admin/users/${selectedUser?.id}/password`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    if (res.ok) {
      toast.success('Password reset')
      setResetModalOpen(false)
      setNewPassword('')
    } else {
      toast.error('Failed to reset password')
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('http://localhost:4000/api/admin/users', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    if (res.ok) {
      toast.success('User created')
      setName('')
      setEmail('')
      setPassword('')
      setRole('')
      setCreateModalOpen(false)
      fetchUsers()
    } else {
      toast.error('Failed to create user')
    }
  }

  async function updateUser() {
    const res = await fetch(`http://localhost:4000/api/admin/users/${selectedUser?.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: selectedUser?.name,
        email: selectedUser?.email,
        role: selectedUser?.role,
      }),
    })
    if (res.ok) {
      toast.success('User updated')
      setEditModalOpen(false)
      fetchUsers()
    } else {
      toast.error('Failed to update user')
    }
  }

  async function toggleActive(user: User) {
    const endpoint = user.active ? 'deactivate' : 'activate'
    const res = await fetch(`http://localhost:4000/api/admin/users/${user.id}/${endpoint}`, {
      method: 'PATCH',
      credentials: 'include',
    })
    if (res.ok) {
      toast.success(`User ${user.active ? 'deactivated' : 'activated'}`)
      fetchUsers()
    } else {
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-6 shadow-lg md:px-6 md:py-8">
          <div className="w-full mx-auto">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Users className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">User Management</h1>
                <p className="text-indigo-100 text-sm mt-1 md:text-base">Loading users...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-6 shadow-lg md:px-6 md:py-8">
        <div className="w-full mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Users className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">User Management</h1>
                <p className="text-indigo-100 text-sm mt-1 md:text-base">Manage system users and permissions</p>
              </div>
            </div>
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-white text-indigo-700 hover:bg-gray-100 shadow-lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Role</span>
                  <p className="font-medium text-gray-900 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Login</span>
                  <p className="font-medium text-gray-900">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setSelectedUser(user); setEditModalOpen(true) }}
                  className="h-9"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setSelectedUser(user); setResetModalOpen(true) }}
                  className="h-9"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleActive(user)}
                  className="h-9"
                >
                  {user.active ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                  {user.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={user.id === currentUserId}
                  onClick={() => { setSelectedUser(user); setDeleteModalOpen(true) }}
                  className="h-9 disabled:opacity-50"
                >
                  <UserX className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { setSelectedUser(user); setEditModalOpen(true) }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit user details</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { setSelectedUser(user); setResetModalOpen(true) }}
                              className="h-8 w-8 p-0"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reset password</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => toggleActive(user)}
                              className="h-8 w-8 p-0"
                            >
                              {user.active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.active ? 'Deactivate user' : 'Activate user'}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={user.id === currentUserId}
                              onClick={() => { setSelectedUser(user); setDeleteModalOpen(true) }}
                              className="h-8 w-8 p-0 disabled:opacity-50"
                            >
                              <UserX className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.id === currentUserId ? 'Cannot delete yourself' : 'Delete user'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
            <div className="mt-6">
              <Button onClick={() => setCreateModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg mx-auto m-4 rounded-2xl overflow-hidden p-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Create New User</DialogTitle>
                  <p className="text-indigo-100 text-sm mt-1">Add a new user to the system</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <form onSubmit={createUser} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Full Name
                  </Label>
                  <Input 
                    id="name"
                    type="text" 
                    placeholder="Enter full name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="Enter email address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                    Password
                  </Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="Enter secure password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700 mb-2 block">
                    User Role
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-xl">
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_rep">Sales Representative</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                      <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                      <SelectItem value="warehouse_worker">Warehouse Worker</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="max-w-lg mx-auto m-4 rounded-2xl overflow-hidden p-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Reset Password</DialogTitle>
                  <p className="text-amber-100 text-sm mt-1">
                    Reset password for {selectedUser?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-600 rounded-full p-2 flex-shrink-0">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900 text-sm">Security Notice</h4>
                    <p className="text-amber-800 text-sm mt-1">
                      The user will be required to change this password on their next login.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                  New Password
                </Label>
                <Input 
                  id="newPassword"
                  type="password" 
                  placeholder="Enter new password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 border-2 border-gray-200 focus:border-amber-500 rounded-xl"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setResetModalOpen(false)}
                  className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={resetPassword}
                  className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 rounded-xl"
                >
                  Reset Password
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg mx-auto m-4 rounded-2xl overflow-hidden p-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Edit className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
                  <p className="text-blue-100 text-sm mt-1">
                    Update user information and permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="editName" className="text-sm font-medium text-gray-700 mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="editName"
                  type="text"
                  value={selectedUser?.name || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser!, name: e.target.value })}
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              
              <div>
                <Label htmlFor="editEmail" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={selectedUser?.email || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser!, email: e.target.value })}
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              
              <div>
                <Label htmlFor="editRole" className="text-sm font-medium text-gray-700 mb-2 block">
                  User Role
                </Label>
                <Select 
                  value={selectedUser?.role || 'sales_rep'} 
                  onValueChange={(value) => setSelectedUser({ ...selectedUser!, role: value })}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_rep">Sales Representative</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                    <SelectItem value="warehouse_worker">Warehouse Worker</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={updateUser}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-lg mx-auto m-4 rounded-2xl overflow-hidden p-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <UserX className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Delete User</DialogTitle>
                  <p className="text-red-100 text-sm mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 rounded-full p-2 flex-shrink-0">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-900 text-sm">Warning</h4>
                    <p className="text-red-800 text-sm mt-1">
                      You are about to permanently delete the user account for{' '}
                      <span className="font-semibold">{selectedUser?.name}</span>.
                      This will remove all their access and cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Name:</span> {selectedUser?.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedUser?.email}</p>
                  <p><span className="font-medium">Role:</span> {selectedUser?.role}</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    const res = await fetch(`http://localhost:4000/api/admin/users/${selectedUser?.id}`, {
                      method: 'DELETE',
                      credentials: 'include',
                    })
                    if (res.ok) {
                      toast.success('User deleted')
                      setDeleteModalOpen(false)
                      fetchUsers()
                    } else {
                      toast.error('Failed to delete user')
                    }
                  }}
                  className="flex-1 h-12 rounded-xl"
                >
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  )
}
