'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { isAdmin as checkIsAdmin } from '@/lib/adminUtils'
import Link from 'next/link'

interface User {
  id: string
  username: string
  email: string
  role: string
  discordId?: string
  createdAt: string
  emailVerified: boolean
}

export default function RosterPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')

  useEffect(() => {
    if (session?.user && checkIsAdmin(session.user)) {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (response.ok) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ))
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center">
        <div className="text-sail-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session?.user || !checkIsAdmin(session.user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center">
        <div className="neo-brutal-box bg-sail-white p-8 text-center">
          <h1 className="static-red-gradient text-2xl font-bold mb-4">Access Denied</h1>
          <Link href="/" className="bg-brass hover:bg-brass-bright text-white px-6 py-3 rounded-md">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      if (sortBy === 'username') return a.username.localeCompare(b.username)
      if (sortBy === 'email') return a.email.localeCompare(b.email)
      if (sortBy === 'role') return a.role.localeCompare(b.role)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      {/* Header */}
      <div className="bg-navy-dark/50 backdrop-blur-sm border-b border-sail-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="static-red-gradient text-3xl font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                User Roster
              </h1>
              <p className="text-sail-white/70 mt-2" style={{fontFamily: 'Crimson Text, serif'}}>
                Manage all registered users
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-brass hover:bg-brass-bright text-white px-4 py-2 rounded-md font-semibold transition-all"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="neo-brutal-box bg-sail-white p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username or email..."
                className="w-full px-3 py-2 border border-navy-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brass"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-navy-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brass"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-navy-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brass"
              >
                <option value="createdAt">Join Date</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="neo-brutal-box bg-sail-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-navy-dark/20">
              <thead className="bg-navy-dark/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-dark uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-dark uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-dark uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-dark uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-dark/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-navy-dark/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-brass/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-brass">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-navy-dark">{user.username}</div>
                          {user.discordId && (
                            <div className="text-sm text-navy-dark/70">Discord Connected</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-dark">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="text-sm border border-navy-dark/20 rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.emailVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-dark">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-brass hover:text-brass-bright mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 neo-brutal-box bg-sail-white p-4">
          <div className="flex justify-between text-sm text-navy-dark">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
            <span>Total Users: {users.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
