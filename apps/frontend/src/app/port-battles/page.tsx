'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { getAuthHeaders } from '@/hooks/useAuthenticatedFetch'
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
    if (session) {
      fetchPortBattles()
    }
  }, [session])

  const fetchPortBattles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if we have session before making the request
      if (!session) {
        setError('Authentication required')
        return
      }

      const response = await fetch('/api/port-battles?action=list', {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        setError('Authentication failed. Please sign in again.')
        return
      }

      if (response.status === 500) {
        // Fallback for development when database isn't ready
        console.warn('Database not ready, using mock data for development')
        setPortBattles([
          {
            id: 'mock-1',
            portName: 'Port Royal',
            meetupTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            battleStartTime: new Date(Date.now() + 90000000).toISOString(), // Tomorrow + 1 hour
            isDeepWater: true,
            meetupLocation: 'Kingston Harbor',
            brLimit: 12000,
            commanderName: 'Admiral Nelson',
            secondICName: 'Captain Hardy',
            status: 'upcoming',
            creator: { username: 'FleetCommand' },
            fleetSetups: [],
            screeningFleets: []
          }
        ])
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`)
      }

      const data = await response.json()
      setPortBattles(data.portBattles || [])
    } catch (err) {
      console.error('Error fetching port battles:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch port battles'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="neo-brutal-box bg-sail-white p-8 text-center max-w-md">
            <div className="text-4xl mb-4">⚔️</div>
            <h1 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Admiral Credentials Required
            </h1>
            <p className="text-navy-dark/70 mb-6">
              Please authenticate to access the Port Battle Command Center
            </p>
            <Link 
              href="/api/auth/signin" 
              className="bg-navy-dark text-sail-white px-6 py-3 rounded border-2 border-navy-dark hover:bg-navy font-bold transition-all"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Report for Duty
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="neo-brutal-box bg-sail-white p-8 text-center">
            <div className="text-4xl mb-4 animate-pulse">⚓</div>
            <h1 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Loading Battle Plans...
            </h1>
            <p className="text-navy-dark/70">Gathering intelligence from the fleet</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="neo-brutal-box bg-sail-white p-8 text-center max-w-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Fleet Communication Error
            </h1>
            <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded mb-4">
              <strong>Battle Report:</strong> {error}
            </div>
            <button
              onClick={fetchPortBattles}
              className="bg-blue-600 text-white px-6 py-2 rounded border-2 border-blue-700 hover:bg-blue-700 font-bold transition-all"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Retry Communication
            </button>
            <div className="mt-4">
              <Link 
                href="/admin" 
                className="text-navy-dark hover:text-navy underline"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Return to Command Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            ⚔️ PORT BATTLE COMMAND ⚔️
          </h1>
          <p className="text-sail-white/90 text-xl mb-2" style={{fontFamily: 'Crimson Text, serif'}}>
            Strategic Naval Operations & Battle Coordination
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="neo-brutal-box bg-sail-white p-4">
            <div className="flex gap-4 flex-wrap justify-center">
              <Link 
                href="/port-battles/calendar" 
                className="bg-green-600 text-white px-6 py-2 rounded border-2 border-green-700 hover:bg-green-700 font-bold transition-all"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                📅 Battle Calendar
              </Link>
              <Link 
                href="/port-battles/create" 
                className="bg-blue-600 text-white px-6 py-2 rounded border-2 border-blue-700 hover:bg-blue-700 font-bold transition-all"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                ⚔️ Plan New Battle
              </Link>
              <Link 
                href="/admin" 
                className="bg-navy-dark text-sail-white px-6 py-2 rounded border-2 border-navy-dark hover:bg-navy font-bold transition-all"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                ⚓ Command Center
              </Link>
            </div>
          </div>
        </div>

        {portBattles.length === 0 ? (
          <div className="neo-brutal-box bg-sail-white p-8 text-center">
            <div className="text-4xl mb-4">🏴‍☠️</div>
            <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              No Active Port Battles
            </h2>
            <p className="text-navy-dark/70 mb-6">
              The seas are calm, Admiral. No battles currently scheduled.
            </p>
            <Link 
              href="/port-battles/create" 
              className="bg-blue-600 text-white px-6 py-3 rounded border-2 border-blue-700 hover:bg-blue-700 font-bold transition-all"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              ⚔️ Plan First Battle
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
          {portBattles.map((portBattle) => (
            <div key={portBattle.id} className="neo-brutal-box bg-sail-white p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    ⚔️ {portBattle.portName}
                  </h2>
                  <p className="text-navy-dark/70 mb-1">
                    <span className="font-medium">Fleet Admiral:</span> {portBattle.creator.username}
                  </p>
                  <p className="text-sm text-navy-dark/60">
                    {portBattle.isDeepWater ? '🌊 Deep Water' : '🏝️ Shallow Water'} • 
                    <span className="font-medium"> BR Limit: {portBattle.brLimit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded border-2 text-sm font-bold ${
                    portBattle.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-400' :
                    portBattle.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border-blue-400' :
                    'bg-brass/20 text-navy-dark border-brass'
                  }`} style={{fontFamily: 'Cinzel, serif'}}>
                    {portBattle.status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-navy-dark/5 p-4 rounded border-2 border-navy-dark/20">
                  <h3 className="font-bold text-navy-dark mb-3 flex items-center gap-2" style={{fontFamily: 'Cinzel, serif'}}>
                    📅 Battle Schedule
                  </h3>
                  <p className="text-sm mb-2">
                    <span className="font-bold text-navy-dark">Muster:</span> {formatDateTime(portBattle.meetupTime)}
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-bold text-navy-dark">Battle Commences:</span> {formatDateTime(portBattle.battleStartTime)}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-navy-dark">Rally Point:</span> {portBattle.meetupLocation}
                  </p>
                </div>

                <div className="bg-brass/10 p-4 rounded border-2 border-brass/30">
                  <h3 className="font-bold text-navy-dark mb-3 flex items-center gap-2" style={{fontFamily: 'Cinzel, serif'}}>
                    ⭐ Command Structure
                  </h3>
                  {portBattle.commanderName && (
                    <p className="text-sm mb-2">
                      <span className="font-bold text-navy-dark">Port Battle Commander:</span> {portBattle.commanderName}
                    </p>
                  )}
                  {portBattle.secondICName && (
                    <p className="text-sm mb-2">
                      <span className="font-bold text-navy-dark">Second in Command:</span> {portBattle.secondICName}
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
    </div>
  )
}
