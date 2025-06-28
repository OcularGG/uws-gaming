'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { useSiteContext } from '@/contexts/SiteContext'
import Link from 'next/link'

interface SiteSettings {
  siteName: string
  tagline: string
  description: string
  commandStructure: Array<{ role: string; name: string }>
}

export default function SiteSettingsPage() {
  const { data: session } = useSession()
  const { settings: contextSettings, refreshSettings } = useSiteContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<SiteSettings>(contextSettings)

  // Check if user is admin
  const isAdmin = session?.user?.discordId === '1207434980855259206' || session?.user?.isAdmin

  useEffect(() => {
    setSettings(contextSettings)
  }, [contextSettings])

  const saveSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      const savedSettings = await response.json()
      setSettings(savedSettings)
      await refreshSettings()

      // Show success message
      setError(null)
      alert('Settings saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const addCommandRole = () => {
    setSettings(prev => ({
      ...prev,
      commandStructure: [
        ...prev.commandStructure,
        { role: 'New Role', name: 'New Position' }
      ]
    }))
  }

  const updateCommandRole = (index: number, field: 'role' | 'name', value: string) => {
    setSettings(prev => ({
      ...prev,
      commandStructure: prev.commandStructure.map((role, i) =>
        i === index ? { ...role, [field]: value } : role
      )
    }))
  }

  const removeCommandRole = (index: number) => {
    setSettings(prev => ({
      ...prev,
      commandStructure: prev.commandStructure.filter((_, i) => i !== index)
    }))
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⚓</div>
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">Authentication Required</h1>
          <p className="text-slate-300 mb-6">You must be logged in to access the Admiral's quarters.</p>
          <Link
            href="/auth/signin"
            className="bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Set Sail → Login
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-red-600/30 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-6">Only the Admiral may enter these quarters.</p>
          <Link
            href="/"
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Port
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium"
            >
              ← Admiral's Quarters
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            ⚙️ Fleet Configuration
          </h1>
          <p className="text-slate-300">Configure the foundational settings of your naval command</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-slate-800/80 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-6">
          <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }} className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-yellow-400 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                Fleet Identity
              </h2>

              <div>
                <label className="block text-yellow-400 font-medium mb-2">Fleet Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Enter fleet name"
                />
              </div>

              <div>
                <label className="block text-yellow-400 font-medium mb-2">Fleet Motto</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Enter fleet motto"
                />
              </div>

              <div>
                <label className="block text-yellow-400 font-medium mb-2">Fleet Description</label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Enter fleet description"
                />
              </div>
            </div>

            {/* Command Structure */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-yellow-400" style={{ fontFamily: 'Cinzel, serif' }}>
                  Command Structure
                </h2>
                <button
                  type="button"
                  onClick={addCommandRole}
                  className="bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  + Add Rank
                </button>
              </div>

              <div className="space-y-3">
                {settings.commandStructure.map((role, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={role.role}
                      onChange={(e) => updateCommandRole(index, 'role', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                      placeholder="Rank title"
                    />
                    <input
                      type="text"
                      value={role.name}
                      onChange={(e) => updateCommandRole(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                      placeholder="Position name"
                    />
                    <button
                      type="button"
                      onClick={() => removeCommandRole(index)}
                      className="text-red-400 hover:text-red-300 p-2 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? '⚓ Saving...' : '⚓ Save Configuration'}
              </button>
              <Link
                href="/admin"
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
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
