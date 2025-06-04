'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

interface User {
  id: number
  name: string
  email: string
  role: string
  active: boolean
  last_login: string | null
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
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
      const res = await fetch('http://localhost:4000/api/admin/users', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Unauthorized')
      const data = await res.json()
      setUsers(data.users)
    } catch {
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

  if (loading) return <div className="p-6">Loading users...</div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100 text-sm">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Last Login</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="text-sm">
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.role}</td>
              <td className="p-2 border">
                <span className={`px-2 py-1 rounded text-white text-xs font-medium ${user.active ? 'bg-green-600' : 'bg-gray-500'}`}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-2 border">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
              <td className="p-2 border space-x-2">
                <Button variant="outline" onClick={() => { setSelectedUser(user); setResetModalOpen(true) }}>Reset</Button>
                <Button variant="outline" onClick={() => { setSelectedUser(user); setEditModalOpen(true) }}>Edit</Button>
                <Button variant="outline" onClick={() => toggleActive(user)}>{user.active ? 'Deactivate' : 'Activate'}</Button>
                <Button variant="outline" disabled={user.id === currentUserId} onClick={() => { setSelectedUser(user); setDeleteModalOpen(true) }}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6">
        <Button onClick={() => setCreateModalOpen(true)}>+ Create New User</Button>
      </div>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <form onSubmit={createUser} className="space-y-4">
            <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sales_rep">Sales Rep</SelectItem>
                <SelectItem value="accountant">Accountant</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value='inventory_manager'>Inventory Manager</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <DialogFooter><Button onClick={resetPassword}>Reset</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <Input
            type="text"
            value={selectedUser?.name || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser!, name: e.target.value })}
          />
          <Input
            type="email"
            value={selectedUser?.email || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser!, email: e.target.value })}
          />
          <Select value={selectedUser?.role || 'sales_rep'} onValueChange={(value) => setSelectedUser({ ...selectedUser!, role: value })}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sales_rep">Sales Rep</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter><Button onClick={updateUser}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete <strong>{selectedUser?.name}</strong>?</p>
            <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
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
                    >
                    Delete
                </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    </div>
  )
}
