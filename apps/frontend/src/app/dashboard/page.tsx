'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { getAuthHeaders } from '@/hooks/useAuthenticatedFetch'
import Link from 'next/link'

interface UserStats {
  totalSignups: number
  upcomingBattles: number
  completedBattles: number
  pendingSignups: number
}

interface PortBattleSignup {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  portBattle: {
    id: string
    title: string
    scheduledTime: string
    port: {
      name: string
    }
  }
  fleetRole: {
    name: string
    setup: {
      name: string
    }
  }
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentSignups, setRecentSignups] = useState<PortBattleSignup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsResponse, signupsResponse] = await Promise.all([
        fetch('/api/user/stats', {
          headers: getAuthHeaders()
        }),
        fetch('/api/user/signups', {
          headers: getAuthHeaders()
        })
      ])

      if (!statsResponse.ok || !signupsResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const statsData = await statsResponse.json()
      const signupsData = await signupsResponse.json()

      setStats(statsData.stats)
      setRecentSignups(signupsData.signups || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-sail-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brass mx-auto"></div>
              <p className="mt-4">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-sail-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Login Required
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view your dashboard.
            </p>
            <Link
              href="/api/auth/signin"
              className="bg-navy text-sail-white px-6 py-3 rounded font-medium hover:bg-navy-dark transition-colors"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Login with Discord
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = session.user.discordId === '1207434980855259206' || session.user.isAdmin

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-sail-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                  Welcome back, {session.user.name || session.user.username}!
                </h1>
                <p className="text-gray-600 mt-2">
                  {isAdmin ? '⚡ Administrator' : '⚓ Fleet Member'} • Discord: {session.user.username}
                </p>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/port-battles"
                  className="bg-navy text-sail-white px-4 py-2 rounded hover:bg-navy-dark transition-colors"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  Port Battles
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="bg-brass text-navy-dark px-4 py-2 rounded hover:bg-brass-bright transition-colors"
                    style={{fontFamily: 'Cinzel, serif'}}
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-sail-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brass mx-auto"></div>
              <p className="mt-4">Loading your data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">Error: {error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Statistics Cards */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-sail-white" style={{fontFamily: 'Cinzel, serif'}}>
                  Your Statistics
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-sail-white rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-navy-dark">
                      {stats?.totalSignups || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Total Signups</div>
                  </div>

                  <div className="bg-sail-white rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-navy-dark">
                      {stats?.upcomingBattles || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Upcoming Battles</div>
                  </div>

                  <div className="bg-sail-white rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-navy-dark">
                      {stats?.completedBattles || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Completed Battles</div>
                  </div>

                  <div className="bg-sail-white rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-navy-dark">
                      {stats?.pendingSignups || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Pending Approvals</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-sail-white rounded-lg p-6">
                  <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/port-battles"
                      className="block w-full bg-navy text-sail-white p-3 rounded text-center hover:bg-navy-dark transition-colors"
                      style={{fontFamily: 'Cinzel, serif'}}
                    >
                      Browse Port Battles
                    </Link>
                    <Link
                      href="/port-battles/calendar"
                      className="block w-full bg-blue-600 text-white p-3 rounded text-center hover:bg-blue-700 transition-colors"
                      style={{fontFamily: 'Cinzel, serif'}}
                    >
                      View Calendar
                    </Link>
                    <Link
                      href="/apply"
                      className="block w-full bg-green-600 text-white p-3 rounded text-center hover:bg-green-700 transition-colors"
                      style={{fontFamily: 'Cinzel, serif'}}
                    >
                      Apply to Fleet
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Signups */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-sail-white" style={{fontFamily: 'Cinzel, serif'}}>
                  Recent Signups
                </h2>

                <div className="bg-sail-white rounded-lg p-6">
                  {recentSignups.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No recent signups found.</p>
                      <Link
                        href="/port-battles"
                        className="text-navy hover:text-brass transition-colors"
                        style={{fontFamily: 'Cinzel, serif'}}
                      >
                        Browse available port battles →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentSignups.map((signup) => (
                        <div
                          key={signup.id}
                          className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-navy-dark">
                                {signup.portBattle.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {signup.portBattle.port.name} • {signup.fleetRole.setup.name} - {signup.fleetRole.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(signup.portBattle.scheduledTime).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  signup.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : signup.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {signup.status.charAt(0).toUpperCase() + signup.status.slice(1)}
                              </span>
                              <div className="mt-2">
                                <Link
                                  href={`/port-battles/${signup.portBattle.id}`}
                                  className="text-navy hover:text-brass text-xs transition-colors"
                                  style={{fontFamily: 'Cinzel, serif'}}
                                >
                                  View Details →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
