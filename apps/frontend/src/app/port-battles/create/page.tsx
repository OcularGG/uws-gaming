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
  comments?: string
}

interface FleetSetup {
  setupName: string
  fleetCommander?: string
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
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({})

  const [formData, setFormData] = useState({
    portName: '',
    meetupTime: '',
    battleStartTime: '',
    battleType: 'offensive' as 'offensive' | 'defensive' | 'screening' | 'flag-plant',
    ourRole: 'attackers' as 'attackers' | 'defenders',
    enemyNation: 'France' as 'France' | 'Great Britain' | 'USA',
    enemyClanTag: '',
    isDeepWater: true,
    meetupLocation: '',
    brLimit: 2500,
    commanderName: '',
    secondICName: '',
    reqCommanderName: '',
    additionalDetails: ''
  })

  const [fleetSetups, setFleetSetups] = useState<FleetSetup[]>([
    {
      setupName: 'Main Fleet',
      fleetCommander: '',
      roles: [
        { shipName: 'Victory', brValue: 216, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1, comments: '' },
        { shipName: 'Bellona', brValue: 133, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1, comments: '' },
        { shipName: 'Endymion', brValue: 85, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1, comments: '' },
        { shipName: 'Trincomalee', brValue: 87, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1, comments: '' }
      ]
    },
    {
      setupName: 'Enemy Fleet',
      fleetCommander: '',
      roles: [
        { shipName: '', brValue: 0, frame: '', planking: '', perks: [], broadsides: 1, repairSets: 1, comments: '' }
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
    if (!session) return

    setLoading(true)
    setError(null)

    try {
      const submitData = {
        ...formData,
        fleetSetups,
        totalBR: getTotalBR()
      }

      const response = await fetch('/api/port-battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/port-battles/${result.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create port battle')
      }
    } catch (err) {
      console.error('Error creating port battle:', err)
      setError('Failed to create port battle')
    } finally {
      setLoading(false)
    }
  }

  const updateRole = (setupIndex: number, roleIndex: number, field: keyof FleetRole, value: any) => {
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

  const updateFleetCommander = (setupIndex: number, value: string) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].fleetCommander = value
    setFleetSetups(newSetups)
  }

  const updateFleetSetupName = (setupIndex: number, value: string) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].setupName = value
    setFleetSetups(newSetups)
  }

  const addRole = (setupIndex: number) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].roles.push({
      shipName: '',
      brValue: 0,
      frame: '',
      planking: '',
      perks: [],
      broadsides: 1,
      repairSets: 1,
      comments: ''
    })
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

  const addFleetSetup = () => {
    setFleetSetups([...fleetSetups, {
      setupName: `Enemy Fleet ${fleetSetups.length}`,
      fleetCommander: '',
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

  const toggleComments = (setupIndex: number, roleIndex: number) => {
    const key = `${setupIndex}-${roleIndex}-comments`
    setExpandedComments(prev => ({ ...prev, [key]: !prev[key] }))
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
        {/* Port Battle Information */}
        <div className="bg-sail-white rounded-lg shadow-md p-6 border-2 border-navy-dark">
          <h2 className="text-xl font-semibold mb-4 text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Port Battle Information</h2>

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
                <option value="offensive">Offensive</option>
                <option value="defensive">Defensive</option>
                <option value="screening">Screening</option>
                <option value="flag-plant">Flag Plant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Our Role *
              </label>
              <select
                value={formData.ourRole}
                onChange={(e) => setFormData(prev => ({ ...prev, ourRole: e.target.value as 'attackers' | 'defenders' }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Crimson Text, serif'}}
                required
              >
                <option value="attackers">Attackers</option>
                <option value="defenders">Defenders</option>
              </select>
            </div>

            {/* Enemy nation and clan selection */}
            <div className="bg-red-50 border-2 border-red-200 rounded p-4">
              <h3 className="text-sm font-medium text-navy-dark mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                Enemy Fleet ({formData.ourRole === 'attackers' ? 'Defending' : 'Attacking'})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Enemy Nation *
                  </label>
                  <select
                    value={formData.enemyNation}
                    onChange={(e) => setFormData(prev => ({ ...prev, enemyNation: e.target.value as 'France' | 'Great Britain' | 'USA' }))}
                    className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                    style={{fontFamily: 'Crimson Text, serif'}}
                    required
                  >
                    <option value="France">France</option>
                    <option value="Great Britain">Great Britain</option>
                    <option value="USA">USA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Enemy Clan Tag *
                  </label>
                  <input
                    type="text"
                    value={formData.enemyClanTag}
                    onChange={(e) => setFormData(prev => ({ ...prev, enemyClanTag: e.target.value }))}
                    className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                    style={{fontFamily: 'Crimson Text, serif'}}
                    placeholder="Enter enemy clan tag..."
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Battle Environment *
              </label>
              <select
                value={formData.isDeepWater ? 'deep' : 'shallow'}
                onChange={(e) => setFormData(prev => ({ ...prev, isDeepWater: e.target.value === 'deep' }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Crimson Text, serif'}}
                required
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
                style={{fontFamily: 'Cinzel, serif'}}
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
                style={{fontFamily: 'Cinzel, serif'}}
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
                Fleet Commander *
              </label>
              <input
                type="text"
                value={formData.commanderName}
                onChange={(e) => setFormData(prev => ({ ...prev, commanderName: e.target.value }))}
                className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
                placeholder="Commander Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Second in Command
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

        {/* Additional Details */}
        <div className="bg-sail-white rounded-lg shadow-md p-6 border-2 border-navy-dark">
          <h2 className="text-xl font-semibold mb-4 text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Additional Details</h2>

          <div>
            <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
              Fleet Instructions & Notes
            </label>
            <textarea
              value={formData.additionalDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalDetails: e.target.value }))}
              className="w-full border-2 border-navy-dark rounded px-3 py-2 focus:outline-none focus:border-brass transition-colors min-h-[100px]"
              style={{fontFamily: 'Crimson Text, serif'}}
              placeholder="Additional details, tactics, special instructions for fleet members..."
              rows={4}
            />
          </div>
        </div>

        {/* Fleets */}
        <div className="bg-sail-white rounded-lg shadow-md p-6 border-2 border-navy-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Fleets</h2>
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
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Add Enemy Fleet
              </button>
            </div>
          </div>

          {fleetSetups.slice(1).map((setup, setupIndex) => {
            const actualIndex = setupIndex + 1; // Adjust index since we're slicing
            return (
            <div key={actualIndex} className="border-2 border-red-600 rounded-lg p-4 mb-4 bg-red-50">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={setup.setupName}
                  onChange={(e) => updateFleetSetupName(actualIndex, e.target.value)}
                  className="text-lg font-medium border-2 border-red-600 rounded px-2 py-1 bg-red-50 text-red-900 focus:outline-none focus:border-red-800 transition-colors"
                  style={{fontFamily: 'Cinzel, serif'}}
                  placeholder="Enemy Fleet Name"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addRole(actualIndex)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    style={{fontFamily: 'Cinzel, serif'}}
                  >
                    Add Role
                  </button>
                  {fleetSetups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFleetSetup(actualIndex)}
                      className="bg-red-700 text-white px-2 py-1 rounded text-sm hover:bg-red-800 transition-colors"
                      style={{fontFamily: 'Cinzel, serif'}}
                    >
                      Remove Setup
                    </button>
                  )}
                </div>
              </div>

              {/* Fleet Commander for this setup */}
              <div className="mb-4 border-b border-red-600/20 pb-3">
                <label className="block text-sm font-medium text-red-900 mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Enemy Fleet Commander
                </label>
                <input
                  type="text"
                  value={setup.fleetCommander || ''}
                  onChange={(e) => updateFleetCommander(actualIndex, e.target.value)}
                  className="w-full border-2 border-red-600 rounded px-3 py-2 focus:outline-none focus:border-red-800 transition-colors bg-red-50 text-red-900"
                  style={{fontFamily: 'Cinzel, serif'}}
                  placeholder="Enemy fleet commander name"
                />
              </div>

              <div className="space-y-4">
                {setup.roles.map((role, roleIndex) => {
                  const shipCounts = getShipCountByName(actualIndex)
                  const currentShipCount = role.shipName ? shipCounts[role.shipName] : 0
                  const perksKey = `${actualIndex}-${roleIndex}-perks`
                  const commentsKey = `${actualIndex}-${roleIndex}-comments`

                  return (
                    <div key={roleIndex} className="border border-red-600/30 rounded-lg p-3 bg-red-50/70">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-red-900" style={{fontFamily: 'Cinzel, serif'}}>
                          Enemy Ship #{roleIndex + 1}
                          {role.shipName && currentShipCount > 1 && (
                            <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                              {role.shipName} x{currentShipCount}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => duplicateRole(actualIndex, roleIndex)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                            style={{fontFamily: 'Cinzel, serif'}}
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRole(actualIndex, roleIndex)}
                            className="bg-red-700 text-white px-2 py-1 rounded text-xs hover:bg-red-800 transition-colors"
                            style={{fontFamily: 'Cinzel, serif'}}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Ship Name */}
                        <div>
                          <label className="block text-xs font-medium text-red-900 mb-1" style={{fontFamily: 'Cinzel, serif'}}>
                            Enemy Ship Name *
                          </label>
                          <ShipAutocomplete
                            value={role.shipName}
                            onChange={(value) => updateRole(actualIndex, roleIndex, 'shipName', value)}
                            placeholder="Enter enemy ship name..."
                            className="border-red-600"
                            required
                            showBR={false}
                          />
                        </div>

                        {/* Frame */}
                        <div>
                          <label className="block text-xs font-medium text-red-900 mb-1" style={{fontFamily: 'Cinzel, serif'}}>
                            Frame
                          </label>
                          <select
                            value={role.frame || ''}
                            onChange={(e) => updateRole(actualIndex, roleIndex, 'frame', e.target.value)}
                            className="w-full border-2 border-red-600 rounded px-2 py-1 focus:outline-none focus:border-red-800 transition-colors bg-red-50 text-red-900"
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
                          <label className="block text-xs font-medium text-red-900 mb-1" style={{fontFamily: 'Cinzel, serif'}}>
                            Planking
                          </label>
                          <select
                            value={role.planking || ''}
                            onChange={(e) => updateRole(actualIndex, roleIndex, 'planking', e.target.value)}
                            className="w-full border-2 border-red-600 rounded px-2 py-1 focus:outline-none focus:border-red-800 transition-colors bg-red-50 text-red-900"
                            style={{fontFamily: 'Crimson Text, serif'}}
                          >
                            <option value="">Select Planking...</option>
                            {PLANKING_OPTIONS.map(planking => (
                              <option key={planking} value={planking}>{planking}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Captain Perks Section */}
                      <div className="mt-4 border-t border-red-600/20 pt-4">
                        <button
                          type="button"
                          onClick={() => togglePerks(actualIndex, roleIndex)}
                          className="flex items-center justify-between w-full text-sm font-medium text-red-900 mb-2 hover:text-red-700 transition-colors"
                          style={{fontFamily: 'Cinzel, serif'}}
                        >
                          <span>Enemy Captain Perks</span>
                          <span className="text-xs">
                            {expandedPerks[perksKey] ? '▼' : '▶'}
                          </span>
                        </button>
                        {expandedPerks[perksKey] && (
                          <PerkSelector
                            perks={role.perks}
                            onChange={(perks) => updateRolePerks(actualIndex, roleIndex, perks)}
                            className="bg-red-50/50 rounded p-3"
                          />
                        )}
                      </div>

                      {/* Load Calculator Section */}
                      <div className="mt-4 border-t border-red-600/20 pt-4">
                        <LoadCalculator
                          shipName={role.shipName}
                          broadsides={role.broadsides}
                          repairSets={role.repairSets}
                          onChange={(broadsides: number, repairSets: number) => updateRoleLoad(actualIndex, roleIndex, broadsides, repairSets)}
                          frame={role.frame}
                          planking={role.planking}
                          alwaysExpanded={true}
                        />
                      </div>

                      {/* Comments Section */}
                      <div className="mt-4 border-t border-red-600/20 pt-4">
                        <button
                          type="button"
                          onClick={() => toggleComments(actualIndex, roleIndex)}
                          className="flex items-center justify-between w-full text-sm font-medium text-red-900 mb-2 hover:text-red-700 transition-colors"
                          style={{fontFamily: 'Cinzel, serif'}}
                        >
                          <span>Enemy Role Comments</span>
                          <span className="text-xs">
                            {expandedComments[commentsKey] ? '▼' : '▶'}
                          </span>
                        </button>
                        {expandedComments[commentsKey] && (
                          <textarea
                            value={role.comments || ''}
                            onChange={(e) => updateRole(actualIndex, roleIndex, 'comments', e.target.value)}
                            className="w-full border-2 border-red-600 rounded px-3 py-2 focus:outline-none focus:border-red-800 transition-colors min-h-[80px] bg-red-50 text-red-900"
                            style={{fontFamily: 'Crimson Text, serif'}}
                            placeholder="Special instructions or requirements for this enemy role..."
                            rows={3}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}

                {setup.roles.length === 0 && (
                  <p className="text-red-800/60 text-sm" style={{fontFamily: 'Crimson Text, serif'}}>
                    No enemy roles defined. Click "Add Role" to add enemy ship requirements.
                  </p>
                )}
              </div>
            </div>
          )})}
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
