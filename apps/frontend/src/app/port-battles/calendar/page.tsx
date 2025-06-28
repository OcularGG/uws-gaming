'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import Link from 'next/link'

interface UpcomingBattle {
  id: string
  portName: string
  meetupTime: string
  battleStartTime: string
  isDeepWater: boolean
  meetupLocation: string
  brLimit: number
  commanderName?: string
  creator: {
    username: string
  }
}

export default function PortBattleCalendarPage() {
  const { data: session } = useSession()
  const [upcomingBattles, setUpcomingBattles] = useState<UpcomingBattle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUpcomingBattles()
  }, [])

  const fetchUpcomingBattles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/port-battles?action=calendar')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setUpcomingBattles(data.upcomingBattles || [])
    } catch (err) {
      console.error('Error fetching upcoming battles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming battles')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeUntilBattle = (battleStartTime: string) => {
    const now = new Date()
    const battleTime = new Date(battleStartTime)
    const diffMs = battleTime.getTime() - now.getTime()

    if (diffMs < 0) return 'Past'

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffDays > 0) return `${diffDays}d ${diffHours}h`
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`
    return `${diffMinutes}m`
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Calendar</h1>
          <p className="text-gray-600 mb-4">Please sign in to access the Port Battle calendar.</p>
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
          <h1 className="text-3xl font-bold mb-4">Port Battle Calendar</h1>
          <p>Loading upcoming battles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Calendar</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
          <button
            onClick={fetchUpcomingBattles}
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
        <h1 className="text-3xl font-bold">Port Battle Calendar</h1>
        <div className="space-x-4">
          <Link href="/port-battles" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to Port Battles
          </Link>
          <Link href="/port-battles/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Port Battle
          </Link>
        </div>
      </div>

      {upcomingBattles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No upcoming port battles scheduled.</p>
          <Link href="/port-battles/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Schedule First Battle
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBattles.map((battle) => {
            const timeUntil = getTimeUntilBattle(battle.battleStartTime)
            const isUpcoming = timeUntil !== 'Past'

            return (
              <div
                key={battle.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  isUpcoming ? 'border-l-green-500' : 'border-l-gray-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{battle.portName}</h2>
                      <span className={`px-2 py-1 rounded text-sm ${
                        isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isUpcoming ? `In ${timeUntil}` : 'Past'}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date:</span>
                        <br />
                        {formatDate(battle.battleStartTime)}
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">Meetup:</span>
                        <br />
                        {formatTime(battle.meetupTime)}
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">Battle Start:</span>
                        <br />
                        {formatTime(battle.battleStartTime)}
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">Location:</span>
                        <br />
                        {battle.meetupLocation}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        <span className="font-medium">Type:</span> {battle.isDeepWater ? 'Deep Water' : 'Shallow Water'}
                      </span>
                      <span>
                        <span className="font-medium">BR Limit:</span> {battle.brLimit}
                      </span>
                      {battle.commanderName && (
                        <span>
                          <span className="font-medium">Commander:</span> {battle.commanderName}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-sm text-gray-500">
                      Organized by: {battle.creator.username}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/port-battles/${battle.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 text-center"
                    >
                      View Details
                    </Link>
                    {isUpcoming && (
                      <Link
                        href={`/port-battles/${battle.id}/signup`}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 text-center"
                      >
                        Sign Up
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {upcomingBattles.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Stats</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Upcoming:</span> {upcomingBattles.length}
            </div>
            <div>
              <span className="font-medium">Next Battle:</span> {
                upcomingBattles.length > 0 ? getTimeUntilBattle(upcomingBattles[0].battleStartTime) : 'None'
              }
            </div>
            <div>
              <span className="font-medium">This Week:</span> {
                upcomingBattles.filter(battle => {
                  const battleDate = new Date(battle.battleStartTime)
                  const oneWeekFromNow = new Date()
                  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
                  return battleDate <= oneWeekFromNow
                }).length
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
