'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
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

export default function PortBattlesPage() {
  const { data: session } = useSession()
  const [portBattles, setPortBattles] = useState<PortBattle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPortBattles()
  }, [])

  const fetchPortBattles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/port-battles?action=list')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPortBattles(data.portBattles || [])
    } catch (err) {
      console.error('Error fetching port battles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch port battles')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Management</h1>
          <p className="text-gray-600 mb-4">Please sign in to access the Port Battle system.</p>
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
          <h1 className="text-3xl font-bold mb-4">Port Battle Management</h1>
          <p>Loading port battles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Management</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
          <button
            onClick={fetchPortBattles}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Port Battle Management</h1>
        <div className="space-x-4">
          <Link href="/port-battles/calendar" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Calendar View
          </Link>
          <Link href="/port-battles/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Port Battle
          </Link>
        </div>
      </div>

      {portBattles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No port battles found.</p>
          <Link href="/port-battles/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create First Port Battle
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {portBattles.map((portBattle) => (
            <div key={portBattle.id} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{portBattle.portName}</h2>
                  <p className="text-gray-600">Created by: {portBattle.creator.username}</p>
                  <p className="text-sm text-gray-500">
                    {portBattle.isDeepWater ? 'Deep Water' : 'Shallow Water'} • BR Limit: {portBattle.brLimit}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-sm ${
                    portBattle.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    portBattle.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {portBattle.status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Schedule</h3>
                  <p className="text-sm">
                    <span className="font-medium">Meetup:</span> {formatDateTime(portBattle.meetupTime)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Battle Start:</span> {formatDateTime(portBattle.battleStartTime)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Location:</span> {portBattle.meetupLocation}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Command Structure</h3>
                  {portBattle.commanderName && (
                    <p className="text-sm">
                      <span className="font-medium">PB Commander:</span> {portBattle.commanderName}
                    </p>
                  )}
                  {portBattle.secondICName && (
                    <p className="text-sm">
                      <span className="font-medium">2nd IC:</span> {portBattle.secondICName}
                    </p>
                  )}
                  {portBattle.reqCommanderName && (
                    <p className="text-sm">
                      <span className="font-medium">REQ Commander:</span> {portBattle.reqCommanderName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Fleet Setups: {portBattle.fleetSetups.length} •
                  Screening Fleets: {portBattle.screeningFleets.length}
                </div>
                <div className="space-x-2">
                  <Link
                    href={`/port-battles/${portBattle.id}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/port-battles/${portBattle.id}/signup`}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
