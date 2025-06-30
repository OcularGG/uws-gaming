'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { defaultClans } from '@/lib/portBattleData'

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
  willingToScreen: boolean
  comments: string
  fleetRoleId: string
  captainsCode?: string
  contactInfo?: string // Discord username for external signups
  isExternalSignup: boolean
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
  const [isValidCode, setIsValidCode] = useState(false)
  const [codeValidated, setCodeValidated] = useState(false)
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState<SignupFormData>({
    captainName: '',
    clanName: '',
    willingToScreen: false,
    comments: '',
    fleetRoleId: '',
    captainsCode: '',
    contactInfo: '',
    isExternalSignup: false
  })

  useEffect(() => {
    if (params.id) {
      fetchPortBattle()
    }

    // Check for Captain's Code in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      setFormData(prev => ({
        ...prev,
        captainsCode: code,
        isExternalSignup: true
      }))
      setShowCodeField(true)
      validateCaptainsCode(code)
    }
  }, [params.id])

  useEffect(() => {
    if (session?.user && !formData.isExternalSignup) {
      setFormData(prev => ({
        ...prev,
        captainName: session.user.name || session.user.username || '',
        // TODO: Get clan name from user profile when implemented
        clanName: 'UWS' // Default for now
      }))
    }
  }, [session, formData.isExternalSignup])

  const fetchPortBattle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/port-battles?action=get&id=${params.id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Port battle data received:', data.portBattle)
      console.log('Fleet setups:', data.portBattle?.fleetSetups)
      setPortBattle(data.portBattle)
    } catch (err) {
      console.error('Error fetching port battle:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch port battle')
    } finally {
      setLoading(false)
    }
  }

  const validateCaptainsCode = async (code: string) => {
    if (!code || !portBattle) return

    try {
      const response = await fetch(`/api/port-battles?action=validateCode&id=${params.id}&code=${code}`)
      const data = await response.json()

      if (response.ok && data.valid) {
        setIsValidCode(true)
        setCodeValidated(true)
        setError(null)
      } else {
        setIsValidCode(false)
        setCodeValidated(true)
        setError('Invalid Captain\'s Code. Please check the code and try again.')
      }
    } catch (err) {
      console.error('Error validating code:', err)
      setIsValidCode(false)
      setCodeValidated(true)
      setError('Error validating Captain\'s Code.')
    }
  }

  const handleInputChange = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roleId)) {
        newSet.delete(roleId)
      } else {
        newSet.add(roleId)
      }
      return newSet
    })
  }

  const handleRoleRequest = async (fleetRoleId: string) => {
    if (!formData.captainName || !formData.clanName) {
      setError('Please fill in your captain name and clan before requesting a role.')
      return
    }

    // For external signups, require Discord username
    if (formData.isExternalSignup && !formData.contactInfo) {
      setError('Please provide your Discord username.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/port-battles/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portBattleId: params.id,
          fleetRoleId,
          captainName: formData.captainName,
          clanName: formData.clanName,
          willingToScreen: formData.willingToScreen,
          comments: formData.comments,
          captainsCode: formData.captainsCode,
          contactInfo: formData.contactInfo,
          isExternalSignup: formData.isExternalSignup
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit role request')
      }

      // Refresh the port battle data to show the new signup
      await fetchPortBattle()

      // Show success message
      const commentInfo = formData.comments ?
        ` Your comments and information have been included in the request.` :
        ` You can add comments next time to provide more information to battle commanders.`
      alert(`Role request submitted successfully! Battle commanders will review your request.${commentInfo}`)
    } catch (err) {
      console.error('Error submitting role request:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit role request')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Check if user is logged in OR has a valid external signup code
  const hasValidAccess = session || (formData.isExternalSignup && isValidCode && codeValidated)

  if (!hasValidAccess && !showCodeField) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Signup</h1>
          <div className="space-y-4">
            <p className="text-gray-600">Please sign in to sign up for port battles, or enter a Captain's Code if you have one.</p>

            <div className="space-x-4">
              <Link href="/api/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Sign In
              </Link>
              <button
                onClick={() => setShowCodeField(true)}
                className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
              >
                I have a Captain's Code
              </button>
            </div>

            {showCodeField && (
              <div className="mt-6 max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Captain's Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.captainsCode || ''}
                    onChange={(e) => {
                      const code = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        captainsCode: code,
                        isExternalSignup: !!code
                      }))
                      if (code) {
                        validateCaptainsCode(code)
                      }
                    }}
                    placeholder="Enter Captain's Code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {codeValidated && !isValidCode && (
                  <p className="text-red-600 text-sm mt-1">Invalid code. Please check and try again.</p>
                )}
                {codeValidated && isValidCode && (
                  <p className="text-green-600 text-sm mt-1">Valid code! You can now sign up for this battle.</p>
                )}
              </div>
            )}
          </div>
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

  // Check if the battle has already started (no signups after battle start time)
  const battleStartTime = new Date(portBattle.battleStartTime)
  const now = new Date()
  const hasStarted = battleStartTime <= now

  if (hasStarted || portBattle.status === 'COMPLETED' || portBattle.status === 'CANCELLED') {
    const getMessage = () => {
      if (hasStarted) return 'This port battle has already started and is no longer accepting signups.'
      if (portBattle.status === 'COMPLETED') return 'This port battle has been completed.'
      if (portBattle.status === 'CANCELLED') return 'This port battle has been cancelled.'
      return `This port battle is not accepting signups (Status: ${portBattle.status})`
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Port Battle Signup</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            {getMessage()}
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
          <h2 className="text-xl font-bold mb-4">Captain Information</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-6">
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

            {/* Available Fleet Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Fleet Roles
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Click on a role name to expand and view detailed requirements including perks, consumables, and ship specifications.
                Then click "Request Role" to submit your application for that position. Battle commanders will review and approve requests.
              </p>
              <div className="space-y-4">
                {portBattle.fleetSetups
                  .filter(setup => setup.isActive)
                  .sort((a, b) => a.setupOrder - b.setupOrder)
                  .map((setup) => (
                    <div key={setup.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 text-lg">{setup.setupName}</h3>
                      <div className="grid gap-3">
                        {setup.roles
                          .sort((a, b) => a.roleOrder - b.roleOrder)
                          .map((role) => {
                            const currentSignups = role.signups || []
                            const approvedSignups = currentSignups.filter(s => s.status === 'APPROVED')
                            const pendingSignups = currentSignups.filter(s => s.status === 'PENDING')
                            const userSignup = currentSignups.find(s => s.captainName === formData.captainName)
                            const hasAvailableSlot = approvedSignups.length === 0 // Assuming 1 slot per role for now

                            return (
                              <div
                                key={role.id}
                                className="border rounded-lg bg-white"
                              >
                                {/* Role Header */}
                                <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => toggleRoleExpansion(role.id)}
                                        className="flex items-center gap-2 text-left"
                                      >
                                        <span className="text-lg font-medium">{role.shipName}</span>
                                        <svg
                                          className={`w-5 h-5 transition-transform ${
                                            expandedRoles.has(role.id) ? 'rotate-90' : ''
                                          }`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </button>
                                      <div className="flex gap-2">
                                        {approvedSignups.length > 0 && (
                                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                            ✓ Filled
                                          </span>
                                        )}
                                        {pendingSignups.length > 0 && (
                                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                            {pendingSignups.length} Pending
                                          </span>
                                        )}
                                        {hasAvailableSlot && (
                                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                            Available
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {approvedSignups.length > 0 && (
                                      <div className="mt-1 text-sm text-gray-600">
                                        Assigned: {approvedSignups.map(s => `${s.captainName} [${s.clanName}]`).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    {userSignup ? (
                                      <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                          userSignup.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                          userSignup.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {userSignup.status === 'APPROVED' ? '✓ Approved' :
                                           userSignup.status === 'PENDING' ? '⏳ Pending' :
                                           '✗ Denied'}
                                        </span>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleRoleRequest(role.id)}
                                        disabled={!formData.captainName || !formData.clanName}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                      >
                                        Request Role
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Role Details */}
                                {expandedRoles.has(role.id) && (
                                  <div className="border-t bg-gray-50 p-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      {/* Perks Section */}
                                      <div>
                                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Required Perks</h4>
                                        <div className="space-y-1 text-sm">
                                          <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            <span>Gunnery Level 5</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            <span>Sailing Level 5</span>
                                          </div>
                                          {role.brValue >= 70 && (
                                            <>
                                              <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                <span>Leadership Level 3</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                <span>Master Carpenter Level 2 (recommended)</span>
                                              </div>
                                            </>
                                          )}
                                          {role.brValue >= 50 && role.brValue < 70 && (
                                            <div className="flex items-center gap-2">
                                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                              <span>Leadership Level 2 (recommended)</span>
                                            </div>
                                          )}
                                          {role.brValue >= 80 && (
                                            <div className="flex items-center gap-2">
                                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                              <span>Fleet Tactician Level 1 (recommended)</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Consumables Section */}
                                      <div>
                                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Consumables</h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="font-medium">Ammunition:</span>
                                            <div className="ml-2 text-gray-600">
                                              <div className="font-semibold">• Broadsides: {Math.round(role.brValue * 2)}</div>
                                              <div>• Chain Balls: {Math.round(role.brValue * 0.7)}</div>
                                              <div>• Round Balls: {Math.round(role.brValue * 2.5)}</div>
                                              <div>• Gunpowder: {Math.round(role.brValue * 4)}</div>
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium">Repairs:</span>
                                            <div className="ml-2 text-gray-600">
                                              <div className="font-semibold">• Repair Kits: {Math.round(role.brValue * 0.15)}</div>
                                              <div>• Hull Repairs: {Math.round(role.brValue * 0.2)}</div>
                                              <div>• Rig Repairs: {Math.round(role.brValue * 0.15)}</div>
                                              <div>• Medicine: {Math.round(role.brValue * 0.25)}</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Ship Specifications */}
                                      <div>
                                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Ship Requirements</h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="font-medium">Frame & Planking:</span>
                                            <div className="ml-2 text-gray-600">
                                              {role.brValue >= 80 ? (
                                                <>
                                                  <div>• Live Oak Frame</div>
                                                  <div>• Teak Planking</div>
                                                </>
                                              ) : role.brValue >= 60 ? (
                                                <>
                                                  <div>• White Oak Frame</div>
                                                  <div>• Fir Planking</div>
                                                </>
                                              ) : (
                                                <>
                                                  <div>• Oak Frame</div>
                                                  <div>• Fir Planking</div>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Role Comments */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Role Instructions</h4>
                                      <p className="text-sm text-gray-600">
                                        {role.brValue >= 80 ?
                                          `This role requires an experienced captain capable of leading from the front. You will be positioned in the line of battle and expected to engage enemy ships of the line. Coordination with fleet signals is essential. As a flagship-class vessel, you may be called upon to relay commands.` :
                                          role.brValue >= 60 ?
                                          `This role requires a skilled captain for line of battle operations. You will support the main fleet and engage enemy vessels as directed. Maintain formation and respond to fleet signals promptly.` :
                                          role.brValue >= 40 ?
                                          `This frigate role requires agility and tactical awareness. You will provide screening, scouting, and support for the main battle line. Be prepared for independent action and pursuit missions.` :
                                          `This role involves reconnaissance, message relay, and support operations. Maintain distance from the main engagement while providing intelligence and supporting smaller actions.`
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ))}
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
                Comments and Additional Information
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Please include details about your experience, ship fittings, availability, and any other relevant information.
                These comments will be submitted with your role request and reviewed by battle commanders.
              </p>
              <textarea
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Example: I have 150+ hours in Naval Action, experienced with line ship operations, can be online 30 minutes before battle start, ship is fitted with live oak/teak and purple mods..."
              />
            </div>

            {/* Contact Info for External Signups */}
            {formData.isExternalSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discord Username *
                </label>
                <input
                  type="text"
                  value={formData.contactInfo || ''}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YourDiscordUsername"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used to contact you about the port battle.
                </p>
              </div>
            )}

            {/* Captains Code */}
            {session && (
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
                    value={formData.captainsCode || ''}
                    onChange={(e) => handleInputChange('captainsCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter captain's code if you have one"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
