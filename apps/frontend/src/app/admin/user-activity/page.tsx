'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { canViewUserActivity } from '@/lib/adminUtils'
import { activityApi, userManagementApi } from '@/lib/adminApi'
import Link from 'next/link'

interface User {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
  _count: {
    applications: number
    activityLogs: number
  }
}

interface ActivityLog {
  id: string
  timestamp: string
  userId: string
  action: string
  category: string
  resource?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  severity: string
  success: boolean
  user: {
    id: string
    username: string
    email: string
    role: string
  }
}

export default function UserActivityPage() {
  const { data: session, status } = useSession()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    if (session?.user && canViewUserActivity(session.user)) {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userManagementApi.getUsers({ limit: 100 })
      setUsers(response.items || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserActivity = async (userId?: string, page: number = 1) => {
    try {
      setActivitiesLoading(true)

      const params = {
        userId,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        page,
        limit: pagination.limit
      }

      const response = await activityApi.getUserActivity(params)
      setActivities(response.items || [])
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error fetching user activity:', error)
    } finally {
      setActivitiesLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    fetchUserActivity(user.id)
  }

  const handleFilterChange = () => {
    if (selectedUser) {
      fetchUserActivity(selectedUser.id, 1)
    } else {
      fetchUserActivity(undefined, 1)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth': return 'bg-blue-100 text-blue-800'
      case 'admin': return 'bg-red-100 text-red-800'
      case 'user': return 'bg-green-100 text-green-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      case 'security': return 'bg-yellow-100 text-yellow-800'
      case 'gdpr': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'info': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center">
        <div className="text-sail-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session?.user || !canViewUserActivity(session.user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center">
        <div className="neo-brutal-box bg-sail-white p-8 text-center">
          <h1 className="static-red-gradient text-2xl font-bold mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Access Denied
          </h1>
          <p className="text-navy-dark mb-6">You do not have permission to view user activity logs.</p>
          <Link
            href="/admin"
            className="bg-brass hover:bg-brass-bright text-white px-6 py-3 rounded-md font-semibold transition-all"
            style={{fontFamily: 'Cinzel, serif'}}
          >
            Return to Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      {/* Header */}
      <div className="bg-navy-dark/50 backdrop-blur-sm border-b border-sail-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="static-red-gradient text-3xl font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                👤 User Activity Timeline
              </h1>
              <p className="text-sail-white/70 mt-2" style={{fontFamily: 'Crimson Text, serif'}}>
                Track and monitor user actions and behavior
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Selection Sidebar */}
          <div className="neo-brutal-box bg-sail-white p-6">
            <h2 className="static-red-gradient text-xl font-bold mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Select User
            </h2>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brass focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  fetchUserActivity(undefined, 1)
                }}
                className={`w-full p-3 rounded-md text-left font-medium transition-all ${
                  !selectedUser
                    ? 'bg-brass text-white'
                    : 'bg-gray-100 text-navy-dark hover:bg-gray-200'
                }`}
                style={{fontFamily: 'Cinzel, serif'}}
              >
                📊 All Users Activity
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users
                  .filter(user =>
                    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`w-full p-3 rounded-md text-left transition-all ${
                        selectedUser?.id === user.id
                          ? 'bg-brass text-white'
                          : 'bg-gray-100 text-navy-dark hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm opacity-70">{user.email}</div>
                      <div className="text-xs mt-1">
                        {user._count.activityLogs} activities • Role: {user.role}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Activity Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="neo-brutal-box bg-sail-white p-6">
              <h3 className="static-red-gradient text-lg font-bold mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Filters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brass focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="auth">Authentication</option>
                    <option value="user">User Actions</option>
                    <option value="admin">Admin Actions</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                    <option value="gdpr">GDPR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brass focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brass focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleFilterChange}
                  className="bg-brass hover:bg-brass-bright text-white px-4 py-2 rounded-md font-semibold transition-all"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="neo-brutal-box bg-sail-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="static-red-gradient text-lg font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                  {selectedUser ? `Activity for ${selectedUser.username}` : 'All User Activity'}
                </h3>

                {pagination.total > 0 && (
                  <div className="text-sm text-navy-dark/70">
                    Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
                  </div>
                )}
              </div>

              {activitiesLoading ? (
                <div className="text-center py-8">
                  <div className="text-navy-dark">Loading activities...</div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-navy-dark/70">No activities found for the selected criteria.</div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                                {activity.category}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(activity.severity)}`}>
                                {activity.severity}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                activity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {activity.success ? 'Success' : 'Failed'}
                              </span>
                              <span className="text-sm text-navy-dark/70">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                            </div>

                            <h4 className="font-bold text-navy-dark mb-1">{activity.action}</h4>

                            {activity.details && (
                              <p className="text-navy-dark/80 mb-2">
                                {typeof activity.details === 'object'
                                  ? activity.details.description || JSON.stringify(activity.details, null, 2)
                                  : String(activity.details)
                                }
                              </p>
                            )}

                            <div className="text-xs text-navy-dark/60 space-y-1">
                              <div className="flex items-center gap-4">
                                <span>👤 {activity.user.username} ({activity.user.email})</span>
                                {activity.ipAddress && <span>🌐 {activity.ipAddress}</span>}
                              </div>

                              {activity.resource && (
                                <div>📁 Resource: {activity.resource}{activity.resourceId ? ` (${activity.resourceId})` : ''}</div>
                              )}

                              {activity.userAgent && (
                                <div>🖥️ {activity.userAgent.substring(0, 60)}...</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <button
                        onClick={() => {
                          const newPage = pagination.page - 1
                          if (selectedUser) {
                            fetchUserActivity(selectedUser.id, newPage)
                          } else {
                            fetchUserActivity(undefined, newPage)
                          }
                        }}
                        disabled={pagination.page <= 1}
                        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-semibold transition-all"
                      >
                        Previous
                      </button>

                      <span className="text-navy-dark">
                        Page {pagination.page} of {pagination.pages}
                      </span>

                      <button
                        onClick={() => {
                          const newPage = pagination.page + 1
                          if (selectedUser) {
                            fetchUserActivity(selectedUser.id, newPage)
                          } else {
                            fetchUserActivity(undefined, newPage)
                          }
                        }}
                        disabled={pagination.page >= pagination.pages}
                        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-semibold transition-all"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
