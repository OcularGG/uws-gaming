'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { canAccessGDPRTools } from '@/lib/adminUtils'
import { gdprApi } from '@/lib/adminApi'
import Link from 'next/link'

interface DataRequest {
  id: string
  userId: string
  type: string
  status: string
  requestData?: any
  processedBy?: string
  processedAt?: string
  completedAt?: string
  downloadUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    email: string
    role: string
  }
  processor?: {
    id: string
    username: string
    email: string
  }
}

interface UserDataSummary {
  userId: string
  email: string
  username: string
  createdAt: string
  updatedAt: string
  dataTypes: {
    profile: boolean
    applications: boolean
    activityLogs: boolean
    gdprRequests: boolean
  }
  totalDataSize: string
  counts: {
    applications: number
    activityLogs: number
    gdprRequests: number
  }
}

export default function GDPRPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'requests' | 'data-summary' | 'tools'>('requests')
  const [requests, setRequests] = useState<DataRequest[]>([])
  const [userDataSummary, setUserDataSummary] = useState<UserDataSummary | null>(null)
  const [searchEmail, setSearchEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    if (session?.user && canAccessGDPRTools(session.user)) {
      fetchDataRequests()
    }
  }, [session])

  const fetchDataRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await gdprApi.getRequests({
        page: pagination.page,
        limit: pagination.limit
      })

      setRequests(response.items || [])
      setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } catch (error) {
      console.error('Error fetching GDPR requests:', error)
      setError('Failed to load GDPR requests')
    } finally {
      setLoading(false)
    }
  }

  const searchUserData = async () => {
    if (!searchEmail.trim()) return

    setLoading(true)
    setError(null)

    try {
      // First, find the user by email (we'd need a user search endpoint)
      // For now, assuming we have the userId
      const userId = searchEmail // This should be replaced with actual user lookup

      const response = await gdprApi.getUserDataSummary(userId)
      setUserDataSummary(response)
    } catch (error) {
      console.error('Error searching user data:', error)
      setError('Failed to find user data')
      setUserDataSummary(null)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessRequest = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      await gdprApi.processRequest(requestId, status, notes)
      await fetchDataRequests()
    } catch (error) {
      console.error('Error processing GDPR request:', error)
      setError('Failed to process request')
    }
  }

  const handleExportUserData = async (userId: string) => {
    try {
      setLoading(true)
      const response = await gdprApi.exportUserData(userId)

      if (response.downloadUrl) {
        // Trigger download
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.download = response.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error exporting user data:', error)
      setError('Failed to export user data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUserData = async (userId: string, reason: string) => {
    if (!confirm('Are you sure you want to permanently delete all user data? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      await gdprApi.deleteUserData(userId, reason, true)
      setUserDataSummary(null)
      setSearchEmail('')
      await fetchDataRequests()
    } catch (error) {
      console.error('Error deleting user data:', error)
      setError('Failed to delete user data')
    } finally {
      setLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session?.user || !canAccessGDPRTools(session.user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need appropriate privileges to access GDPR tools.</p>
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
                <span className="text-gray-900 font-medium">GDPR Tools</span>
              </li>
            </ol>
          </nav>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">GDPR Tools</h1>
            <p className="mt-2 text-gray-600">Handle data requests and user privacy compliance</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } mr-8`}
              >
                Data Requests
              </button>
              <button
                onClick={() => setActiveTab('data-summary')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'data-summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } mr-8`}
              >
                Data Summary
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tools'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tools
              </button>
            </nav>
          </div>

          {/* Data Requests Tab */}
          {activeTab === 'requests' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">GDPR Data Requests</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No GDPR requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Processor
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request.user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.type === 'export' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {request.type === 'export' ? 'Data Export' : 'Data Deletion'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.processor ? request.processor.username : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleProcessRequest(request.id, 'approved')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleProcessRequest(request.id, 'rejected', 'Rejected by admin')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {request.status === 'completed' && request.downloadUrl && (
                              <a
                                href={request.downloadUrl}
                                download
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Download
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Data Summary Tab */}
          {activeTab === 'data-summary' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Data Summary</h2>

              <div className="mb-6">
                <div className="flex space-x-4">
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter user email or ID..."
                  />
                  <button
                    onClick={searchUserData}
                    disabled={loading || !searchEmail.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {userDataSummary && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Data Summary for {userDataSummary.username}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Email:</dt>
                          <dd className="text-gray-900">{userDataSummary.email}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Created:</dt>
                          <dd className="text-gray-900">{formatDate(userDataSummary.createdAt)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Data Size:</dt>
                          <dd className="text-gray-900">{userDataSummary.totalDataSize}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Data Counts</h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Applications:</dt>
                          <dd className="text-gray-900">{userDataSummary.counts.applications}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Activity Logs:</dt>
                          <dd className="text-gray-900">{userDataSummary.counts.activityLogs}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">GDPR Requests:</dt>
                          <dd className="text-gray-900">{userDataSummary.counts.gdprRequests}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => handleExportUserData(userDataSummary.userId)}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Export Data
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for data deletion:')
                        if (reason) {
                          handleDeleteUserData(userDataSummary.userId, reason)
                        }
                      }}
                      disabled={loading}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      Delete All Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tools Tab */}
          {activeTab === 'tools' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">GDPR Tools</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Data Export Tool</h3>
                  <p className="text-blue-700 mb-4">Export all user data in compliance with GDPR Article 20 (Right to Data Portability)</p>
                  <div className="text-sm text-blue-600">
                    <p>• Exports user profile data</p>
                    <p>• Includes all user-generated content</p>
                    <p>• Provides data in machine-readable format</p>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Data Deletion Tool</h3>
                  <p className="text-red-700 mb-4">Permanently delete all user data in compliance with GDPR Article 17 (Right to Erasure)</p>
                  <div className="text-sm text-red-600">
                    <p>• Deletes all personal data</p>
                    <p>• Removes user-generated content</p>
                    <p>• Action is irreversible</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Compliance Reports</h3>
                  <p className="text-green-700 mb-4">Generate reports for GDPR compliance audits</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Generate Report
                  </button>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Request Analytics</h3>
                  <p className="text-yellow-700 mb-4">View analytics on GDPR requests and processing times</p>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
