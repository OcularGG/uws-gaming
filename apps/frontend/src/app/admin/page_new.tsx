'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import Link from 'next/link'

interface User {
  id: string
  username: string
  canCreatePortBattles: boolean
  _count: {
    portBattles: number
    signups: number
    strikes: number
  }
}

interface Clan {
  id: string
  name: string
  tag: string
  description?: string
  _count: {
    members: number
  }
}

interface Port {
  id: string
  name: string
  _count: {
    portBattles: number
  }
}

interface UserStrike {
  id: string
  reason: string
  createdAt: string
  user: {
    username: string
  }
  createdBy: {
    username: string
  }
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [clans, setClans] = useState<Clan[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [strikes, setStrikes] = useState<UserStrike[]>([])

  // Form states
  const [newClan, setNewClan] = useState({ name: '', tag: '', description: '' })
  const [newPort, setNewPort] = useState({ name: '' })
  const [newStrike, setNewStrike] = useState({ userId: '', reason: '' })

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session, activeTab])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin?type=${activeTab}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      switch (activeTab) {
        case 'users':
          setUsers(data.users || [])
          break
        case 'clans':
          setClans(data.clans || [])
          break
        case 'ports':
          setPorts(data.ports || [])
          break
        case 'strikes':
          setStrikes(data.strikes || [])
          break
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserPermission = async (userId: string, canCreatePortBattles: boolean) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          action: 'updatePermissions',
          userId,
          canCreatePortBattles: !canCreatePortBattles
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user permissions')
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error updating user permissions:', err)
      alert('Failed to update user permissions')
    }
  }

  const createClan = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'clan',
          ...newClan
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create clan')
      }

      setNewClan({ name: '', tag: '', description: '' })
      await fetchData()
    } catch (err) {
      console.error('Error creating clan:', err)
      alert('Failed to create clan')
    }
  }

  const createPort = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'port',
          ...newPort
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create port')
      }

      setNewPort({ name: '' })
      await fetchData()
    } catch (err) {
      console.error('Error creating port:', err)
      alert('Failed to create port')
    }
  }

  const createStrike = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'strike',
          ...newStrike
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create strike')
      }

      setNewStrike({ userId: '', reason: '' })
      await fetchData()
    } catch (err) {
      console.error('Error creating strike:', err)
      alert('Failed to create strike')
    }
  }

  const deleteItem = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          id
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}`)
      }

      await fetchData()
    } catch (err) {
      console.error(`Error deleting ${type}:`, err)
      alert(`Failed to delete ${type}`)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
          <p className="text-gray-600 mb-4">Please sign in to access the admin panel.</p>
          <Link href="/api/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Link href="/port-battles" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          Back to Port Battles
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: 'Users & Permissions' },
            { id: 'clans', label: 'Clans' },
            { id: 'ports', label: 'Ports' },
            { id: 'strikes', label: 'Strikes & Blacklist' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">User Management</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Port Battles Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signups
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strikes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._count.portBattles}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._count.signups}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._count.strikes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.canCreatePortBattles ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.canCreatePortBattles ? 'Can Create PBs' : 'Standard User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => toggleUserPermission(user.id, user.canCreatePortBattles)}
                        className={`px-3 py-1 rounded text-xs ${
                          user.canCreatePortBattles
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {user.canCreatePortBattles ? 'Remove PB Permission' : 'Grant PB Permission'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clans Tab */}
      {activeTab === 'clans' && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Clan Management</h2>

          {/* Create Clan Form */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Create New Clan</h3>
            <form onSubmit={createClan} className="grid md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Clan Name"
                value={newClan.name}
                onChange={(e) => setNewClan(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Clan Tag"
                value={newClan.tag}
                onChange={(e) => setNewClan(prev => ({ ...prev, tag: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Description (Optional)"
                value={newClan.description}
                onChange={(e) => setNewClan(prev => ({ ...prev, description: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Clan
              </button>
            </form>
          </div>

          {/* Clans List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clans.map((clan) => (
                  <tr key={clan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      [{clan.tag}]
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clan.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clan._count.members}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => deleteItem('clan', clan.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ports Tab */}
      {activeTab === 'ports' && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Port Management</h2>

          {/* Create Port Form */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Add New Port</h3>
            <form onSubmit={createPort} className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Port Name"
                value={newPort.name}
                onChange={(e) => setNewPort(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Port
              </button>
            </form>
          </div>

          {/* Ports List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Port Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Port Battles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ports.map((port) => (
                  <tr key={port.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {port.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {port._count.portBattles}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => deleteItem('port', port.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strikes Tab */}
      {activeTab === 'strikes' && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Strike & Blacklist Management</h2>

          {/* Create Strike Form */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Add User Strike</h3>
            <form onSubmit={createStrike} className="grid md:grid-cols-4 gap-4">
              <select
                value={newStrike.userId}
                onChange={(e) => setNewStrike(prev => ({ ...prev, userId: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Strike Reason"
                value={newStrike.reason}
                onChange={(e) => setNewStrike(prev => ({ ...prev, reason: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Add Strike
              </button>
            </form>
          </div>

          {/* Strikes List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {strikes.map((strike) => (
                  <tr key={strike.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {strike.user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {strike.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(strike.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {strike.createdBy.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => deleteItem('strike', strike.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
