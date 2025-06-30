'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { isAdmin as checkIsAdmin } from '@/lib/adminUtils'
import { portBattlesApi } from '@/lib/adminApi'
import Link from 'next/link'

interface PortBattle {
  id: string
  name: string
  description: string
  port: string
  server: string
  scheduledTime: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  maxParticipants?: number
  requirements?: string
  rewards?: string
  createdAt: string
  createdBy: {
    id: string
    username: string
    email: string
  }
  participants: Array<{
    userId: string
    shipType?: string
    notes?: string
    joinedAt: string
    user: {
      id: string
      username: string
      email: string
    }
  }>
  _count: {
    participants: number
  }
}

interface AttendanceRecord {
  id: string
  userId: string
  attended: boolean
  shipType?: string
  notes?: string
  user: {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
  }
}

interface AAR {
  id: string
  title: string
  summary: string
  outcome: 'victory' | 'defeat' | 'draw' | 'cancelled'
  lessons: string
  recommendations: string
  createdAt: string
  author: {
    id: string
    username: string
    email: string
  }
}

export default function PortBattleManagerPage() {
  const { data: session, status } = useSession()
  const [portBattles, setPortBattles] = useState<PortBattle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'active' | 'completed' | 'cancelled'>('scheduled')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBattle, setSelectedBattle] = useState<string | null>(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showAARModal, setShowAARModal] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [aars, setAARs] = useState<AAR[]>([])

  useEffect(() => {
    if (session?.user && checkIsAdmin(session.user)) {
      fetchPortBattles()
    }
  }, [session])

  const fetchPortBattles = async () => {
    try {
      const response = await portBattlesApi.getBattles()
      setPortBattles(response.items)
    } catch (error) {
      console.error('Error fetching port battles:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePortBattleStatus = async (battleId: string, newStatus: PortBattle['status']) => {
    try {
      const response = await portBattlesApi.updateBattle(battleId, { status: newStatus })
      if (response.success) {
        setPortBattles(portBattles.map(battle =>
          battle.id === battleId ? { ...battle, status: newStatus } : battle
        ))
      }
    } catch (error) {
      console.error('Error updating port battle status:', error)
    }
  }

  const deletePortBattle = async (battleId: string) => {
    if (confirm('Are you sure you want to delete this port battle? This action cannot be undone.')) {
      try {
        const response = await portBattlesApi.deleteBattle(battleId)
        if (response.success) {
          setPortBattles(portBattles.filter(battle => battle.id !== battleId))
        }
      } catch (error) {
        console.error('Error deleting port battle:', error)
      }
    }
  }

  const openAttendanceModal = async (battleId: string) => {
    setSelectedBattle(battleId)
    try {
      const response = await portBattlesApi.getAttendance(battleId)
      setAttendanceRecords(response)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
    setShowAttendanceModal(true)
  }

  const openAARModal = async (battleId: string) => {
    setSelectedBattle(battleId)
    try {
      const response = await portBattlesApi.getAARs(battleId)
      setAARs(response)
    } catch (error) {
      console.error('Error fetching AARs:', error)
    }
    setShowAARModal(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center">
        <div className="text-sail-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session?.user || !checkIsAdmin(session.user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center">
        <div className="neo-brutal-box bg-sail-white p-8 text-center">
          <h1 className="static-red-gradient text-2xl font-bold mb-4">Access Denied</h1>
          <Link href="/" className="bg-brass hover:bg-brass-bright text-white px-6 py-3 rounded-md">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const filteredPortBattles = portBattles.filter(battle =>
    filter === 'all' || battle.status === filter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      {/* Header */}
      <div className="bg-navy-dark/50 backdrop-blur-sm border-b border-sail-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="static-red-gradient text-3xl font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                Port Battle Manager
              </h1>
              <p className="text-sail-white/70 mt-2" style={{fontFamily: 'Crimson Text, serif'}}>
                Manage and oversee all port battle events
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-brass hover:bg-brass-bright text-white px-4 py-2 rounded-md font-semibold transition-all"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Create Port Battle
              </button>
              <Link
                href="/admin"
                className="bg-navy-dark hover:bg-navy text-white px-4 py-2 rounded-md font-semibold transition-all"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⚔️</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Total Battles</p>
                <p className="static-red-gradient text-2xl font-bold">{portBattles.length}</p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🔄</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Scheduled</p>
                <p className="text-blue-600 text-2xl font-bold">
                  {portBattles.filter(b => b.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🟢</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Active</p>
                <p className="text-green-600 text-2xl font-bold">
                  {portBattles.filter(b => b.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Completed</p>
                <p className="text-gray-600 text-2xl font-bold">
                  {portBattles.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="neo-brutal-box bg-sail-white p-1 mb-6 inline-flex rounded-lg">
          {(['all', 'scheduled', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                filter === tab
                  ? 'bg-brass text-white'
                  : 'text-navy-dark hover:bg-navy-dark/5'
              }`}
              style={{fontFamily: 'Cinzel, serif'}}
            >
              {tab} ({portBattles.filter(b => tab === 'all' || b.status === tab).length})
            </button>
          ))}
        </div>

        {/* Port Battles List */}
        <div className="space-y-6">
          {filteredPortBattles.length === 0 ? (
            <div className="neo-brutal-box bg-sail-white p-8 text-center">
              <div className="text-6xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                No Port Battles Found
              </h3>
              <p className="text-navy-dark/70">
                {filter === 'scheduled' ? 'No scheduled port battles found.' : `No ${filter} port battles found.`}
              </p>
            </div>
          ) : (
            filteredPortBattles.map((battle) => (
              <div key={battle.id} className="neo-brutal-box bg-sail-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                        {battle.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(battle.status)}`}>
                        {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-navy-dark/70">
                      <div>
                        <span className="font-medium">Port:</span> {battle.port}
                      </div>
                      <div>
                        <span className="font-medium">Server:</span> {battle.server}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(battle.scheduledTime).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {new Date(battle.scheduledTime).toLocaleTimeString()}
                      </div>
                      <div>
                        <span className="font-medium">Participants:</span> {battle._count.participants}/{battle.maxParticipants || 'Unlimited'}
                      </div>
                      <div>
                        <span className="font-medium">Creator:</span> {battle.createdBy.username}
                      </div>
                    </div>

                    <p className="text-navy-dark mt-3">{battle.description}</p>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <div className="flex flex-col space-y-2">
                      {battle.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => updatePortBattleStatus(battle.id, 'active')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                          >
                            Start Battle
                          </button>
                          <button
                            onClick={() => updatePortBattleStatus(battle.id, 'cancelled')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {battle.status === 'active' && (
                        <button
                          onClick={() => updatePortBattleStatus(battle.id, 'completed')}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                        >
                          End Battle
                        </button>
                      )}

                      {/* Attendance tracking - available for completed battles */}
                      {battle.status === 'completed' && (
                        <button
                          onClick={() => openAttendanceModal(battle.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                        >
                          Track Attendance
                        </button>
                      )}

                      {/* AAR - available for completed battles */}
                      {battle.status === 'completed' && (
                        <button
                          onClick={() => openAARModal(battle.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                        >
                          View/Add AAR
                        </button>
                      )}

                      <button className="bg-brass hover:bg-brass-bright text-white px-3 py-1 rounded text-sm font-medium transition-all">
                        Edit
                      </button>

                      <button
                        onClick={() => deletePortBattle(battle.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                      >
                        Delete
                      </button>

                      <Link
                        href={`/port-battles/${battle.id}`}
                        className="bg-navy-dark hover:bg-navy text-white px-3 py-1 rounded text-sm font-medium transition-all text-center"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Participants Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-navy-dark/70 mb-1">
                    <span>Participants</span>
                    <span>{battle._count.participants}/{battle.maxParticipants || 'Unlimited'}</span>
                  </div>
                  <div className="w-full bg-navy-dark/10 rounded-full h-2">
                    <div
                      className="bg-brass h-2 rounded-full transition-all"
                      style={{
                        width: battle.maxParticipants
                          ? `${Math.min((battle._count.participants / battle.maxParticipants) * 100, 100)}%`
                          : `${Math.min((battle._count.participants / 50) * 100, 100)}%` // Default to 50 if unlimited
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attendance Tracking Modal */}
      {showAttendanceModal && selectedBattle && (
        <AttendanceModal
          battleId={selectedBattle}
          battle={portBattles.find(b => b.id === selectedBattle)}
          attendanceRecords={attendanceRecords}
          onClose={() => {
            setShowAttendanceModal(false)
            setSelectedBattle(null)
            setAttendanceRecords([])
          }}
          onSave={async (attendanceData) => {
            try {
              const response = await portBattlesApi.markAttendance(selectedBattle, attendanceData)
              if (response.success) {
                // Refresh attendance data
                const updatedAttendance = await portBattlesApi.getAttendance(selectedBattle)
                setAttendanceRecords(updatedAttendance)
              }
            } catch (error) {
              console.error('Error saving attendance:', error)
            }
          }}
        />
      )}

      {/* After Action Report Modal */}
      {showAARModal && selectedBattle && (
        <AARModal
          battleId={selectedBattle}
          battle={portBattles.find(b => b.id === selectedBattle)}
          aars={aars}
          onClose={() => {
            setShowAARModal(false)
            setSelectedBattle(null)
            setAARs([])
          }}
          onSave={async (aarData) => {
            try {
              const response = await portBattlesApi.createAAR(selectedBattle, aarData)
              if (response.success) {
                // Refresh AAR data
                const updatedAARs = await portBattlesApi.getAARs(selectedBattle)
                setAARs(updatedAARs)
              }
            } catch (error) {
              console.error('Error saving AAR:', error)
            }
          }}
        />
      )}
    </div>
  )
}

// Attendance Tracking Modal Component
function AttendanceModal({
  battleId,
  battle,
  attendanceRecords,
  onClose,
  onSave
}: {
  battleId: string
  battle?: PortBattle
  attendanceRecords: AttendanceRecord[]
  onClose: () => void
  onSave: (attendanceData: Array<{userId: string, attended: boolean, shipType?: string, notes?: string}>) => void
}) {
  const [localAttendance, setLocalAttendance] = useState<Record<string, {attended: boolean, shipType?: string, notes?: string}>>({})

  useEffect(() => {
    // Initialize local attendance state from existing records
    const initial: Record<string, {attended: boolean, shipType?: string, notes?: string}> = {}
    attendanceRecords.forEach(record => {
      initial[record.userId] = {
        attended: record.attended,
        shipType: record.shipType,
        notes: record.notes
      }
    })

    // Add all participants who signed up but don't have attendance records yet
    battle?.participants.forEach(participant => {
      if (!initial[participant.userId]) {
        initial[participant.userId] = {
          attended: false,
          shipType: participant.shipType,
          notes: participant.notes
        }
      }
    })

    setLocalAttendance(initial)
  }, [attendanceRecords, battle])

  const handleSave = () => {
    const attendanceData = Object.entries(localAttendance).map(([userId, data]) => ({
      userId,
      ...data
    }))
    onSave(attendanceData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-sail-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-navy-dark/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                Track Attendance
              </h2>
              <p className="text-navy-dark/70 mt-1">
                {battle?.name} - {battle && new Date(battle.scheduledTime).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-navy-dark hover:text-red-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {battle?.participants.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-navy-dark/70">No participants signed up for this battle.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {battle?.participants.map((participant) => (
                  <div key={participant.userId} className="border border-navy-dark/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-navy-dark">
                          {participant.user.username}
                        </h4>
                        <p className="text-sm text-navy-dark/70">
                          {participant.user.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-navy-dark">Attended:</label>
                        <input
                          type="checkbox"
                          checked={localAttendance[participant.userId]?.attended || false}
                          onChange={(e) => setLocalAttendance(prev => ({
                            ...prev,
                            [participant.userId]: {
                              ...prev[participant.userId],
                              attended: e.target.checked
                            }
                          }))}
                          className="h-4 w-4 text-brass focus:ring-brass border-navy-dark/30 rounded"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm text-navy-dark/70 mb-1">Ship Type:</label>
                        <input
                          type="text"
                          value={localAttendance[participant.userId]?.shipType || ''}
                          onChange={(e) => setLocalAttendance(prev => ({
                            ...prev,
                            [participant.userId]: {
                              ...prev[participant.userId],
                              shipType: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-1 border border-navy-dark/30 rounded-md text-sm"
                          placeholder="e.g., Frigate, Ship of the Line"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-navy-dark/70 mb-1">Notes:</label>
                        <textarea
                          value={localAttendance[participant.userId]?.notes || ''}
                          onChange={(e) => setLocalAttendance(prev => ({
                            ...prev,
                            [participant.userId]: {
                              ...prev[participant.userId],
                              notes: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-1 border border-navy-dark/30 rounded-md text-sm"
                          rows={2}
                          placeholder="Performance notes, issues, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-navy-dark/20 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-navy-dark/30 text-navy-dark hover:bg-navy-dark/5 rounded-md font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-brass hover:bg-brass-bright text-white rounded-md font-medium transition-all"
            style={{fontFamily: 'Cinzel, serif'}}
          >
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  )
}

// After Action Report Modal Component
function AARModal({
  battleId,
  battle,
  aars,
  onClose,
  onSave
}: {
  battleId: string
  battle?: PortBattle
  aars: AAR[]
  onClose: () => void
  onSave: (aarData: {title: string, summary: string, outcome: 'victory' | 'defeat' | 'draw' | 'cancelled', lessons: string, recommendations: string}) => void
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    outcome: 'victory' as 'victory' | 'defeat' | 'draw' | 'cancelled',
    lessons: '',
    recommendations: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setFormData({
      title: '',
      summary: '',
      outcome: 'victory',
      lessons: '',
      recommendations: ''
    })
    setShowCreateForm(false)
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'victory': return 'bg-green-100 text-green-800'
      case 'defeat': return 'bg-red-100 text-red-800'
      case 'draw': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-sail-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-navy-dark/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                After Action Reports
              </h2>
              <p className="text-navy-dark/70 mt-1">
                {battle?.name} - {battle && new Date(battle.scheduledTime).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-navy-dark hover:text-red-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Existing AARs */}
          {aars.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Existing Reports
              </h3>
              <div className="space-y-4">
                {aars.map((aar) => (
                  <div key={aar.id} className="border border-navy-dark/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-navy-dark">{aar.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(aar.outcome)}`}>
                            {aar.outcome.charAt(0).toUpperCase() + aar.outcome.slice(1)}
                          </span>
                          <span className="text-sm text-navy-dark/70">
                            by {aar.author.username} on {new Date(aar.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-navy-dark mb-1">Summary:</h5>
                        <p className="text-navy-dark/70">{aar.summary}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-navy-dark mb-1">Lessons Learned:</h5>
                        <p className="text-navy-dark/70">{aar.lessons}</p>
                      </div>
                      <div className="md:col-span-2">
                        <h5 className="font-medium text-navy-dark mb-1">Recommendations:</h5>
                        <p className="text-navy-dark/70">{aar.recommendations}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create New AAR Button/Form */}
          {!showCreateForm ? (
            <div className="text-center py-8">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-brass hover:bg-brass-bright text-white px-6 py-3 rounded-md font-semibold transition-all"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Create New After Action Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Create New AAR
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-navy-dark/30 rounded-md focus:ring-2 focus:ring-brass focus:border-transparent"
                    placeholder="AAR Title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2">Outcome</label>
                  <select
                    required
                    value={formData.outcome}
                    onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-navy-dark/30 rounded-md focus:ring-2 focus:ring-brass focus:border-transparent"
                  >
                    <option value="victory">Victory</option>
                    <option value="defeat">Defeat</option>
                    <option value="draw">Draw</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">Summary</label>
                <textarea
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full px-3 py-2 border border-navy-dark/30 rounded-md focus:ring-2 focus:ring-brass focus:border-transparent"
                  rows={4}
                  placeholder="Detailed summary of the battle events..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">Lessons Learned</label>
                <textarea
                  required
                  value={formData.lessons}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessons: e.target.value }))}
                  className="w-full px-3 py-2 border border-navy-dark/30 rounded-md focus:ring-2 focus:ring-brass focus:border-transparent"
                  rows={3}
                  placeholder="Key lessons learned from this battle..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">Recommendations</label>
                <textarea
                  required
                  value={formData.recommendations}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                  className="w-full px-3 py-2 border border-navy-dark/30 rounded-md focus:ring-2 focus:ring-brass focus:border-transparent"
                  rows={3}
                  placeholder="Recommendations for future battles..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 border border-navy-dark/30 text-navy-dark hover:bg-navy-dark/5 rounded-md font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brass hover:bg-brass-bright text-white rounded-md font-medium transition-all"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  Save AAR
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-6 border-t border-navy-dark/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-navy-dark hover:bg-navy text-white rounded-md font-medium transition-all"
            style={{fontFamily: 'Cinzel, serif'}}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
