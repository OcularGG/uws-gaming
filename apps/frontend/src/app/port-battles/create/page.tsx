'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

  const [formData, setFormData] = useState({
    portName: '',
    meetupTime: '',
    battleStartTime: '',
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
        { shipName: 'Victory', brValue: 500 },
        { shipName: 'Bellona', brValue: 350 },
        { shipName: 'Endymion', brValue: 250 },
        { shipName: 'Hermes', brValue: 150 }
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
    newSetups[setupIndex].roles.push({ shipName: '', brValue: 0 })
    setFleetSetups(newSetups)
  }

  const removeRole = (setupIndex: number, roleIndex: number) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].roles.splice(roleIndex, 1)
    setFleetSetups(newSetups)
  }

  const updateRole = (setupIndex: number, roleIndex: number, field: keyof FleetRole, value: string | number) => {
    const newSetups = [...fleetSetups]
    newSetups[setupIndex].roles[roleIndex] = {
      ...newSetups[setupIndex].roles[roleIndex],
      [field]: value
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

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Create Port Battle</h1>
          <p className="text-gray-600 mb-4">Please sign in to create a port battle.</p>
          <Link href="/api/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create Port Battle</h1>
        <Link href="/port-battles" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          Back to Port Battles
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port Name *
              </label>
              <select
                value={formData.portName}
                onChange={(e) => setFormData(prev => ({ ...prev, portName: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select a port</option>
                {ports.map(port => (
                  <option key={port.id} value={port.name}>
                    {port.name} {port.region && `(${port.region})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meetup Location *
              </label>
              <input
                type="text"
                value={formData.meetupLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, meetupLocation: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., Havana Port"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meetup Time *
              </label>
              <input
                type="datetime-local"
                value={formData.meetupTime}
                onChange={(e) => setFormData(prev => ({ ...prev, meetupTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Battle Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.battleStartTime}
                onChange={(e) => setFormData(prev => ({ ...prev, battleStartTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BR Limit *
              </label>
              <input
                type="number"
                value={formData.brLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, brLimit: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="500"
                max="5000"
                step="50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Water Type
              </label>
              <select
                value={formData.isDeepWater ? 'deep' : 'shallow'}
                onChange={(e) => setFormData(prev => ({ ...prev, isDeepWater: e.target.value === 'deep' }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="deep">Deep Water</option>
                <option value="shallow">Shallow Water</option>
              </select>
            </div>
          </div>
        </div>

        {/* Command Structure */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Command Structure</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PB Commander
              </label>
              <input
                type="text"
                value={formData.commanderName}
                onChange={(e) => setFormData(prev => ({ ...prev, commanderName: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Admiral Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2nd IC Commander
              </label>
              <input
                type="text"
                value={formData.secondICName}
                onChange={(e) => setFormData(prev => ({ ...prev, secondICName: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Captain Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                REQ Commander
              </label>
              <input
                type="text"
                value={formData.reqCommanderName}
                onChange={(e) => setFormData(prev => ({ ...prev, reqCommanderName: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Commander Name"
              />
            </div>
          </div>
        </div>

        {/* Fleet Setups */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Fleet Setups</h2>
            <div className="flex items-center gap-4">
              <div className={`text-sm ${isOverBRLimit() ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                Total BR: {getTotalBR()} / {formData.brLimit}
                {isOverBRLimit() && (
                  <span className="ml-2 bg-red-100 px-2 py-1 rounded">
                    Over by {getTotalBR() - formData.brLimit}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={addFleetSetup}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Add Fleet Setup
              </button>
            </div>
          </div>

          {fleetSetups.map((setup, setupIndex) => (
            <div key={setupIndex} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={setup.setupName}
                  onChange={(e) => {
                    const newSetups = [...fleetSetups]
                    newSetups[setupIndex].setupName = e.target.value
                    setFleetSetups(newSetups)
                  }}
                  className="text-lg font-medium border-none bg-transparent focus:outline-none focus:bg-gray-50"
                  placeholder="Fleet Setup Name"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addRole(setupIndex)}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Add Role
                  </button>
                  {fleetSetups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFleetSetup(setupIndex)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Remove Setup
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {setup.roles.map((role, roleIndex) => (
                  <div key={roleIndex} className="flex gap-4 items-center">
                    <span className="text-sm text-gray-600 w-8">#{roleIndex + 1}</span>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={role.shipName}
                        onChange={(e) => updateRole(setupIndex, roleIndex, 'shipName', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        placeholder="Ship Name"
                        required
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={role.brValue}
                        onChange={(e) => updateRole(setupIndex, roleIndex, 'brValue', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        placeholder="BR"
                        min="0"
                        max="1000"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRole(setupIndex, roleIndex)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {setup.roles.length === 0 && (
                  <p className="text-gray-500 text-sm">No roles defined. Click "Add Role" to add ship requirements.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link
            href="/port-battles"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || isOverBRLimit()}
            className={`px-6 py-2 rounded text-white ${
              loading || isOverBRLimit()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating...' : 'Create Port Battle'}
          </button>
        </div>
      </form>
    </div>
  )
}
