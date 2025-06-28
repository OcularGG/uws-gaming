'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PortAutocomplete from '@/components/PortAutocomplete'
import ShipAutocomplete from '@/components/ShipAutocomplete'
import PerkSelector from '@/components/PerkSelector'
import LoadCalculator from '@/components/LoadCalculator'
import { getShipByName, FRAME_OPTIONS, PLANKING_OPTIONS } from '@/data/ships'
import { type PerkSelection, MAX_PERK_POINTS, MAX_PERK_SLOTS } from '@/data/perks'

interface Port {
  id: string
  name: string
  region?: string
}

interface Clan {
  id: string
  name: string
}

interface FleetRole {
  shipName: string
  brValue: number
  frame?: string
  planking?: string
  perks: PerkSelection[]
  broadsides: number
  repairSets: number
}

interface FleetSetup {
  setupName: string
  roles: FleetRole[]
}

export default function CreatePortBattlePage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ports, setPorts] = useState<Port[]>([])
  const [clans, setClans] = useState<Clan[]>([])
  
  // State for collapsible sections
  const [expandedPerks, setExpandedPerks] = useState<{[key: string]: boolean}>({})
  const [expandedLoadCalculators, setExpandedLoadCalculators] = useState<{[key: string]: boolean}>({})

  const [formData, setFormData] = useState({
    portName: '',
    meetupTime: '',
    battleStartTime: '',
    battleType: 'offensive' as 'offensive' | 'defensive' | 'screening' | 'flag-plant',
    isDeepWater: true,
    meetupLocation: '',
    brLimit: 2500,
    commanderName: '',
    secondICName: '',
    reqCommanderName: ''
  })

  const [fleetSetups, setFleetSetups] = useState<FleetSetup[]>([
    {
      setupName: 'Main Fleet',
      roles: [
        { shipName: 'Victory', brValue: 216, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1 },
        { shipName: 'Bellona', brValue: 133, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1 },
        { shipName: 'Endymion', brValue: 85, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1 },
        { shipName: 'Trincomalee', brValue: 87, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1 }
      ]
    }
  ])

  useEffect(() => {
    fetchPorts()
    fetchClans()
  }, [])

  const fetchPorts = async () => {
    try {
      const response = await fetch('/api/port-battles?action=ports')
      if (response.ok) {
        const data = await response.json()
        setPorts(data.ports || [])
      }
    } catch (err) {
      console.error('Error fetching ports:', err)
    }
  }

  const fetchClans = async () => {
    try {
      const response = await fetch('/api/port-battles?action=clans')
      if (response.ok) {
        const data = await response.json()
        setClans(data.clans || [])
      }
    } catch (err) {
      console.error('Error fetching clans:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate meeting time is before battle start time
    if (new Date(formData.meetupTime) >= new Date(formData.battleStartTime)) {
      setError('Meeting time must be before battle start time')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/port-battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_port_battle',
          ...formData,
          fleetSetups
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create port battle')
      }

      const data = await response.json()
      router.push(`/port-battles/${data.portBattle.id}`)
    } catch (err) {
      console.error('Error creating port battle:', err)
      setError(err instanceof Error ? err.message : 'Failed to create port battle')
    } finally {
      setLoading(false)
    }
  }

  const addRole = (setupIndex: number) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].roles.push({ shipName: '', brValue: 0, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1 })
    setFleetSetups(newSetups)
  }

  const removeRole = (setupIndex: number, roleIndex: number) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].roles.splice(roleIndex, 1)
    setFleetSetups(newSetups)
  }

  const duplicateRole = (setupIndex: number, roleIndex: number) => {
    const newSetups = [...fleetSetups]
    const roleToDuplicate = { ...newSetups[setupIndex].roles[roleIndex] }
    newSetups[setupIndex].roles.splice(roleIndex + 1, 0, roleToDuplicate)
    setFleetSetups(newSetups)
  }

  const updateRole = (setupIndex: number, roleIndex: number, field: keyof FleetRole, value: string | number) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].roles[roleIndex] = {
      ...newSetups[setupIndex].roles[roleIndex],
      [field]: value
    }
    
    // Auto-update BR when ship name changes
    if (field === 'shipName' && typeof value === 'string') {
      const ship = getShipByName(value)
      if (ship) {
        newSetups[setupIndex].roles[roleIndex].brValue = ship.br
      }
    }
    
    setFleetSetups(newSetups)
  }

  const updateRolePerks = (setupIndex: number, roleIndex: number, perks: PerkSelection[]) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].roles[roleIndex] = {
      ...newSetups[setupIndex].roles[roleIndex],
      perks
    }
    setFleetSetups(newSetups)
  }

  const updateRoleLoad = (setupIndex: number, roleIndex: number, broadsides: number, repairSets: number) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].roles[roleIndex] = {
      ...newSetups[setupIndex].roles[roleIndex],
      broadsides,
      repairSets
    }
    setFleetSetups(newSetups)
  }

  const addFleetSetup = () => {
    setFleetSetups([...fleetSetups, {
      setupName: `Fleet Setup ${fleetSetups.length + 1}`,
      roles: []
    }])
  }

  const removeFleetSetup = (index: number) => {
    if (fleetSetups.length > 1) {
      const newSetups = [...fleetSetups]
      newSetups.splice(index, 1)
      setFleetSetups(newSetups)
    }
  }

  const getTotalBR = () => {
    return fleetSetups.reduce((total, setup) => {
      return total + setup.roles.reduce((setupTotal, role) => setupTotal + (role.brValue || 0), 0)
    }, 0)
  }

  const isOverBRLimit = () => {
    return getTotalBR() > formData.brLimit
  }

  const getShipCount = (setupIndex: number, shipName: string): number => {
    if (!shipName) return 0
    return fleetSetups[setupIndex].roles.filter(role => role.shipName === shipName).length
  }

  const getShipCountByName = (setupIndex: number): {[shipName: string]: number} => {
    const counts: {[shipName: string]: number} = {}
    fleetSetups[setupIndex].roles.forEach(role => {
      if (role.shipName) {
        counts[role.shipName] = (counts[role.shipName] || 0) + 1
      }
    })
    return counts
  }

  const togglePerks = (setupIndex: number, roleIndex: number) => {
    const key = `${setupIndex}-${roleIndex}-perks`
    setExpandedPerks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleLoadCalculator = (setupIndex: number, roleIndex: number) => {
    const key = `${setupIndex}-${roleIndex}-load`
    setExpandedLoadCalculators(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const updateRoleLoadout = (setupIndex: number, roleIndex: number, broadsides: number, repairSets: number) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].roles[roleIndex] = {
      ...newSetups[setupIndex].roles[roleIndex],
      broadsides,
      repairSets
    }
    setFleetSetups(newSetups)
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
            Create Port Battle
          </h1>
          <p className="text-navy-dark/70 mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
            Please sign in to create a port battle.
          </p>
          <Link 
            href="/api/auth/signin" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            style={{fontFamily: 'Cinzel, serif'}}
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
          Create Port Battle
        </h1>
        <Link 
          href="/port-battles" 
          className="bg-navy-dark text-sail-white px-4 py-2 rounded hover:bg-navy-dark/80 transition-colors"
          style={{fontFamily: 'Cinzel, serif'}}
        >
          Back to Port Battles
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-sail-white rounded-lg shadow-md p-6 border-2 border-navy-dark">
          <h2 className="text-xl font-semibold mb-4 text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Basic Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <PortAutocomplete
              label="Port"
              value={formData.portName}
              onChange={(value) => setFormData(prev => ({ ...prev, portName: value }))}
              placeholder="Start typing a port name..."
              required
            />

            <PortAutocomplete
              label="Meetup Location"
              value={formData.meetupLocation}
              onChange={(value) => setFormData(prev => ({ ...prev, meetupLocation: value }))}
              placeholder="Start typing a meetup location..."
              required
            />

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Battle Type *
              </label>
              <select
                value={formData.battleType}
                onChange={(e) => setFormData(prev => ({ ...prev, battleType: e.target.value as 'offensive' | 'defensive' | 'screening' | 'flag-plant' }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Crimson Text, serif'}}
                required
              >
                <option value="offensive">Offensive Port Battle</option>
                <option value="defensive">Defensive Port Battle</option>
                <option value="screening">Screening</option>
                <option value="flag-plant">Flag Plant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Water Type
              </label>
              <select
                value={formData.isDeepWater ? 'deep' : 'shallow'}
                onChange={(e) => setFormData(prev => ({ ...prev, isDeepWater: e.target.value === 'deep' }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Crimson Text, serif'}}
              >
                <option value="deep">Deep Water</option>
                <option value="shallow">Shallow Water</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Meetup Time *
              </label>
              <input
                type="datetime-local"
                value={formData.meetupTime}
                onChange={(e) => setFormData(prev => ({ ...prev, meetupTime: e.target.value }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Crimson Text, serif'}}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Battle Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.battleStartTime}
                onChange={(e) => setFormData(prev => ({ ...prev, battleStartTime: e.target.value }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Crimson Text, serif'}}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                BR Limit *
              </label>
              <input
                type="number"
                value={formData.brLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, brLimit: parseInt(e.target.value) }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Crimson Text, serif'}}
                min="500"
                max="5000"
                step="50"
                required
              />
            </div>
          </div>
        </div>

        {/* Command Structure */}
        <div className="bg-sail-white rounded-lg shadow-md p-6 border-2 border-navy-dark">
          <h2 className="text-xl font-semibold mb-4 text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Command Structure</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                PB Commander
              </label>
              <input
                type="text"
                value={formData.commanderName}
                onChange={(e) => setFormData(prev => ({ ...prev, commanderName: e.target.value }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
                placeholder="Admiral Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                2nd IC Commander
              </label>
              <input
                type="text"
                value={formData.secondICName}
                onChange={(e) => setFormData(prev => ({ ...prev, secondICName: e.target.value }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
                placeholder="Captain Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                REQ Commander
              </label>
              <input
                type="text"
                value={formData.reqCommanderName}
                onChange={(e) => setFormData(prev => ({ ...prev, reqCommanderName: e.target.value }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
                placeholder="Commander Name"
              />
            </div>
          </div>
        </div>

        {/* Fleet Setups */}
        <div className="bg-sail-white rounded-lg shadow-md p-6 border-2 border-navy-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Fleet Setups</h2>
            <div className="flex items-center gap-4">
              <div className={`text-sm ${isOverBRLimit() ? 'text-red-600 font-bold' : 'text-green-600'}`} style={{fontFamily: 'Crimson Text, serif'}}>
                Total BR: {getTotalBR()} / {formData.brLimit}
                {isOverBRLimit() && (
                  <span className="ml-2 bg-red-100 px-2 py-1 rounded text-red-700" style={{fontFamily: 'Cinzel, serif'}}>
                    Over by {getTotalBR() - formData.brLimit}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={addFleetSetup}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Add Fleet Setup
              </button>
            </div>
          </div>

          {fleetSetups.map((setup, setupIndex) => (
            <div key={setupIndex} className="border-2 border-navy-dark rounded-lg p-4 mb-4 bg-sail-white">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={setup.setupName}
                  onChange={(e) => {
                    const newSetups = [...fleetSetups]
                    newSetups[setupIndex].setupName = e.target.value
                    setFleetSetups(newSetups)
                  }}
                  className="text-lg font-medium border-2 border-navy-dark rounded px-2 py-1 bg-sail-white text-navy-dark focus:outline-none focus:border-brass transition-colors"
                  style={{fontFamily: 'Cinzel, serif'}}
                  placeholder="Fleet Setup Name"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addRole(setupIndex)}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    style={{fontFamily: 'Cinzel, serif'}}
                  >
                    Add Role
                  </button>
                  {fleetSetups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFleetSetup(setupIndex)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      style={{fontFamily: 'Cinzel, serif'}}
                    >
                      Remove Setup
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {setup.roles.map((role, roleIndex) => {
                  const shipCounts = getShipCountByName(setupIndex)
                  const currentShipCount = role.shipName ? shipCounts[role.shipName] : 0
                  const perksKey = `${setupIndex}-${roleIndex}-perks`
                  const loadKey = `${setupIndex}-${roleIndex}-load`
                  
                  return (
                  <div key={roleIndex} className="border border-navy-dark/30 rounded-lg p-3 bg-sail-white/50">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                        Ship #{roleIndex + 1}
                        {role.shipName && currentShipCount > 1 && (
                          <span className="ml-2 text-xs bg-brass/20 text-brass-dark px-2 py-1 rounded">
                            {role.shipName} x{currentShipCount}
                          </span>
                        )}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => duplicateRole(setupIndex, roleIndex)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                          style={{fontFamily: 'Cinzel, serif'}}
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRole(setupIndex, roleIndex)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                          style={{fontFamily: 'Cinzel, serif'}}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                          type="button"
                          onClick={() => removeRole(setupIndex, roleIndex)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                          style={{fontFamily: 'Cinzel, serif'}}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Ship Name */}
                      <div>
                        <label className="block text-xs font-medium text-navy-dark mb-1" style={{fontFamily: 'Cinzel, serif'}}>
                          Ship Name *
                        </label>
                        <ShipAutocomplete
                          value={role.shipName}
                          onChange={(value) => updateRole(setupIndex, roleIndex, 'shipName', value)}
                          placeholder="Enter ship name..."
                          className="border-navy-dark"
                          required
                          showBR={false}
                        />
                      </div>
                      
                      {/* Frame */}
                      <div>
                        <label className="block text-xs font-medium text-navy-dark mb-1" style={{fontFamily: 'Cinzel, serif'}}>
                          Frame
                        </label>
                        <select
                          value={role.frame || ''}
                          onChange={(e) => updateRole(setupIndex, roleIndex, 'frame', e.target.value)}
                          className="w-full border-2 border-navy-dark rounded px-2 py-1 focus:outline-none focus:border-brass transition-colors"
                          style={{fontFamily: 'Crimson Text, serif'}}
                        >
                          <option value="">Select Frame...</option>
                          {FRAME_OPTIONS.map(frame => (
                            <option key={frame} value={frame}>{frame}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Planking */}
                      <div>
                        <label className="block text-xs font-medium text-navy-dark mb-1" style={{fontFamily: 'Cinzel, serif'}}>
                          Planking
                        </label>
                        <select
                          value={role.planking || ''}
                          onChange={(e) => updateRole(setupIndex, roleIndex, 'planking', e.target.value)}
                          className="w-full border-2 border-navy-dark rounded px-2 py-1 focus:outline-none focus:border-brass transition-colors"
                          style={{fontFamily: 'Crimson Text, serif'}}
                        >
                          <option value="">Select Planking...</option>
                          {PLANKING_OPTIONS.map(planking => (
                            <option key={planking} value={planking}>{planking}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Perks Section */}
                    <div className="mt-4 border-t border-navy-dark/20 pt-4">
                      <h4 className="text-sm font-medium text-navy-dark mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                        Captain Perks
                      </h4>
                      <PerkSelector
                        perks={role.perks}
                        onChange={(perks) => updateRolePerks(setupIndex, roleIndex, perks)}
                        className="bg-sail-white/20 rounded p-3"
                      />
                    </div>
                  </div>
                ))}

                {setup.roles.length === 0 && (
                  <p className="text-navy-dark/60 text-sm" style={{fontFamily: 'Crimson Text, serif'}}>
                    No roles defined. Click "Add Role" to add ship requirements.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link
            href="/port-battles"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
            style={{fontFamily: 'Cinzel, serif'}}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || isOverBRLimit()}
            className={`px-6 py-2 rounded text-white transition-colors ${
              loading || isOverBRLimit()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            style={{fontFamily: 'Cinzel, serif'}}
          >
            {loading ? 'Creating...' : 'Create Port Battle'}
          </button>
        </div>
      </form>
    </div>
  )
}
