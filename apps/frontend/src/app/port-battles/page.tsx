'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { getAuthHeaders } from '@/hooks/useAuthenticatedFetch'
import Link from 'next/link'
import './matchup-cards.css'

// Countdown component
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        }
      }
      return null
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return <div className="text-red-400 font-bold">Battle Started!</div>
  }

  return (
    <div className="flex gap-2 text-xs font-bold text-white/90">
      <div className="bg-black/30 px-2 py-1 rounded">
        <span className="text-yellow-400">{timeLeft.days}</span>d
      </div>
      <div className="bg-black/30 px-2 py-1 rounded">
        <span className="text-yellow-400">{timeLeft.hours}</span>h
      </div>
      <div className="bg-black/30 px-2 py-1 rounded">
        <span className="text-yellow-400">{timeLeft.minutes}</span>m
      </div>
      <div className="bg-black/30 px-2 py-1 rounded">
        <span className="text-yellow-400">{timeLeft.seconds}</span>s
      </div>
    </div>
  )
}

interface PortBattle {
  id: string
  portName: string
  meetupTime: string
  battleStartTime: string
  battleType: 'offensive' | 'defensive' | 'screening' | 'flag-plant'
  ourRole: 'attackers' | 'defenders'
  enemyNation: 'France' | 'Great Britain' | 'USA'
  enemyClanTag: string
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

        // Create timestamps in UTC for demo purposes
        const now = new Date()
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
        const battleTime = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000) // 2 hours after meetup

        setPortBattles([
          {
            id: 'mock-1',
            portName: 'Port Royal',
            meetupTime: tomorrow.toISOString(), // UTC+0
            battleStartTime: battleTime.toISOString(), // UTC+0
            battleType: 'offensive' as const,
            ourRole: 'attackers' as const,
            enemyNation: 'Great Britain' as const,
            enemyClanTag: 'RN',
            isDeepWater: true,
            meetupLocation: 'Kingston Harbor',
            brLimit: 12000,
            commanderName: 'Admiral Nelson',
            secondICName: 'Captain Hardy',
            reqCommanderName: '',
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
    const date = new Date(dateString)
    // Show both UTC and local time
    const utcTime = date.toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
    const localTime = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    // If local time is different from UTC, show both
    if (utcTime !== localTime) {
      return `${localTime} (${utcTime})`
    }
    return utcTime
  }

  // Function to convert local time to UTC (for when creating port battles)
  const convertToUTC = (localDateString: string, timezone: string) => {
    const date = new Date(localDateString)
    return date.toISOString() // This gives us UTC
  }

  const getFlagUrl = (nation: string) => {
    switch (nation) {
      case 'Great Britain':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Flag_of_Great_Britain_%281707%E2%80%931800%29.svg/1024px-Flag_of_Great_Britain_%281707%E2%80%931800%29.svg.png'
      case 'France':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Flag_of_France_%281790%E2%80%931794%29.svg/2560px-Flag_of_France_%281790%E2%80%931794%29.svg.png'
      case 'USA':
        return 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Betsy_Ross_flag.svg'
      case 'Pirates':
        return 'https://c4.wallpaperflare.com/wallpaper/916/539/808/pirate-flag-skull-and-bones-wallpaper-preview.jpg'
      default:
        return 'https://c4.wallpaperflare.com/wallpaper/916/539/808/pirate-flag-skull-and-bones-wallpaper-preview.jpg'
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="neo-brutal-box bg-sail-white p-8 text-center max-w-md">
            <div className="text-4xl mb-4">🏴‍☠️</div>
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
          <h1 className="text-5xl font-bold mb-4 hero-title-gradient" style={{fontFamily: 'Cinzel, serif'}}>
            PORT BATTLE COMMAND
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
                Calendar
              </Link>
              <Link
                href="/port-battles/create"
                className="bg-blue-600 text-white px-6 py-2 rounded border-2 border-blue-700 hover:bg-blue-700 font-bold transition-all"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Plan New Battle
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
              Plan First Battle
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
          {portBattles?.map((portBattle) => {
            // Defensive checks to prevent runtime errors
            if (!portBattle || !portBattle.id) return null;

            // Get team colors
            const getTeamColors = (nation: string, isOurTeam: boolean) => {
              if (isOurTeam) {
                return {
                  primary: '#D4AF37', // Gold
                  secondary: '#8B4513', // Saddle Brown
                  accent: '#FF6B35' // Orange Red
                }
              }

              switch (nation) {
                case 'Great Britain':
                  return {
                    primary: '#003366', // Navy Blue
                    secondary: '#DC143C', // Crimson
                    accent: '#FFFFFF' // White
                  }
                case 'France':
                  return {
                    primary: '#002868', // Dark Blue
                    secondary: '#ED2939', // Red
                    accent: '#FFFFFF' // White
                  }
                case 'USA':
                  return {
                    primary: '#002868', // Navy Blue
                    secondary: '#BF0A30', // Red
                    accent: '#FFFFFF' // White
                  }
                default:
                  return {
                    primary: '#2C3E50',
                    secondary: '#E74C3C',
                    accent: '#FFFFFF'
                  }
              }
            }

            const ourColors = getTeamColors('Pirates', true)
            const enemyColors = getTeamColors(portBattle.enemyNation || 'Great Britain', false)

            return (
            <div key={portBattle.id} className="relative overflow-hidden">
              {/* Full-bleed Matchup Card */}
              <div className="matchup-card">
                <div className="relative h-96 overflow-hidden rounded-3xl">

                  {/* Particle Background */}
                  <div className="particle-bg">
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                  </div>

                  {/* Background Layers */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>

                  {/* Team Backgrounds with Flags */}
                  <div className="absolute inset-0 flex">
                    {/* Our Team Side */}
                    <div className="flex-1 relative overflow-hidden team-pirates">
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-500"
                        style={{
                          backgroundImage: `url(${getFlagUrl('Pirates')})`
                        }}
                      ></div>
                      <div
                        className="absolute inset-0 opacity-70 team-bg-pulse"
                        style={{
                          background: `linear-gradient(135deg, ${ourColors.primary}90, ${ourColors.secondary}70, ${ourColors.accent}20)`
                        }}
                      ></div>
                    </div>

                    {/* Enemy Team Side */}
                    <div className={`flex-1 relative overflow-hidden ${
                      portBattle.enemyNation === 'Great Britain' ? 'team-britain' :
                      portBattle.enemyNation === 'France' ? 'team-france' :
                      portBattle.enemyNation === 'USA' ? 'team-usa' : 'team-britain'
                    }`}>
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-500"
                        style={{
                          backgroundImage: `url(${getFlagUrl(portBattle.enemyNation || 'Great Britain')})`
                        }}
                      ></div>
                      <div
                        className="absolute inset-0 opacity-70 team-bg-pulse"
                        style={{
                          background: `linear-gradient(225deg, ${enemyColors.primary}90, ${enemyColors.secondary}70, ${enemyColors.accent}20)`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Content Layer */}
                  <div className="relative z-10 h-full flex">

                    {/* Our Team Section */}
                    <div className="flex-1 flex flex-col justify-center items-center text-white p-8 relative">
                      {/* Team Name */}
                      <h2 className="text-4xl font-black mb-3 text-center drop-shadow-lg" style={{fontFamily: 'Cinzel, serif'}}>
                        PIRATES
                      </h2>

                      {/* Clan Tag */}
                      <div
                        className="font-black text-lg animate-bounce drop-shadow-lg"
                        style={{
                          color: '#D4AF37', // Gold color
                          animationDuration: '3s',
                          animationIterationCount: 'infinite'
                        }}
                      >
                        UWS
                      </div>
                    </div>

                    {/* Center VS Section */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="relative">
                        {/* VS Text */}
                        <div className="text-6xl font-black text-white drop-shadow-lg" style={{fontFamily: 'Cinzel, serif'}}>
                          VS
                        </div>
                      </div>
                    </div>

                    {/* Enemy Team Section */}
                    <div className="flex-1 flex flex-col justify-center items-center text-white p-8 relative">
                      {/* Team Name */}
                      <h2 className="text-4xl font-black mb-3 text-center drop-shadow-lg" style={{fontFamily: 'Cinzel, serif'}}>
                        {(portBattle.enemyNation || 'Great Britain').toUpperCase()}
                      </h2>

                      {/* Clan Tag */}
                      <div
                        className="font-black text-lg animate-bounce drop-shadow-lg"
                        style={{
                          color: '#D4AF37', // Gold color for enemy clan too
                          animationDuration: '4s',
                          animationIterationCount: 'infinite'
                        }}
                      >
                        {portBattle.enemyClanTag || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {/* Top Info Bar */}
                  <div className="absolute top-0 left-0 right-0 p-6 z-10">
                    <div className="flex justify-between items-center">
                      {/* Battle Type */}
                      <div className="flex gap-3">
                        <span className="glass-panel text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                          {(portBattle.battleType || 'unknown').toUpperCase()}
                        </span>
                      </div>

                      {/* Port Name - Centered */}
                      <div className="absolute left-1/2 transform -translate-x-1/2">
                        <h1 className="text-2xl font-black text-white drop-shadow-lg text-center" style={{fontFamily: 'Cinzel, serif'}}>
                          BATTLE FOR {(portBattle.portName || 'UNKNOWN PORT').toUpperCase()}
                        </h1>
                      </div>

                      {/* Battle Time */}
                      <div className="text-right">
                        <div className="glass-panel text-white px-4 py-2 rounded-full text-sm font-bold mb-2">
                          {portBattle.battleStartTime ? formatDateTime(portBattle.battleStartTime) : 'TBD'}
                        </div>
                        {portBattle.battleStartTime && (
                          <CountdownTimer targetDate={portBattle.battleStartTime} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Removed hover effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 pointer-events-none"></div>
                </div>
              </div>

              {/* Action Buttons - Outside the card */}
              <div className="mt-6 mb-8 flex justify-center gap-4">
                <Link
                  href={`/port-battles/${portBattle.id}`}
                  className="action-button px-8 py-3 font-bold border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  VIEW DETAILS
                </Link>
                <Link
                  href={`/port-battles/${portBattle.id}/signup`}
                  className="action-button px-8 py-3 font-bold border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  SIGN UP FOR BATTLE
                </Link>
              </div>
            </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  )
}
