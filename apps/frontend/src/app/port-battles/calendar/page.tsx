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
  battleType: 'OFFENSIVE' | 'DEFENSIVE' | 'FLAG_PLANT' | 'SCREENING'
  creator: {
    username: string
  }
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  battles: UpcomingBattle[]
}

const BATTLE_TYPES = [
  { key: 'OFFENSIVE', label: 'Offensive', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
  { key: 'DEFENSIVE', label: 'Defensive', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
  { key: 'FLAG_PLANT', label: 'Flag Plant', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  { key: 'SCREENING', label: 'Screening', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' }
] as const

export default function PortBattleCalendarPage() {
  const { data: session } = useSession()
  const [upcomingBattles, setUpcomingBattles] = useState<UpcomingBattle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [visibleBattleTypes, setVisibleBattleTypes] = useState<Set<string>>(
    new Set(['OFFENSIVE', 'DEFENSIVE', 'FLAG_PLANT', 'SCREENING'])
  )

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

  const toggleBattleType = (battleType: string) => {
    const newVisible = new Set(visibleBattleTypes)
    if (newVisible.has(battleType)) {
      newVisible.delete(battleType)
    } else {
      newVisible.add(battleType)
    }
    setVisibleBattleTypes(newVisible)
  }

  const filteredBattles = upcomingBattles.filter(battle =>
    visibleBattleTypes.has(battle.battleType)
  )

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of the month and calculate offset
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday

    const days: CalendarDay[] = []
    const currentDateObj = new Date(startDate)

    // Generate 42 days (6 weeks) to fill the calendar
    for (let i = 0; i < 42; i++) {
      const dayBattles = filteredBattles.filter(battle => {
        const battleDate = new Date(battle.battleStartTime)
        return battleDate.toDateString() === currentDateObj.toDateString()
      })

      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === month,
        battles: dayBattles
      })

      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getBattleTypeInfo = (battleType: string) => {
    return BATTLE_TYPES.find(type => type.key === battleType) || BATTLE_TYPES[0]
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Port Battle Calendar
            </h1>
            <p className="text-sail-white/80">Loading naval operations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Port Battle Calendar
            </h1>
            <div className="neo-brutal-box bg-red-100 border-red-400 text-red-700 p-4 mb-4">
              Error: {error}
            </div>
            <button
              onClick={fetchUpcomingBattles}
              className="neo-brutal-button bg-brass text-navy-dark px-6 py-3"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const calendarDays = generateCalendarDays()
  const monthYearFormat = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-sail-white" style={{fontFamily: 'Cinzel, serif'}}>
            Port Battle Calendar
          </h1>
          <div className="flex gap-3">
            <Link
              href="/port-battles"
              className="neo-brutal-button bg-cannon-smoke text-sail-white px-4 py-2"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Back to Port Battles
            </Link>
            {session?.user?.role === 'admin' && (
              <Link
                href="/port-battles/create"
                className="neo-brutal-button bg-brass text-navy-dark px-4 py-2"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Create Battle
              </Link>
            )}
          </div>
        </div>

        {/* Battle Type Filters */}
        <div className="neo-brutal-box bg-sail-white p-6 mb-6">
          <h2 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Battle Type Filters
          </h2>
          <div className="flex flex-wrap gap-3">
            {BATTLE_TYPES.map(type => {
              const isActive = visibleBattleTypes.has(type.key)
              const battleCount = upcomingBattles.filter(b => b.battleType === type.key).length
              return (
                <button
                  key={type.key}
                  onClick={() => toggleBattleType(type.key)}
                  className={`neo-brutal-button px-4 py-2 flex items-center gap-2 transition-all ${
                    isActive
                      ? `${type.bgColor} ${type.textColor} border-2 border-current`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  <div className={`w-3 h-3 rounded-full ${type.color} ${!isActive ? 'opacity-50' : ''}`}></div>
                  {type.label} ({battleCount})
                </button>
              )
            })}
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="neo-brutal-box bg-sail-white p-4 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigateMonth('prev')}
              className="neo-brutal-button bg-cannon-smoke text-sail-white px-4 py-2"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              ← Previous
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                {monthYearFormat}
              </h2>
              <button
                onClick={goToToday}
                className="text-brass hover:text-brass-bright text-sm underline"
                style={{fontFamily: 'Crimson Text, serif'}}
              >
                Today
              </button>
            </div>

            <button
              onClick={() => navigateMonth('next')}
              className="neo-brutal-button bg-cannon-smoke text-sail-white px-4 py-2"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="neo-brutal-box bg-sail-white p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-bold text-navy-dark border-b-2 border-navy-dark/20" style={{fontFamily: 'Cinzel, serif'}}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isToday = day.date.toDateString() === new Date().toDateString()
              const hasBattles = day.battles.length > 0

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-navy-dark/10 ${
                    !day.isCurrentMonth
                      ? 'bg-gray-50 text-gray-400'
                      : isToday
                        ? 'bg-brass/20 border-brass border-2'
                        : 'bg-white hover:bg-sandstone-50'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-brass-bright' : 'text-navy-dark'}`} style={{fontFamily: 'Cinzel, serif'}}>
                    {day.date.getDate()}
                  </div>

                  {/* Battle Events */}
                  <div className="space-y-1">
                    {day.battles.slice(0, 3).map(battle => {
                      const typeInfo = getBattleTypeInfo(battle.battleType)
                      return (
                        <Link
                          key={battle.id}
                          href={`/port-battles/${battle.id}`}
                          className={`block p-1 rounded text-xs ${typeInfo.bgColor} ${typeInfo.textColor} hover:opacity-80 transition-opacity`}
                          style={{fontFamily: 'Crimson Text, serif'}}
                        >
                          <div className="font-semibold truncate">{battle.portName}</div>
                          <div className="text-xs opacity-75">{formatTime(battle.battleStartTime)}</div>
                        </Link>
                      )
                    })}

                    {day.battles.length > 3 && (
                      <div className="text-xs text-gray-600 text-center" style={{fontFamily: 'Crimson Text, serif'}}>
                        +{day.battles.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Battles Summary */}
        {filteredBattles.length > 0 && (
          <div className="neo-brutal-box bg-sail-white p-6 mt-6">
            <h2 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Next 5 Battles
            </h2>
            <div className="space-y-3">
              {filteredBattles.slice(0, 5).map(battle => {
                const typeInfo = getBattleTypeInfo(battle.battleType)
                const timeUntil = Math.ceil((new Date(battle.battleStartTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

                return (
                  <div key={battle.id} className="flex items-center justify-between p-3 bg-sandstone-50 rounded border">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${typeInfo.color}`}></div>
                      <div>
                        <div className="font-semibold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                          {battle.portName}
                        </div>
                        <div className="text-sm text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>
                          {new Date(battle.battleStartTime).toLocaleDateString()} at {formatTime(battle.battleStartTime)}
                          {timeUntil > 0 && ` (${timeUntil} days)`}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/port-battles/${battle.id}`}
                        className="neo-brutal-button bg-brass text-navy-dark px-3 py-1 text-sm"
                        style={{fontFamily: 'Cinzel, serif'}}
                      >
                        Details
                      </Link>
                      <Link
                        href={`/port-battles/${battle.id}/signup`}
                        className="neo-brutal-button bg-green-600 text-white px-3 py-1 text-sm"
                        style={{fontFamily: 'Cinzel, serif'}}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="neo-brutal-box bg-sail-white p-6 mt-6">
          <h2 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Battle Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {BATTLE_TYPES.map(type => {
              const count = upcomingBattles.filter(b => b.battleType === type.key).length
              return (
                <div key={type.key} className={`p-4 rounded ${type.bgColor} border-l-4 ${type.color.replace('bg-', 'border-')}`}>
                  <div className={`text-2xl font-bold ${type.textColor}`} style={{fontFamily: 'Cinzel, serif'}}>
                    {count}
                  </div>
                  <div className={`text-sm ${type.textColor}`} style={{fontFamily: 'Crimson Text, serif'}}>
                    {type.label} Battles
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
