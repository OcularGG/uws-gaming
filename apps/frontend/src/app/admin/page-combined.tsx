'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { getAuthHeaders } from '@/hooks/useAuthenticatedFetch'
import Link from 'next/link'

interface User {
  id: string
  username: string
  email?: string
  discordId: string
  canCreatePortBattles: boolean
  createdAt: string
  strikes?: Strike[]
  _count: {
    portBattles: number
    portBattleSignups: number
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

interface Strike {
  id: string
  reason: string
  createdAt: string
  isRemoved: boolean
  user: {
    username: string
  }
  createdBy: {
    username: string
  }
}

interface BugReport {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: string
  user: {
    username: string
    discordId: string
  }
}

interface Application {
  id: string
  applicantName: string
  discordUsername: string
  discordId: string
  email?: string
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  currentNation: string
  preferredRole: string
  weeklyPlayTime: number
}

interface CommandRole {
  id: string
  title: string
  description: string
  level: number
  permissions: string[]
  assignedUsers: User[]
}

export default function CombinedAdminPanel() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [clans, setClans] = useState<Clan[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [strikes, setStrikes] = useState<Strike[]>([])
  const [reports, setReports] = useState<BugReport[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [commandRoles, setCommandRoles] = useState<CommandRole[]>([])

  // Form states
  const [newClan, setNewClan] = useState({ name: '', tag: '', description: '' })
  const [newPort, setNewPort] = useState({ name: '' })
  const [newStrike, setNewStrike] = useState({ userId: '', reason: '' })
  const [newRole, setNewRole] = useState({ title: '', description: '', level: 1 })

  // Check if user is admin
  const isAdmin = session?.user?.discordId === '1207434980855259206' || session?.user?.isAdmin

  useEffect(() => {
    if (session && isAdmin) {
      fetchData()
    }
  }, [session, activeTab, isAdmin])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }

      switch (activeTab) {
        case 'users':
        case 'clans':
        case 'ports':
        case 'strikes': {
          const response = await fetch(`/api/admin?type=${activeTab}`, { headers })
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()

          if (activeTab === 'users') setUsers(data.users || [])
          else if (activeTab === 'clans') setClans(data.clans || [])
          else if (activeTab === 'ports') setPorts(data.ports || [])
          else if (activeTab === 'strikes') setStrikes(data.strikes || [])
          break
        }
        case 'reports': {
          // Fetch bug reports - implement API endpoint
          const response = await fetch('/api/bug-reports?admin=true', { headers })
          if (response.ok) {
            const data = await response.json()
            setReports(data.reports || [])
          }
          break
        }
        case 'applications': {
          // Fetch applications - implement API endpoint
          const response = await fetch('/api/applications?admin=true', { headers })
          if (response.ok) {
            const data = await response.json()
            setApplications(data.applications || [])
          }
          break
        }
        case 'command': {
          // Fetch command structure - mock data for now
          setCommandRoles([
            {
              id: '1',
              title: 'Fleet Admiral',
              description: 'Supreme command authority',
              level: 5,
              permissions: ['ALL'],
              assignedUsers: []
            },
            {
              id: '2',
              title: 'Port Battle Commander',
              description: 'Commands port battle operations',
              level: 4,
              permissions: ['CREATE_PORT_BATTLES', 'MANAGE_FLEETS'],
              assignedUsers: []
            }
          ])
          break
        }
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
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          action: 'updatePermissions',
          userId,
          canCreatePortBattles: !canCreatePortBattles
        }),
      })

      if (!response.ok) throw new Error('Failed to update user permissions')
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
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'clan', ...newClan }),
      })

      if (!response.ok) throw new Error('Failed to create clan')
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
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'port', ...newPort }),
      })

      if (!response.ok) throw new Error('Failed to create port')
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
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'strike', ...newStrike }),
      })

      if (!response.ok) throw new Error('Failed to create strike')
      setNewStrike({ userId: '', reason: '' })
      await fetchData()
    } catch (err) {
      console.error('Error creating strike:', err)
      alert('Failed to create strike')
    }
  }

  const deleteItem = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const response = await fetch(`/api/admin?type=${type}&id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error(`Failed to delete ${type}`)
      await fetchData()
    } catch (err) {
      console.error(`Error deleting ${type}:`, err)
      alert(`Failed to delete ${type}`)
    }
  }

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await fetch('/api/bug-reports', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reportId, status }),
      })

      if (!response.ok) throw new Error('Failed to update report status')
      await fetchData()
    } catch (err) {
      console.error('Error updating report status:', err)
      alert('Failed to update report status')
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, reviewNotes?: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: applicationId,
          status,
          reviewNotes,
          reviewedBy: session?.user?.username,
          reviewedAt: new Date().toISOString()
        }),
      })

      if (!response.ok) throw new Error('Failed to update application status')
      await fetchData()
    } catch (err) {
      console.error('Error updating application status:', err)
      alert('Failed to update application status')
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the admin panel.</p>
          <Link href="/api/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sail-white mb-2" style={{fontFamily: 'Cinzel, serif'}}>
            ⚓ KRAKEN Command Center ⚓
          </h1>
          <p className="text-sail-white/80 text-xl" style={{fontFamily: 'Crimson Text, serif'}}>
            Command and Control Center for KRAKEN Squadron Operations
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              ← Home
            </Link>
            <Link href="/port-battles" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Port Battles
            </Link>
          </div>
          <div className="text-sail-white">
            Logged in as <strong>{session.user?.username || session.user?.name}</strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="neo-brutal-box bg-sail-white mb-8">
          <div className="flex border-b-2 border-navy-dark overflow-x-auto">
            {[
              { id: 'users', label: 'User Management', icon: '👥' },
              { id: 'clans', label: 'Clans', icon: '🏴‍☠️' },
              { id: 'ports', label: 'Ports', icon: '⚓' },
              { id: 'strikes', label: 'Strikes & Blacklist', icon: '⚠️' },
              { id: 'reports', label: 'Content Reports', icon: '📋' },
              { id: 'applications', label: 'Applications', icon: '📝' },
              { id: 'command', label: 'Command Structure', icon: '⭐' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brass text-navy-dark border-b-4 border-brass-bright'
                    : 'text-navy-dark hover:bg-brass/20'
                }`}
                style={{fontFamily: 'Cinzel, serif'}}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-sail-white text-lg">Loading...</div>
          </div>
        )}

        {/* Content Sections */}
        <div className="neo-brutal-box bg-sail-white p-6">
          {/* Users Management */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                👥 User Management
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-navy-dark text-sail-white">
                      <th className="px-4 py-2 text-left">Username</th>
                      <th className="px-4 py-2 text-left">Discord ID</th>
                      <th className="px-4 py-2 text-left">Port Battle Access</th>
                      <th className="px-4 py-2 text-left">Port Battles</th>
                      <th className="px-4 py-2 text-left">Signups</th>
                      <th className="px-4 py-2 text-left">Joined</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{user.username}</td>
                        <td className="px-4 py-2 font-mono text-sm">{user.discordId}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => toggleUserPermission(user.id, user.canCreatePortBattles)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              user.canCreatePortBattles
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {user.canCreatePortBattles ? 'Enabled' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-4 py-2">{user._count.portBattles}</td>
                        <td className="px-4 py-2">{user._count.portBattleSignups}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => setNewStrike(prev => ({ ...prev, userId: user.id }))}
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600 mr-2"
                          >
                            Add Strike
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Clans Management */}
          {activeTab === 'clans' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                🏴‍☠️ Clan Management
              </h2>

              {/* Create Clan Form */}
              <form onSubmit={createClan} className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="text-lg font-semibold mb-3">Create New Clan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Clan Name"
                    value={newClan.name}
                    onChange={(e) => setNewClan(prev => ({ ...prev, name: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Clan Tag"
                    value={newClan.tag}
                    onChange={(e) => setNewClan(prev => ({ ...prev, tag: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newClan.description}
                    onChange={(e) => setNewClan(prev => ({ ...prev, description: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Clan
                </button>
              </form>

              {/* Clans List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clans.map((clan) => (
                  <div key={clan.id} className="border border-gray-300 rounded p-4">
                    <h4 className="font-bold text-lg">[{clan.tag}] {clan.name}</h4>
                    {clan.description && <p className="text-gray-600 text-sm mb-2">{clan.description}</p>}
                    <p className="text-sm text-gray-500 mb-3">Members: {clan._count.members}</p>
                    <button
                      onClick={() => deleteItem('clan', clan.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ports Management */}
          {activeTab === 'ports' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                ⚓ Port Management
              </h2>

              {/* Create Port Form */}
              <form onSubmit={createPort} className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="text-lg font-semibold mb-3">Create New Port</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Port Name"
                    value={newPort.name}
                    onChange={(e) => setNewPort(prev => ({ ...prev, name: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2 flex-1"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Create Port
                  </button>
                </div>
              </form>

              {/* Ports List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ports.map((port) => (
                  <div key={port.id} className="border border-gray-300 rounded p-4">
                    <h4 className="font-bold text-lg">{port.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">Port Battles: {port._count.portBattles}</p>
                    <button
                      onClick={() => deleteItem('port', port.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strikes & Blacklist */}
          {activeTab === 'strikes' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                ⚠️ Strikes & Blacklist
              </h2>

              {/* Create Strike Form */}
              <form onSubmit={createStrike} className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="text-lg font-semibold mb-3">Add User Strike</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={newStrike.userId}
                    onChange={(e) => setNewStrike(prev => ({ ...prev, userId: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Strike Reason"
                    value={newStrike.reason}
                    onChange={(e) => setNewStrike(prev => ({ ...prev, reason: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Add Strike
                </button>
              </form>

              {/* Strikes List */}
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-red-100">
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-left">Reason</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Issued By</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strikes.filter(strike => !strike.isRemoved).map((strike) => (
                      <tr key={strike.id} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-medium">{strike.user.username}</td>
                        <td className="px-4 py-2">{strike.reason}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(strike.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">{strike.createdBy.username}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => deleteItem('strike', strike.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
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

          {/* Content Reports */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                📋 Content Reports
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-yellow-100">
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Priority</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Reporter</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-medium">{report.title}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            report.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.priority}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={report.status}
                            onChange={(e) => updateReportStatus(report.id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-sm">{report.user.username}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => alert(`Report Details:\n\n${report.description}`)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications */}
          {activeTab === 'applications' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                📝 Applications
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="px-4 py-2 text-left">Applicant</th>
                      <th className="px-4 py-2 text-left">Nation</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Submitted</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-medium">
                          <div>
                            <div>{app.applicantName}</div>
                            <div className="text-sm text-gray-600">{app.discordUsername}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2">{app.currentNation}</td>
                        <td className="px-4 py-2">{app.preferredRole}</td>
                        <td className="px-4 py-2">
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Command Structure */}
          {activeTab === 'command' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                ⭐ Command Structure
              </h2>

              <div className="space-y-4">
                {commandRoles.map((role) => (
                  <div key={role.id} className="border border-gray-300 rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{role.title}</h4>
                      <span className="bg-navy-dark text-sail-white px-2 py-1 rounded text-sm">
                        Level {role.level}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{role.description}</p>
                    <div className="mb-3">
                      <h5 className="font-semibold mb-1">Permissions:</h5>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((perm, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-1">Assigned Users: ({role.assignedUsers.length})</h5>
                      {role.assignedUsers.length === 0 ? (
                        <p className="text-gray-500 text-sm">No users assigned</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {role.assignedUsers.map((user) => (
                            <span key={user.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {user.username}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
