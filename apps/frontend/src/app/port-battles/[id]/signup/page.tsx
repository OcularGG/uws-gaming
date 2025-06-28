'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ships, defaultClans, shipBRValues } from '@/lib/portBattleData'

interface PortBattle {
  id: string
  portName: string
  meetupTime: string
  battleStartTime: string
  isDeepWater: boolean
  brLimit: number
  status: string
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
  status: string
}

interface ScreeningFleet {
  id: string
  fleetType: string
  nation: string
  signups: ScreeningSignup[]
}

interface ScreeningSignup {
  id: string
  captainName: string
  clanName: string
  status: string
}

interface SignupFormData {
  captainName: string
  clanName: string
  shipName: string
  books: number
  alternateShip: string
  alternateBooks: number
  willingToScreen: boolean
  comments: string
  fleetRoleId: string
  captainsCode?: string
}

export default function PortBattleSignupPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [portBattle, setPortBattle] = useState<PortBattle | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCodeField, setShowCodeField] = useState(false)

  const [formData, setFormData] = useState<SignupFormData>({
    captainName: '',
    clanName: '',
    shipName: '',
    books: 0,
    alternateShip: '',
    alternateBooks: 0,
    willingToScreen: false,
    comments: '',
    fleetRoleId: '',
    captainsCode: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchPortBattle()
    }
  }, [params.id])

  useEffect(() => {
    if (session?.user?.name) {
      setFormData(prev => ({
        ...prev,
        captainName: session.user.name || ''
      }))
    }
  }, [session])

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

  const handleInputChange = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-populate books when ship is selected
    if (field === 'shipName' && value) {
      // For now, default to 5 books - this should be customizable
      setFormData(prev => ({
        ...prev,
        books: 5
      }))
    }

    // Auto-populate alternate books when alternate ship is selected
    if (field === 'alternateShip' && value) {
      // For now, default to 5 books - this should be customizable
      setFormData(prev => ({
        ...prev,
        alternateBooks: 5
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (!formData.fleetRoleId) {
        throw new Error('Please select a fleet role to sign up for')
      }

      const response = await fetch('/api/port-battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          portBattleId: params.id,
          ...formData
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit signup')
      }

      // Redirect to port battle detail page
      router.push(`/port-battles/${params.id}`)
    } catch (err) {
      console.error('Error submitting signup:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit signup')
    } finally {
      setSubmitting(false)
    }
  }

  const getAvailableShips = () => {
    if (!portBattle) return []

    // For now, return all ships - in the future we might filter by deep/shallow water
    return ships.map(shipName => ({
      name: shipName,
      br: shipBRValues[shipName] || 0
    }))
  }

  const isRoleFull = (role: FleetRole) => {
    return role.signups.filter(s => s.status === 'APPROVED').length >= 1
  }

  const isAlreadySignedUp = (role: FleetRole) => {
    return role.signups.some(s => s.captainName === formData.captainName)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Signup</h1>
          <p className="text-gray-600 mb-4">Please sign in to sign up for port battles.</p>
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
          <h1 className="text-3xl font-bold mb-4">Port Battle Signup</h1>
          <p>Loading port battle...</p>
        </div>
      </div>
    )
  }

  if (error || !portBattle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Signup</h1>
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

  if (portBattle.status !== 'ACTIVE') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Signup</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            This port battle is not accepting signups (Status: {portBattle.status})
          </div>
          <div className="mt-4">
            <Link href={`/port-battles/${portBattle.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Port Battle
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const availableShips = getAvailableShips()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href={`/port-battles/${portBattle.id}`} className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Back to Port Battle Details
          </Link>
          <h1 className="text-3xl font-bold">Sign Up for {portBattle.portName}</h1>
        </div>

        {/* Port Battle Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Battle Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm mb-1">
                <span className="font-medium">Port:</span> {portBattle.portName}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Type:</span> {portBattle.isDeepWater ? 'Deep Water' : 'Shallow Water'}
              </p>
              <p className="text-sm">
                <span className="font-medium">BR Limit:</span> {portBattle.brLimit}
              </p>
            </div>
            <div>
              <p className="text-sm mb-1">
                <span className="font-medium">Meetup:</span> {formatDateTime(portBattle.meetupTime)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Battle Start:</span> {formatDateTime(portBattle.battleStartTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Signup Form</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Captain Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Captain Name *
                </label>
                <input
                  type="text"
                  value={formData.captainName}
                  onChange={(e) => handleInputChange('captainName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clan *
                </label>
                <select
                  value={formData.clanName}
                  onChange={(e) => handleInputChange('clanName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Clan</option>
                  {defaultClans.map((clan: any) => (
                    <option key={clan.tag} value={clan.tag}>
                      [{clan.tag}] {clan.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fleet Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fleet Role *
              </label>
              <div className="space-y-3">
                {portBattle.fleetSetups
                  .filter(setup => setup.isActive)
                  .sort((a, b) => a.setupOrder - b.setupOrder)
                  .map((setup) => (
                    <div key={setup.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{setup.setupName}</h3>
                      <div className="grid gap-2">
                        {setup.roles
                          .sort((a, b) => a.roleOrder - b.roleOrder)
                          .map((role) => {
                            const isFull = isRoleFull(role)
                            const alreadySignedUp = isAlreadySignedUp(role)
                            const disabled = isFull || alreadySignedUp

                            return (
                              <label
                                key={role.id}
                                className={`flex items-center p-2 border rounded cursor-pointer ${
                                  formData.fleetRoleId === role.id ? 'border-blue-500 bg-blue-50' :
                                  disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' :
                                  'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="fleetRoleId"
                                  value={role.id}
                                  checked={formData.fleetRoleId === role.id}
                                  onChange={(e) => handleInputChange('fleetRoleId', e.target.value)}
                                  disabled={disabled}
                                  className="mr-3"
                                />
                                <div className="flex-1">
                                  <span className="font-medium">{role.shipName}</span>
                                  <span className="text-gray-600 ml-2">(BR: {role.brValue})</span>
                                  {isFull && <span className="text-red-600 ml-2">(FULL)</span>}
                                  {alreadySignedUp && <span className="text-orange-600 ml-2">(Already signed up)</span>}
                                </div>
                              </label>
                            )
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Ship Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Ship *
                </label>
                <select
                  value={formData.shipName}
                  onChange={(e) => handleInputChange('shipName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Ship</option>
                  {availableShips.map((ship: any) => (
                    <option key={ship.name} value={ship.name}>
                      {ship.name} (BR: {ship.br})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Books for Primary Ship *
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={formData.books}
                  onChange={(e) => handleInputChange('books', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Alternate Ship */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Ship (Optional)
                </label>
                <select
                  value={formData.alternateShip}
                  onChange={(e) => handleInputChange('alternateShip', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Alternate Ship</option>
                  {availableShips.map((ship: any) => (
                    <option key={ship.name} value={ship.name}>
                      {ship.name} (BR: {ship.br})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Books for Alternate Ship
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={formData.alternateBooks}
                  onChange={(e) => handleInputChange('alternateBooks', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.alternateShip}
                />
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.willingToScreen}
                  onChange={(e) => handleInputChange('willingToScreen', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Willing to screen if needed</span>
              </label>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments (Optional)
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional comments or information..."
              />
            </div>

            {/* Captains Code */}
            <div>
              <div className="flex items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Captain's Code (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowCodeField(!showCodeField)}
                  className="ml-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  {showCodeField ? 'Hide' : 'Show'}
                </button>
              </div>
              {showCodeField && (
                <input
                  type="text"
                  value={formData.captainsCode}
                  onChange={(e) => handleInputChange('captainsCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter captain's code if you have one"
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Signup'}
              </button>
              <Link
                href={`/port-battles/${portBattle.id}`}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
