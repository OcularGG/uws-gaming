'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { isAdmin as checkIsAdmin } from '@/lib/adminUtils'
import { blacklistApi } from '@/lib/adminApi'
import Link from 'next/link'

interface BlacklistEntry {
  id: string
  type: 'user' | 'ip' | 'email'
  value: string
  reason: string
  expiresAt?: string
  isActive: boolean
  createdAt: string
  addedBy: string
  addedByUser: {
    id: string
    username: string
    email: string
  }
}

export default function BlacklistPage() {
  const { data: session, status } = useSession()
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEntry, setNewEntry] = useState({
    type: 'user' as 'user' | 'ip' | 'email',
    value: '',
    reason: '',
    expiresAt: ''
  })
  const [filter, setFilter] = useState<'all' | 'user' | 'ip' | 'email'>('all')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    totalActive: number
    totalExpired: number
    byType: { user?: number; ip?: number; email?: number }
  } | null>(null)

  useEffect(() => {
    if (session?.user && checkIsAdmin(session.user)) {
      fetchBlacklist()
      fetchStats()
    }
  }, [session, filter])

  const fetchBlacklist = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = { active: true }
      if (filter !== 'all') {
        params.type = filter
      }

      const response = await blacklistApi.getBlacklist(params)
      setBlacklist(response.items || [])
    } catch (error) {
      console.error('Error fetching blacklist:', error)
      setError('Failed to load blacklist')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await blacklistApi.getStats()
      setStats(response || null)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleAddEntry = async () => {
    if (!newEntry.value.trim() || !newEntry.reason.trim()) return

    try {
      const entryData: any = {
        type: newEntry.type,
        value: newEntry.value.trim(),
        reason: newEntry.reason.trim()
      }

      if (newEntry.expiresAt) {
        entryData.expiresAt = newEntry.expiresAt
      }

      await blacklistApi.addEntry(entryData)
      setShowAddModal(false)
      setNewEntry({ type: 'user', value: '', reason: '', expiresAt: '' })
      await fetchBlacklist()
      await fetchStats()
    } catch (error) {
      console.error('Error adding blacklist entry:', error)
      setError('Failed to add blacklist entry')
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this blacklist entry?')) return

    try {
      await blacklistApi.deleteEntry(entryId)
      await fetchBlacklist()
      await fetchStats()
    } catch (error) {
      console.error('Error deleting blacklist entry:', error)
      setError('Failed to delete blacklist entry')
    }
  }

  const handleToggleActive = async (entryId: string, isActive: boolean) => {
    try {
      await blacklistApi.updateEntry(entryId, { isActive: !isActive })
      await fetchBlacklist()
      await fetchStats()
    } catch (error) {
      console.error('Error updating blacklist entry:', error)
      setError('Failed to update blacklist entry')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session?.user || !checkIsAdmin(session.user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link href="/admin" className="text-blue-600 hover:text-blue-500">
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                  Admin
                </Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li>
                <span className="text-gray-900 font-medium">Blacklist Management</span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blacklist Management</h1>
              <p className="mt-2 text-gray-600">Manage blocked users, IPs, and email addresses</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Add to Blacklist
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Active</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalActive}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Users</div>
              <div className="text-2xl font-bold text-gray-900">{stats.byType.user || 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">IP Addresses</div>
              <div className="text-2xl font-bold text-gray-900">{stats.byType.ip || 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Email Addresses</div>
              <div className="text-2xl font-bold text-gray-900">{stats.byType.email || 0}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setFilter('user')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filter === 'user'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setFilter('ip')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filter === 'ip'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                IP Addresses
              </button>
              <button
                onClick={() => setFilter('email')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filter === 'email'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Email Addresses
              </button>
            </div>
          </div>
        </div>

        {/* Blacklist Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Blacklisted Entries</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading blacklist...</p>
            </div>
          ) : blacklist.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No blacklist entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blacklist.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.type === 'user' ? 'bg-blue-100 text-blue-800' :
                          entry.type === 'ip' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {entry.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {entry.value}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={entry.reason}>
                          {entry.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.addedByUser.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.expiresAt ? (
                          <span className={isExpired(entry.expiresAt) ? 'text-red-600' : ''}>
                            {formatDate(entry.expiresAt)}
                          </span>
                        ) : (
                          'Never'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.isActive && !isExpired(entry.expiresAt)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.isActive && !isExpired(entry.expiresAt) ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleToggleActive(entry.id, entry.isActive)}
                          className={`${
                            entry.isActive ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {entry.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Entry Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add to Blacklist</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as 'user' | 'ip' | 'email' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="user">User</option>
                    <option value="ip">IP Address</option>
                    <option value="email">Email Address</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={newEntry.value}
                    onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={
                      newEntry.type === 'user' ? 'Username' :
                      newEntry.type === 'ip' ? 'IP Address' :
                      'Email Address'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    value={newEntry.reason}
                    onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Reason for blacklisting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newEntry.expiresAt}
                    onChange={(e) => setNewEntry({ ...newEntry, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddEntry}
                  disabled={!newEntry.value.trim() || !newEntry.reason.trim()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add to Blacklist
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewEntry({ type: 'user', value: '', reason: '', expiresAt: '' })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
