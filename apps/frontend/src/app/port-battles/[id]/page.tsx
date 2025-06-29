'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { useParams, useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/adminUtils'
import Link from 'next/link'

interface PortBattle {
  id: string
  portName: string
  meetupTime: string
  battleStartTime: string
  isDeepWater: boolean
  meetupLocation: string
  brLimit: number
  commanderName?: string
  secondICName?: string
  reqCommanderName?: string
  status: string
  creator: {
    username: string
  }
  fleetSetups: FleetSetup[]
  screeningFleets: ScreeningFleet[]
}

interface FleetSetup {
  id: string
  setupName: string
  isActive: boolean
  setupOrder: number
  roles: FleetRole[]
}

interface FleetRole {
  id: string
  roleOrder: number
  shipName: string
  brValue: number
  signups: PortBattleSignup[]
}

interface PortBattleSignup {
  id: string
  captainName: string
  clanName: string
  shipName: string
  books: number
  alternateShip?: string
  alternateBooks?: number
  willingToScreen: boolean
  comments?: string
  status: string
  user: {
    username: string
  }
}

interface ScreeningFleet {
  id: string
  fleetType: string
  observation?: string
  shipsRequired: string
  nation: string
  commanderName?: string
  signups: ScreeningSignup[]
}

interface ScreeningSignup {
  id: string
  captainName: string
  clanName: string
  status: string
  user: {
    username: string
  }
}

export default function PortBattleDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [portBattle, setPortBattle] = useState<PortBattle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      fetchPortBattle()
    }
  }, [params.id])

  const fetchPortBattle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/port-battles?action=get&id=${params.id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPortBattle(data.portBattle)
    } catch (err) {
      console.error('Error fetching port battle:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch port battle')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, signup: PortBattleSignup) => {
    setDraggedItem(signup)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetRoleId: string) => {
    e.preventDefault()

    if (!draggedItem || !portBattle) return

    try {
      const response = await fetch('/api/port-battles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'moveSignup',
          signupId: draggedItem.id,
          targetRoleId,
          portBattleId: portBattle.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to move signup')
      }

      // Refresh the port battle data
      await fetchPortBattle()
    } catch (err) {
      console.error('Error moving signup:', err)
      alert('Failed to move signup')
    } finally {
      setDraggedItem(null)
    }
  }

  const updateSignupStatus = async (signupId: string, status: 'APPROVED' | 'DENIED' | 'STANDBY') => {
    try {
      const response = await fetch('/api/port-battles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateSignupStatus',
          signupId,
          status
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update signup status')
      }

      // Refresh the port battle data
      await fetchPortBattle()
    } catch (err) {
      console.error('Error updating signup status:', err)
      alert('Failed to update signup status')
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const calculateUsedBR = (fleetSetups: FleetSetup[]) => {
    return fleetSetups.reduce((total, setup) => {
      if (!setup.isActive) return total
      return total + setup.roles.reduce((setupTotal, role) => {
        const approvedSignups = role.signups.filter(s => s.status === 'APPROVED')
        return setupTotal + (approvedSignups.length * role.brValue)
      }, 0)
    }, 0)
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Details</h1>
          <p className="text-gray-600 mb-4">Please sign in to access port battle details.</p>
          <Link href="/api/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Details</h1>
          <p>Loading port battle...</p>
        </div>
      </div>
    )
  }

  if (error || !portBattle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Details</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error || 'Port battle not found'}
          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={fetchPortBattle}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <Link href="/port-battles" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Back to Port Battles
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const usedBR = calculateUsedBR(portBattle.fleetSetups)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/port-battles" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Back to Port Battles
          </Link>
          <h1 className="text-3xl font-bold">{portBattle.portName}</h1>
        </div>
        <div className="space-x-4">
          <Link
            href={`/port-battles/${portBattle.id}/signup`}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Sign Up
          </Link>
          {/* Show approval queue link for admins */}
          {isAdmin(session?.user) && (
            <Link
              href={`/port-battles/${portBattle.id}/approve`}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
            >
              Approval Queue
            </Link>
          )}
          <Link
            href={`/port-battles/${portBattle.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Port Battle Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Battle Information</h3>
            <p className="text-sm mb-1">
              <span className="font-medium">Port:</span> {portBattle.portName}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Type:</span> {portBattle.isDeepWater ? 'Deep Water' : 'Shallow Water'}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">BR Limit:</span> {portBattle.brLimit}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">BR Used:</span> {usedBR} / {portBattle.brLimit}
            </p>
            <p className="text-sm">
              <span className="font-medium">Status:</span>
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                portBattle.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                portBattle.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {portBattle.status}
              </span>
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Schedule</h3>
            <p className="text-sm mb-1">
              <span className="font-medium">Meetup:</span> {formatDateTime(portBattle.meetupTime)}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Battle Start:</span> {formatDateTime(portBattle.battleStartTime)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Location:</span> {portBattle.meetupLocation}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Command Structure</h3>
            {portBattle.commanderName && (
              <p className="text-sm mb-1">
                <span className="font-medium">PB Commander:</span> {portBattle.commanderName}
              </p>
            )}
            {portBattle.secondICName && (
              <p className="text-sm mb-1">
                <span className="font-medium">2nd IC:</span> {portBattle.secondICName}
              </p>
            )}
            {portBattle.reqCommanderName && (
              <p className="text-sm mb-1">
                <span className="font-medium">REQ Commander:</span> {portBattle.reqCommanderName}
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Created by:</span> {portBattle.creator.username}
            </p>
          </div>
        </div>
      </div>

      {/* Fleets */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Fleets</h3>

        {portBattle.fleetSetups.length === 0 ? (
          <p className="text-gray-600">No fleets configured.</p>
        ) : (
          <div className="space-y-6">
            {portBattle.fleetSetups
              .sort((a, b) => a.setupOrder - b.setupOrder)
              .map((setup) => (
                <div key={setup.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold">
                      {setup.setupName}
                      {!setup.isActive && <span className="text-gray-500 ml-2">(Inactive)</span>}
                    </h4>
                  </div>

                  <div className="grid gap-4">
                    {setup.roles
                      .sort((a, b) => a.roleOrder - b.roleOrder)
                      .map((role) => (
                        <div
                          key={role.id}
                          className="border border-gray-200 rounded p-3"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, role.id)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">
                              {role.shipName} (BR: {role.brValue})
                            </h5>
                            <span className="text-sm text-gray-600">
                              {role.signups.filter(s => s.status === 'APPROVED').length} / 1 filled
                            </span>
                          </div>

                          <div className="space-y-2">
                            {role.signups.map((signup) => (
                              <div
                                key={signup.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, signup)}
                                className={`p-2 rounded border cursor-move ${
                                  signup.status === 'APPROVED' ? 'bg-green-50 border-green-200' :
                                  signup.status === 'DENIED' ? 'bg-red-50 border-red-200' :
                                  signup.status === 'STANDBY' ? 'bg-yellow-50 border-yellow-200' :
                                  'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      {signup.captainName} ({signup.clanName})
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {signup.shipName} ({signup.books} books)
                                    </p>
                                    {signup.alternateShip && (
                                      <p className="text-sm text-gray-500">
                                        Alt: {signup.alternateShip} ({signup.alternateBooks} books)
                                      </p>
                                    )}
                                    {signup.comments && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        "{signup.comments}"
                                      </p>
                                    )}
                                    {signup.willingToScreen && (
                                      <p className="text-xs text-blue-600 mt-1">
                                        Willing to screen
                                      </p>
                                    )}
                                  </div>
                                  <div className="ml-4 space-x-1">
                                    {signup.status !== 'APPROVED' && (
                                      <button
                                        onClick={() => updateSignupStatus(signup.id, 'APPROVED')}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                      >
                                        Approve
                                      </button>
                                    )}
                                    {signup.status !== 'STANDBY' && (
                                      <button
                                        onClick={() => updateSignupStatus(signup.id, 'STANDBY')}
                                        className="bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
                                      >
                                        Standby
                                      </button>
                                    )}
                                    {signup.status !== 'DENIED' && (
                                      <button
                                        onClick={() => updateSignupStatus(signup.id, 'DENIED')}
                                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                      >
                                        Deny
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Screening Fleets */}
      {portBattle.screeningFleets.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Screening Fleets</h3>
          <div className="space-y-4">
            {portBattle.screeningFleets.map((fleet) => (
              <div key={fleet.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold">
                    {fleet.fleetType} - {fleet.nation}
                  </h4>
                  <span className="text-sm text-gray-600">
                    {fleet.signups.length} signups
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  Ships Required: {fleet.shipsRequired}
                </p>

                {fleet.observation && (
                  <p className="text-sm text-gray-600 mb-2">
                    Observation: {fleet.observation}
                  </p>
                )}

                {fleet.commanderName && (
                  <p className="text-sm text-gray-600 mb-3">
                    Commander: {fleet.commanderName}
                  </p>
                )}

                <div className="space-y-2">
                  {fleet.signups.map((signup) => (
                    <div
                      key={signup.id}
                      className={`p-2 rounded border ${
                        signup.status === 'APPROVED' ? 'bg-green-50 border-green-200' :
                        signup.status === 'DENIED' ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {signup.captainName} ({signup.clanName})
                          </p>
                          <p className="text-sm text-gray-600">Status: {signup.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
