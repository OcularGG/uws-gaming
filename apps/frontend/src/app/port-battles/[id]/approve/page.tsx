'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from '@/hooks/useAuth'
import { isAdmin } from '@/lib/adminUtils'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface RoleRequest {
  id: string
  captainName: string
  clanName: string
  fleetRoleId: string
  roleName?: string
  shipName?: string
  brValue?: number
  willingToScreen: boolean
  comments?: string
  contactInfo?: string
  isExternalSignup: boolean
  status: 'PENDING' | 'APPROVED' | 'DENIED'
  createdAt: string
  updatedAt?: string
}

interface PortBattle {
  id: string
  title: string
  description: string
  scheduledDate: string
  status: string
  fleetSetups: Array<{
    id: string
    setupName: string
    roles: Array<{
      id: string
      shipName: string
      brValue: number
    }>
  }>
  roleRequests?: RoleRequest[]
}

export default function ApprovalQueuePage() {
  const params = useParams()
  const { data: session, status } = useSession()
  const [portBattle, setPortBattle] = useState<PortBattle | null>(null)
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (!session?.user?.id) {
          setError('You must be logged in to access the approval queue.')
          setLoading(false)
          return
        }

        // For now, check if user is admin (in production, this would check against database roles)
        const userIsAdmin = isAdmin(session.user)
        if (!userIsAdmin) {
          setError('You do not have permission to access the approval queue.')
          setLoading(false)
          return
        }

        await fetchPortBattleAndRequests()
      } catch (err) {
        console.error('Error initializing approval queue:', err)
        setError('Failed to load approval queue')
        setLoading(false)
      }
    }

    if (status !== 'loading') {
      initializeData()
    }
  }, [params.id, session, status])

  const fetchPortBattleAndRequests = async () => {
    try {
      setLoading(true)

      // Fetch port battle details
      const pbResponse = await fetch(`/api/port-battles?action=get&id=${params.id}`)
      if (!pbResponse.ok) {
        throw new Error('Failed to fetch port battle')
      }
      const pbData = await pbResponse.json()
      setPortBattle(pbData.portBattle)

      // Fetch role requests for this port battle
      const requestsResponse = await fetch(`/api/port-battles/requests?portBattleId=${params.id}`)
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRoleRequests(requestsData.requests || [])
      } else {
        // If endpoint doesn't exist yet, create mock data for testing
        const mockRequests: RoleRequest[] = [
          {
            id: 'req-1',
            captainName: 'Captain_Blackbeard',
            clanName: 'Pirates United',
            fleetRoleId: 'r-1',
            roleName: 'HMS Victory',
            shipName: 'HMS Victory',
            brValue: 80,
            willingToScreen: true,
            comments: 'Experienced line ship captain with over 200 hours in Naval Action. I have commanded similar vessels in previous port battles and understand fleet coordination. I can follow orders precisely and have TeamSpeak/Discord for communication.',
            contactInfo: '',
            isExternalSignup: false,
            status: 'PENDING',
            createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            id: 'req-2',
            captainName: 'Admiral_Hornblower',
            clanName: 'Royal Navy',
            fleetRoleId: 'r-3',
            roleName: 'HMS Bellerophon',
            shipName: 'HMS Bellerophon',
            brValue: 74,
            willingToScreen: false,
            comments: 'Looking forward to this engagement. I have the required ship fully fitted with live oak/teak and purple mods. Available 30 minutes before battle start for coordination.',
            contactInfo: '',
            isExternalSignup: false,
            status: 'PENDING',
            createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
          },
          {
            id: 'req-3',
            captainName: 'ExternalCaptain_Storm',
            clanName: 'Independent',
            fleetRoleId: 'r-5',
            roleName: 'HMS Leander',
            shipName: 'HMS Leander',
            brValue: 50,
            willingToScreen: true,
            comments: 'External signup via Captain\'s Code. Ready to support the fleet in any capacity needed. I have experience with frigate operations and can provide screening support. Contact me on Discord for any questions about my setup or availability.',
            contactInfo: 'StormCaptain#1234',
            isExternalSignup: true,
            status: 'PENDING',
            createdAt: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
          }
        ]
        setRoleRequests(mockRequests)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load port battle or requests')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAction = async (requestId: string, action: 'approve' | 'deny', reason?: string) => {
    setActionLoading(requestId)
    try {
      const response = await fetch('/api/port-battles/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action,
          reason
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update request')
      }

      // Update local state
      setRoleRequests(prev => prev.map(req =>
        req.id === requestId
          ? { ...req, status: action === 'approve' ? 'APPROVED' : 'DENIED', updatedAt: new Date().toISOString() }
          : req
      ))

      // Show success message
      alert(`Request ${action}d successfully!`)
    } catch (err) {
      console.error(`Error ${action}ing request:`, err)
      alert(`Failed to ${action} request. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleInfo = (fleetRoleId: string) => {
    if (!portBattle) return { shipName: 'Unknown', brValue: 0 }

    for (const setup of portBattle.fleetSetups) {
      const role = setup.roles.find(r => r.id === fleetRoleId)
      if (role) {
        return { shipName: role.shipName, brValue: role.brValue }
      }
    }
    return { shipName: 'Unknown', brValue: 0 }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'DENIED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading approval queue...</div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Access Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const pendingRequests = roleRequests.filter(req => req.status === 'PENDING')
  const processedRequests = roleRequests.filter(req => req.status !== 'PENDING')

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Approval Queue
          </h1>
          {portBattle && (
            <div className="text-lg text-gray-700">
              <h2 className="font-semibold">{portBattle.title}</h2>
              <p className="text-sm text-gray-600">
                Scheduled: {formatDateTime(portBattle.scheduledDate)}
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-yellow-800 font-semibold text-lg">{pendingRequests.length}</div>
              <div className="text-yellow-600 text-sm">Pending Requests</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-green-800 font-semibold text-lg">{processedRequests.filter(r => r.status === 'APPROVED').length}</div>
              <div className="text-green-600 text-sm">Approved</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-800 font-semibold text-lg">{processedRequests.filter(r => r.status === 'DENIED').length}</div>
              <div className="text-red-600 text-sm">Denied</div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Requests ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <p className="text-gray-600">No pending requests at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                const roleInfo = getRoleInfo(request.fleetRoleId)
                return (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {request.captainName}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          {request.isExternalSignup && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              External
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Clan:</span> {request.clanName}</p>
                          <p><span className="font-medium">Role Requested:</span> {roleInfo.shipName} (BR {roleInfo.brValue})</p>
                          <p><span className="font-medium">Willing to Screen:</span> {request.willingToScreen ? 'Yes' : 'No'}</p>
                          {request.isExternalSignup && request.contactInfo && (
                            <p><span className="font-medium">Discord:</span> {request.contactInfo}</p>
                          )}
                          <p><span className="font-medium">Submitted:</span> {formatDateTime(request.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Comments */}
                    {request.comments && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          Captain's Comments:
                        </h5>
                        <p className="text-blue-700 text-sm leading-relaxed">{request.comments}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRequestAction(request.id, 'approve')}
                        disabled={actionLoading === request.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {actionLoading === request.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : null}
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter reason for denial (optional):')
                          handleRequestAction(request.id, 'deny', reason || undefined)
                        }}
                        disabled={actionLoading === request.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Processed Requests ({processedRequests.length})
            </h3>

            <div className="space-y-3">
              {processedRequests.map((request) => {
                const roleInfo = getRoleInfo(request.fleetRoleId)
                return (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border p-4 opacity-75">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{request.captainName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          {request.isExternalSignup && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              External
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span> {roleInfo.shipName} |
                          <span className="font-medium"> Clan:</span> {request.clanName} |
                          <span className="font-medium"> Processed:</span> {request.updatedAt ? formatDateTime(request.updatedAt) : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
