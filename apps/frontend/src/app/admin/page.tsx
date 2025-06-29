'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { getAuthHeaders } from '@/hooks/useAuthenticatedFetch'
import { isAdmin as checkIsAdmin } from '@/lib/adminUtils'
import Link from 'next/link'

interface User {
  id: string
  username: string
  email?: string
  discordId: string
  canCreatePortBattles: boolean
  createdAt: string
  strikes?: Strike[]
  _count: {
    portBattles: number
    portBattleSignups: number
  }
}

interface Clan {
  id: string
  name: string
  tag: string
  description?: string
  _count: {
    members: number
  }
}

interface Port {
  id: string
  name: string
  _count: {
    portBattles: number
  }
}

interface Strike {
  id: string
  reason: string
  createdAt: string
  isRemoved: boolean
  user: {
    username: string
  }
  createdBy: {
    username: string
  }
}

interface BugReport {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: string
  user: {
    username: string
    discordId: string
  }
}

interface Application {
  id: string
  applicantName: string
  discordUsername: string
  discordId: string
  email?: string
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  currentNation: string
  preferredRole: string
  weeklyPlayTime: number
}

interface BlacklistEntry {
  id: string
  discordId?: string | null
  name?: string | null
  reason: string
  addedBy: string
  isActive: boolean
  createdAt: string
  removedBy?: string
  removedAt?: string
}

interface CommandRole {
  id: string
  title: string
  description: string
  subtitle?: string
  level: number
  permissions: string[]
  assignedUserId?: string | null
  flagCountry?: string
  isActive: boolean
  sectionId: string  // Which section this role belongs to
  order: number      // Order within the section
  assignedUser?: {
    id: string
    username: string
    discordId: string
  } | null
}

interface CommandSection {
  id: string
  name: string
  order: number
  isActive: boolean
}

export default function CombinedAdminPanel() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [clans, setClans] = useState<Clan[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [strikes, setStrikes] = useState<Strike[]>([])
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [reports, setReports] = useState<BugReport[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [commandRoles, setCommandRoles] = useState<CommandRole[]>([])
  const [commandSections, setCommandSections] = useState<CommandSection[]>([])
  const [draggedRole, setDraggedRole] = useState<CommandRole | null>(null)

  // Form states
  const [newClan, setNewClan] = useState({ name: '', tag: '', description: '' })
  const [newStrike, setNewStrike] = useState({ userId: '', reason: '' })
  const [newBlacklistEntry, setNewBlacklistEntry] = useState({ discordId: '', name: '', reason: '' })
  const [selectedCommandRole, setSelectedCommandRole] = useState<string>('')
  const [selectedUserForRole, setSelectedUserForRole] = useState<Record<string, string>>({}) // Changed to object keyed by roleId

  // Check if user is admin
  const isAdmin = checkIsAdmin(session?.user)

  useEffect(() => {
    if (session && isAdmin) {
      fetchData()
    }
  }, [session, activeTab, isAdmin])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }

      switch (activeTab) {
        case 'users':
        case 'clans':
        case 'strikes': {
          const response = await fetch(`/api/admin?action=${activeTab}`, { headers })
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()

          if (activeTab === 'users') setUsers(data.users || [])
          else if (activeTab === 'clans') setClans(data.clans || [])
          else if (activeTab === 'strikes') setStrikes(data.strikes || [])
          break
        }
        case 'blacklist': {
          // Initialize with empty blacklist for development
          setBlacklist([]);
          // TODO: Fetch blacklist entries when API is ready
          // const response = await fetch('/api/admin/blacklist', { headers })
          // if (response.ok) {
          //   const data = await response.json()
          //   setBlacklist(data.blacklist || [])
          // }
          break
        }
        case 'reports': {
          // Fetch bug reports - implement API endpoint
          const response = await fetch('/api/bug-reports?admin=true', { headers })
          if (response.ok) {
            const data = await response.json()
            setReports(data.reports || [])
          }
          break
        }
        case 'applications': {
          // Fetch applications - implement API endpoint
          const response = await fetch('/api/applications?admin=true', { headers })
          if (response.ok) {
            const data = await response.json()
            setApplications(data.applications || [])
          }
          break
        }
        case 'command': {
          // Initialize command sections from homepage
          setCommandSections([
            {
              id: 'defense-council',
              name: 'Defense Council',
              order: 1,
              isActive: true
            },
            {
              id: 'admiralty-board',
              name: 'Admiralty Board',
              order: 2,
              isActive: true
            }
          ]);

          // Initialize all command roles from homepage - complete structure
          setCommandRoles([
            // Defense Council
            {
              id: 'dc-1',
              title: 'CHOSEN',
              description: 'Chairman of the Defence Council and First Sea Lord',
              subtitle: '(Clan Founder)',
              level: 5,
              permissions: ['ALL'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'defense-council',
              order: 1,
              assignedUser: null
            },
            {
              id: 'dc-2',
              title: 'Tommy Templeman',
              description: 'Vice Chairman of the Defence Council and Second Sea Lord',
              subtitle: '(Clan Leader)',
              level: 5,
              permissions: ['ALL'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'defense-council',
              order: 2,
              assignedUser: null
            },
            {
              id: 'dc-3',
              title: 'ODDBALL',
              description: 'Vice Chairman of the Defence Council - Admiralty Board and Third Sea Lord',
              subtitle: '(Clan Leader)',
              level: 5,
              permissions: ['ALL'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'defense-council',
              order: 3,
              assignedUser: null
            },
            // Admiralty Board - All officers from homepage
            {
              id: 'ab-1',
              title: 'Tommy Templeman',
              description: 'Admiral of the Fleet',
              subtitle: '(Clan Leader)',
              level: 5,
              permissions: ['ALL'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 1,
              assignedUser: null
            },
            {
              id: 'ab-2',
              title: 'ODDBALL',
              description: 'Admiral - Home Fleet',
              subtitle: '(Clan Leader)',
              level: 4,
              permissions: ['CREATE_PORT_BATTLES', 'MANAGE_FLEETS'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 2,
              assignedUser: null
            },
            {
              id: 'ab-3',
              title: 'Yawnek',
              description: 'Vice Admiral - Home Fleet',
              subtitle: '(Clan 1st Officer)',
              level: 3,
              permissions: ['MANAGE_FLEETS'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 3,
              assignedUser: null
            },
            {
              id: 'ab-4',
              title: 'William Poe',
              description: 'Admiral and Chairman of the Victualling Board',
              subtitle: '(Clan 1st Officer)',
              level: 4,
              permissions: ['MANAGE_RESOURCES'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 4,
              assignedUser: null
            },
            {
              id: 'ab-5',
              title: 'Ash1586',
              description: 'Rear Admiral - Home Fleet',
              subtitle: '',
              level: 2,
              permissions: ['FLEET_OPERATIONS'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 5,
              assignedUser: null
            },
            {
              id: 'ab-6',
              title: 'Consang',
              description: 'Rear Admiral - Home Fleet',
              subtitle: '',
              level: 2,
              permissions: ['FLEET_OPERATIONS'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 6,
              assignedUser: null
            },
            {
              id: 'ab-7',
              title: 'Cpt Nelson',
              description: 'Rear Admiral - Home Fleet',
              subtitle: '',
              level: 2,
              permissions: ['FLEET_OPERATIONS'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 7,
              assignedUser: null
            },
            {
              id: 'ab-8',
              title: 'Honey Badger',
              description: 'Rear Admiral - Naval Attache to the People of the United States',
              subtitle: '',
              level: 2,
              permissions: ['FLEET_OPERATIONS'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 8,
              assignedUser: null
            },
            {
              id: 'ab-9',
              title: 'Henry Henryson',
              description: 'Rear Admiral - Caribbean Fleet',
              subtitle: '',
              level: 2,
              permissions: ['FLEET_OPERATIONS'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 9,
              assignedUser: null
            },
            {
              id: 'ab-10',
              title: 'JustHarry',
              description: 'Rear Admiral - Far East Fleet',
              subtitle: '',
              level: 2,
              permissions: ['FLEET_OPERATIONS'],
              assignedUserId: null,
              flagCountry: 'us',
              isActive: true,
              sectionId: 'admiralty-board',
              order: 10,
              assignedUser: null
            }
          ]);
          break
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserPermission = async (userId: string, canCreatePortBattles: boolean) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          action: 'updatePermissions',
          userId,
          canCreatePortBattles: !canCreatePortBattles
        }),
      })

      if (!response.ok) throw new Error('Failed to update user permissions')
      await fetchData()
    } catch (err) {
      console.error('Error updating user permissions:', err)
      alert('Failed to update user permissions')
    }
  }

  const createClan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'clan', ...newClan }),
      })

      if (!response.ok) throw new Error('Failed to create clan')
      setNewClan({ name: '', tag: '', description: '' })
      await fetchData()
    } catch (err) {
      console.error('Error creating clan:', err)
      alert('Failed to create clan')
    }
  }

  const createStrike = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'issue_strike', ...newStrike }),
      })

      if (!response.ok) throw new Error('Failed to create strike')
      setNewStrike({ userId: '', reason: '' })
      await fetchData()
    } catch (err) {
      console.error('Error creating strike:', err)
      alert('Failed to create strike')
    }
  }

  const createBlacklistEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Create entry in memory for now
      const newEntry = {
        id: `blacklist-${Date.now()}`,
        discordId: newBlacklistEntry.discordId || null,
        name: newBlacklistEntry.name || null,
        reason: newBlacklistEntry.reason,
        addedBy: session?.user?.username || 'Admin',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setBlacklist(prev => [newEntry, ...prev]);
      setNewBlacklistEntry({ discordId: '', name: '', reason: '' });

      // TODO: Later implement API call
      // const response = await fetch('/api/admin/blacklist', {
      //   method: 'POST',
      //   headers: {
      //     ...getAuthHeaders(),
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(newBlacklistEntry),
      // })

    } catch (err) {
      console.error('Error creating blacklist entry:', err)
      alert('Failed to create blacklist entry')
    }
  }

  const removeBlacklistEntry = async (id: string) => {
    if (!confirm('Are you sure you want to remove this blacklist entry?')) return

    try {
      // Remove from memory
      setBlacklist(prev => prev.map(entry =>
        entry.id === id
          ? { ...entry, isActive: false, removedAt: new Date().toISOString(), removedBy: session?.user?.username || 'Admin' }
          : entry
      ));

      // TODO: Later implement API call
      // const response = await fetch(`/api/admin/blacklist?id=${id}`, {
      //   method: 'DELETE',
      //   headers: getAuthHeaders(),
      // })

    } catch (err) {
      console.error('Error removing blacklist entry:', err)
      alert('Failed to remove blacklist entry')
    }
  }

  const assignUserToRole = async (roleId: string, userId: string) => {
    try {
      // Find the user if userId is provided
      const user = userId ? users.find(u => u.id === userId) : null;

      // Update the command roles in memory
      const newRoles = commandRoles.map(role => {
        if (role.id === roleId) {
          return {
            ...role,
            assignedUserId: userId || null,
            assignedUser: user ? {
              id: user.id,
              username: user.username,
              discordId: user.discordId
            } : null
          };
        }
        return role;
      });

      setCommandRoles(newRoles);
      setSelectedUserForRole(prev => ({ ...prev, [roleId]: '' }));

      // TODO: Later implement API call to persist changes
      // const response = await fetch('/api/admin/command-structure', {
      //   method: 'PUT',
      //   headers: {
      //     ...getAuthHeaders(),
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     action: 'assign_user',
      //     roleId,
      //     userId: userId || null
      //   }),
      // })

    } catch (err) {
      console.error('Error assigning user to role:', err)
      alert('Failed to assign user to role')
    }
  }

  const deleteItem = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const response = await fetch(`/api/admin?type=${type}&id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error(`Failed to delete ${type}`)
      await fetchData()
    } catch (err) {
      console.error(`Error deleting ${type}:`, err)
      alert(`Failed to delete ${type}`)
    }
  }

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await fetch('/api/bug-reports', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reportId, status }),
      })

      if (!response.ok) throw new Error('Failed to update report status')
      await fetchData()
    } catch (err) {
      console.error('Error updating report status:', err)
      alert('Failed to update report status')
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, reviewNotes?: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: applicationId,
          status,
          reviewNotes,
          reviewedBy: session?.user?.username,
          reviewedAt: new Date().toISOString()
        }),
      })

      if (!response.ok) throw new Error('Failed to update application status')
      await fetchData()
    } catch (err) {
      console.error('Error updating application status:', err)
      alert('Failed to update application status')
    }
  }

  const saveCommandStructure = async () => {
    try {
      // Save to localStorage for now (later implement API call)
      localStorage.setItem('command-roles', JSON.stringify(commandRoles))
      localStorage.setItem('command-sections', JSON.stringify(commandSections))

      alert('Command structure saved successfully! Changes will be reflected on the homepage.');

      // TODO: Later implement API call to save command structure
      // const response = await fetch('/api/admin/command-structure', {
      //   method: 'POST',
      //   headers: {
      //     ...getAuthHeaders(),
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     roles: commandRoles,
      //     sections: commandSections
      //   }),
      // })

    } catch (err) {
      console.error('Error saving command structure:', err)
      alert('Failed to save command structure')
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the admin panel.</p>
          <Link href="/api/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            ⚓ KRAKEN COMMAND CENTER ⚓
          </h1>
          <p className="text-sail-white/90 text-xl mb-2" style={{fontFamily: 'Crimson Text, serif'}}>
            Admiral's Command and Control Center for Squadron Operations
          </p>
          <div className="flex justify-center items-center gap-4 text-sail-white/70">
            <span>⚔️</span>
            <span>Logged in as <strong className="text-brass-bright">{session.user?.username || session.user?.name}</strong></span>
            <span>⚔️</span>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/" className="group">
            <div className="neo-brutal-box bg-sail-white p-4 text-center hover:bg-brass/10 transition-all">
              <div className="text-2xl mb-2">🏠</div>
              <h3 className="font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Return to Fleet</h3>
              <p className="text-sm text-navy-dark/70">Homepage</p>
            </div>
          </Link>

          <Link href="/port-battles" className="group">
            <div className="neo-brutal-box bg-sail-white p-4 text-center hover:bg-brass/10 transition-all">
              <div className="text-2xl mb-2">⚔️</div>
              <h3 className="font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Port Battles</h3>
              <p className="text-sm text-navy-dark/70">Combat Operations</p>
            </div>
          </Link>

          <Link href="/admin/settings" className="group">
            <div className="neo-brutal-box bg-sail-white p-4 text-center hover:bg-brass/10 transition-all">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Site Settings</h3>
              <p className="text-sm text-navy-dark/70">Fleet Configuration</p>
            </div>
          </Link>

          <div className="neo-brutal-box bg-brass/20 p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Active Panel</h3>
            <p className="text-sm text-navy-dark/70">Management Center</p>
          </div>
        </div>

        {/* Content Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="neo-brutal-box bg-sail-white p-4 mb-6">
              <h3 className="text-lg font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                📝 Content Management
              </h3>
              <div className="space-y-2">
                <Link href="/admin/homepage" className="block w-full">
                  <div className="p-3 bg-purple-50 hover:bg-purple-100 rounded border-2 border-purple-200 transition-all">
                    <div className="flex items-center gap-2">
                      <span>🏠</span>
                      <span className="font-medium text-navy-dark">Homepage Management</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Unified editing for all homepage content</div>
                  </div>
                </Link>
                <Link href="/admin/welcome" className="block w-full">
                  <div className="p-3 bg-blue-50 hover:bg-blue-100 rounded border-2 border-blue-200 transition-all">
                    <div className="flex items-center gap-2">
                      <span>📢</span>
                      <span className="font-medium text-navy-dark">Welcome Section</span>
                    </div>
                  </div>
                </Link>
                <Link href="/admin/features" className="block w-full">
                  <div className="p-3 bg-green-50 hover:bg-green-100 rounded border-2 border-green-200 transition-all">
                    <div className="flex items-center gap-2">
                      <span>✨</span>
                      <span className="font-medium text-navy-dark">Feature Cards</span>
                    </div>
                  </div>
                </Link>
                <Link href="/admin/letter" className="block w-full">
                  <div className="p-3 bg-yellow-50 hover:bg-yellow-100 rounded border-2 border-yellow-200 transition-all">
                    <div className="flex items-center gap-2">
                      <span>📜</span>
                      <span className="font-medium text-navy-dark">Admiralty Letter</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {/* Main Admin Tabs */}
            <div className="neo-brutal-box bg-sail-white mb-6">
              <div className="border-b-2 border-navy-dark p-4">
                <h2 className="text-2xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                  Fleet Administration
                </h2>
              </div>

              {/* Tab Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {/* Personnel Management */}
                <div className="space-y-2">
                  <h4 className="font-bold text-navy-dark text-sm uppercase tracking-wide mb-3">
                    👥 Personnel Operations
                  </h4>
                  {[
                    { id: 'users', label: 'Fleet Roster', icon: '👥', desc: 'Manage crew members' },
                    { id: 'strikes', label: 'Disciplinary Actions', icon: '⚠️', desc: 'Warning system' },
                    { id: 'blacklist', label: 'Banned Personnel', icon: '🚫', desc: 'Restricted access' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full p-3 rounded border-2 transition-all text-left ${
                        activeTab === tab.id
                          ? 'bg-brass text-navy-dark border-brass-bright shadow-lg'
                          : 'bg-gray-50 text-navy-dark border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{tab.icon}</span>
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      <div className="text-xs opacity-70">{tab.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Fleet Operations */}
                <div className="space-y-2">
                  <h4 className="font-bold text-navy-dark text-sm uppercase tracking-wide mb-3">
                    🏴‍☠️ Fleet Operations
                  </h4>
                  {[
                    { id: 'clans', label: 'Allied Clans', icon: '🏴‍☠️', desc: 'Manage alliances' },
                    { id: 'command', label: 'Command Structure', icon: '⭐', desc: 'Leadership hierarchy' },
                    { id: 'applications', label: 'New Recruits', icon: '📝', desc: 'Review applications' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full p-3 rounded border-2 transition-all text-left ${
                        activeTab === tab.id
                          ? 'bg-brass text-navy-dark border-brass-bright shadow-lg'
                          : 'bg-gray-50 text-navy-dark border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{tab.icon}</span>
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      <div className="text-xs opacity-70">{tab.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Communications */}
                <div className="space-y-2">
                  <h4 className="font-bold text-navy-dark text-sm uppercase tracking-wide mb-3">
                    📋 Communications
                  </h4>
                  {[
                    { id: 'reports', label: 'Fleet Reports', icon: '📋', desc: 'Content & bug reports' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full p-3 rounded border-2 transition-all text-left ${
                        activeTab === tab.id
                          ? 'bg-brass text-navy-dark border-brass-bright shadow-lg'
                          : 'bg-gray-50 text-navy-dark border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{tab.icon}</span>
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      <div className="text-xs opacity-70">{tab.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="neo-brutal-box bg-red-100 border-4 border-red-500 mb-6">
            <div className="p-4 text-red-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚠️</span>
                <span className="font-bold" style={{fontFamily: 'Cinzel, serif'}}>Fleet Alert</span>
              </div>
              {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="neo-brutal-box bg-sail-white p-8 text-center mb-6">
            <div className="text-navy-dark">
              <div className="text-3xl mb-4">⚓</div>
              <div className="text-lg font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                Loading Fleet Data...
              </div>
              <div className="text-sm mt-2 opacity-70">Please stand by while we gather intelligence</div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="neo-brutal-box bg-sail-white">
          <div className="border-b-2 border-navy-dark p-4">
            <h2 className="text-2xl font-bold text-navy-dark flex items-center gap-2" style={{fontFamily: 'Cinzel, serif'}}>
              {activeTab === 'users' && '👥 Fleet Roster Management'}
              {activeTab === 'clans' && '🏴‍☠️ Allied Clan Management'}
              {activeTab === 'strikes' && '⚠️ Disciplinary Actions'}
              {activeTab === 'blacklist' && '🚫 Restricted Personnel'}
              {activeTab === 'reports' && '📋 Fleet Communications'}
              {activeTab === 'applications' && '📝 Recruitment Center'}
              {activeTab === 'command' && '⭐ Command Structure'}
            </h2>
          </div>

          <div className="p-6">
          {/* Users Management */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-6">
                <p className="text-navy-dark/70 mb-4">
                  Manage your fleet's crew members, their battle permissions, and service records.
                </p>
              </div>

              <div className="bg-white rounded border-2 border-navy-dark overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-navy-dark text-sail-white">
                        <th className="px-6 py-4 text-left font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                          <span className="flex items-center gap-2">
                            👤 Crew Member
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                          <span className="flex items-center gap-2">
                            🔗 Discord ID
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                          <span className="flex items-center gap-2">
                            ⚔️ Battle Access
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                          <span className="flex items-center gap-2">
                            🏴‍☠️ Battles Led
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                          <span className="flex items-center gap-2">
                            📝 Signups
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                          <span className="flex items-center gap-2">
                            📅 Enlisted
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                          ⚙️ Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.id} className={`border-b border-gray-200 hover:bg-brass/10 transition-colors ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                          <td className="px-6 py-4">
                            <div className="font-bold text-navy-dark">{user.username}</div>
                            {user.strikes && user.strikes.length > 0 && (
                              <div className="text-xs text-red-600 mt-1">
                                ⚠️ {user.strikes.filter(s => !s.isRemoved).length} Active Strikes
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-600">{user.discordId}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleUserPermission(user.id, user.canCreatePortBattles)}
                              className={`px-4 py-2 rounded border-2 font-bold transition-all ${
                                user.canCreatePortBattles
                                  ? 'bg-green-100 text-green-800 border-green-400 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 border-red-400 hover:bg-red-200'
                              }`}
                              style={{fontFamily: 'Cinzel, serif'}}
                            >
                              {user.canCreatePortBattles ? '✅ Authorized' : '❌ Restricted'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-navy-dark">{user._count.portBattles}</span>
                              {user._count.portBattles > 5 && <span className="text-brass-bright">⭐</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-navy-dark">{user._count.portBattleSignups}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setNewStrike(prev => ({ ...prev, userId: user.id }))}
                              className="bg-yellow-600 text-white px-3 py-2 rounded border-2 border-yellow-700 hover:bg-yellow-700 font-bold transition-all"
                              style={{fontFamily: 'Cinzel, serif'}}
                            >
                              ⚠️ Strike
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🏴‍☠️</div>
                    <div className="text-lg font-bold" style={{fontFamily: 'Cinzel, serif'}}>No Crew Members Found</div>
                    <div className="text-sm mt-2">The fleet awaits its first recruits</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clans Management */}
          {activeTab === 'clans' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                🏴‍☠️ Clan Management
              </h2>

              {/* Create Clan Form */}
              <form onSubmit={createClan} className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="text-lg font-semibold mb-3">Create New Clan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Clan Name"
                    value={newClan.name}
                    onChange={(e) => setNewClan(prev => ({ ...prev, name: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Clan Tag"
                    value={newClan.tag}
                    onChange={(e) => setNewClan(prev => ({ ...prev, tag: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newClan.description}
                    onChange={(e) => setNewClan(prev => ({ ...prev, description: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Clan
                </button>
              </form>

              {/* Clans List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clans.map((clan) => (
                  <div key={clan.id} className="border border-gray-300 rounded p-4">
                    <h4 className="font-bold text-lg">[{clan.tag}] {clan.name}</h4>
                    {clan.description && <p className="text-gray-600 text-sm mb-2">{clan.description}</p>}
                    <p className="text-sm text-gray-500 mb-3">Members: {clan._count.members}</p>
                    <button
                      onClick={() => deleteItem('clan', clan.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strikes Management */}
          {activeTab === 'strikes' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                ⚠️ User Strikes
              </h2>

              {/* Create Strike Form */}
              <form onSubmit={createStrike} className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="text-lg font-semibold mb-3">Add User Strike</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={newStrike.userId}
                    onChange={(e) => setNewStrike(prev => ({ ...prev, userId: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Strike Reason"
                    value={newStrike.reason}
                    onChange={(e) => setNewStrike(prev => ({ ...prev, reason: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Add Strike
                </button>
              </form>

              {/* Strikes List */}
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-red-100">
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-left">Reason</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Issued By</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strikes.filter(strike => !strike.isRemoved).map((strike) => (
                      <tr key={strike.id} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-medium">{strike.user.username}</td>
                        <td className="px-4 py-2">{strike.reason}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(strike.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">{strike.createdBy.username}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => deleteItem('strike', strike.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Content Reports */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                📋 Content Reports
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-yellow-100">
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Priority</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Reporter</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-medium">{report.title}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            report.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.priority}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={report.status}
                            onChange={(e) => updateReportStatus(report.id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-sm">{report.user.username}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => alert(`Report Details:\n\n${report.description}`)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications */}
          {activeTab === 'applications' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                📝 Applications
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="px-4 py-2 text-left">Applicant</th>
                      <th className="px-4 py-2 text-left">Nation</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Submitted</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-medium">
                          <div>
                            <div>{app.applicantName}</div>
                            <div className="text-sm text-gray-600">{app.discordUsername}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2">{app.currentNation}</td>
                        <td className="px-4 py-2">{app.preferredRole}</td>
                        <td className="px-4 py-2">
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Command Structure */}
          {activeTab === 'command' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                ⭐ Command Structure Management
              </h2>

              {/* Section Management Controls */}
              <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="text-lg font-semibold mb-3">Section Management</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    onClick={() => {
                      const newSection: CommandSection = {
                        id: `section-${Date.now()}`,
                        name: 'New Section',
                        order: commandSections.length + 1,
                        isActive: true
                      };
                      setCommandSections(prev => [...prev, newSection]);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    + Add Section
                  </button>

                  <button
                    onClick={() => {
                      const defaultSection = commandSections.find(s => s.id === 'defense-council') || commandSections[0];
                      if (defaultSection) {
                        const newRole: CommandRole = {
                          id: `role-${Date.now()}`,
                          title: 'New Officer',
                          description: 'Admiral - New Position',
                          subtitle: '(New Role)',
                          level: 1,
                          permissions: ['FLEET_OPERATIONS'],
                          assignedUserId: null,
                          flagCountry: 'us',
                          isActive: true,
                          sectionId: defaultSection.id,
                          order: commandRoles.filter(r => r.sectionId === defaultSection.id).length + 1,
                          assignedUser: null
                        };
                        setCommandRoles(prev => [...prev, newRole]);
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    + Add Command Role
                  </button>

                  <button
                    onClick={saveCommandStructure}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
                  >
                    💾 Save Changes
                  </button>
                </div>
              </div>

              {/* Command Sections */}
              {commandSections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.id} className="mb-8">
                    {/* Section Header */}
                    <div className="bg-navy-dark text-sail-white p-4 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => {
                              const newSections = commandSections.map(s =>
                                s.id === section.id ? { ...s, name: e.target.value } : s
                              );
                              setCommandSections(newSections);
                            }}
                            className="text-xl font-bold bg-transparent border-b border-sail-white/30 text-sail-white px-2 py-1"
                            style={{fontFamily: 'Cinzel, serif'}}
                          />
                          <span className="text-sm opacity-75">
                            ({commandRoles.filter(r => r.sectionId === section.id).length} officers)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Move Section Up/Down */}
                          <button
                            onClick={() => {
                              const currentIndex = commandSections.findIndex(s => s.id === section.id);
                              if (currentIndex > 0) {
                                const newSections = [...commandSections];
                                [newSections[currentIndex], newSections[currentIndex - 1]] =
                                [newSections[currentIndex - 1], newSections[currentIndex]];
                                newSections.forEach((s, i) => s.order = i + 1);
                                setCommandSections(newSections);
                              }
                            }}
                            disabled={commandSections.findIndex(s => s.id === section.id) === 0}
                            className="bg-sail-white/20 text-sail-white px-2 py-1 rounded text-sm hover:bg-sail-white/30 disabled:opacity-50"
                          >
                            ↑
                          </button>

                          <button
                            onClick={() => {
                              const currentIndex = commandSections.findIndex(s => s.id === section.id);
                              if (currentIndex < commandSections.length - 1) {
                                const newSections = [...commandSections];
                                [newSections[currentIndex], newSections[currentIndex + 1]] =
                                [newSections[currentIndex + 1], newSections[currentIndex]];
                                newSections.forEach((s, i) => s.order = i + 1);
                                setCommandSections(newSections);
                              }
                            }}
                            disabled={commandSections.findIndex(s => s.id === section.id) === commandSections.length - 1}
                            className="bg-sail-white/20 text-sail-white px-2 py-1 rounded text-sm hover:bg-sail-white/30 disabled:opacity-50"
                          >
                            ↓
                          </button>

                          {/* Delete Section */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${section.name}" section? All roles in this section will be moved to the first section.`)) {
                                // Move all roles from this section to the first remaining section
                                const remainingSections = commandSections.filter(s => s.id !== section.id);
                                if (remainingSections.length > 0) {
                                  const targetSection = remainingSections[0];
                                  const newRoles = commandRoles.map(role =>
                                    role.sectionId === section.id
                                      ? { ...role, sectionId: targetSection.id }
                                      : role
                                  );
                                  setCommandRoles(newRoles);
                                }
                                setCommandSections(remainingSections);
                              }
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Section Content - Drop Zone */}
                    <div
                      className="bg-sandstone-light border-4 border-navy-dark border-t-0 rounded-b-lg p-6 min-h-[200px]"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-blue-100');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-blue-100');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-blue-100');

                        if (draggedRole) {
                          // Move role to this section
                          const newRoles = commandRoles.map(role =>
                            role.id === draggedRole.id
                              ? { ...role, sectionId: section.id, order: commandRoles.filter(r => r.sectionId === section.id).length + 1 }
                              : role
                          );
                          setCommandRoles(newRoles);
                          setDraggedRole(null);
                        }
                      }}
                    >
                      {/* Officer Cards in this Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {commandRoles
                          .filter(role => role.sectionId === section.id)
                          .sort((a, b) => a.order - b.order)
                          .map((role, roleIndex) => (
                            <div
                              key={role.id}
                              className="relative"
                              draggable
                              onDragStart={(e) => {
                                setDraggedRole(role);
                                e.currentTarget.classList.add('opacity-50');
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.classList.remove('opacity-50');
                                setDraggedRole(null);
                              }}
                            >
                              {/* Admin Controls */}
                              <div className="absolute -top-2 -right-2 z-10 flex gap-1">
                                <button
                                  onClick={() => {
                                    const newRoles = commandRoles.filter(r => r.id !== role.id);
                                    setCommandRoles(newRoles);
                                  }}
                                  className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                  title="Remove Role"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Officer Card */}
                              <div className="officer-card bg-sandstone-light border-4 border-brass relative cursor-move">
                                <div className="absolute top-2 left-2 text-xs bg-navy-dark text-sail-white px-2 py-1 rounded">
                                  Drag to move
                                </div>

                                <div className="absolute top-2 right-2">
                                  <img
                                    src={`https://flagcdn.com/24x18/${role.flagCountry || 'us'}.png`}
                                    alt={`${role.flagCountry?.toUpperCase() || 'US'} Flag`}
                                    className="w-6 h-4 cursor-pointer"
                                    onClick={() => {
                                      const flags = ['us', 'gb', 'fr', 'es', 'nl', 'de', 'it', 'ru'];
                                      const currentIndex = flags.indexOf(role.flagCountry || 'us');
                                      const nextFlag = flags[(currentIndex + 1) % flags.length];
                                      const newRoles = commandRoles.map(r =>
                                        r.id === role.id ? { ...r, flagCountry: nextFlag } : r
                                      );
                                      setCommandRoles(newRoles);
                                    }}
                                    title="Click to change flag"
                                  />
                                </div>

                                <div className="flex mt-8">
                                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                                    {role.assignedUser ? (
                                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-xs text-blue-800 font-bold">
                                        {role.assignedUser.username.slice(0, 3)}
                                      </div>
                                    ) : (
                                      <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                                        Photo
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    {/* Editable Name */}
                                    <input
                                      type="text"
                                      value={role.assignedUser?.username || role.title}
                                      onChange={(e) => {
                                        if (!role.assignedUser) {
                                          const newRoles = commandRoles.map(r =>
                                            r.id === role.id ? { ...r, title: e.target.value } : r
                                          );
                                          setCommandRoles(newRoles);
                                        }
                                      }}
                                      className="text-lg font-bold text-navy-dark bg-transparent border-none w-full"
                                      style={{fontFamily: 'Cinzel, serif'}}
                                      disabled={!!role.assignedUser}
                                      placeholder="Officer Name"
                                    />

                                    {/* Editable Title/Rank */}
                                    <input
                                      type="text"
                                      value={role.description}
                                      onChange={(e) => {
                                        const newRoles = commandRoles.map(r =>
                                          r.id === role.id ? { ...r, description: e.target.value } : r
                                        );
                                        setCommandRoles(newRoles);
                                      }}
                                      className="text-sm text-navy-dark font-medium bg-transparent border-none w-full"
                                      placeholder="Admiral - Position"
                                    />

                                    {/* Editable Subtitle */}
                                    <input
                                      type="text"
                                      value={role.subtitle || ''}
                                      onChange={(e) => {
                                        const newRoles = commandRoles.map(r =>
                                          r.id === role.id ? { ...r, subtitle: e.target.value } : r
                                        );
                                        setCommandRoles(newRoles);
                                      }}
                                      className="text-xs text-brass italic bg-transparent border-none w-full"
                                      placeholder="(Role Description)"
                                    />
                                  </div>
                                </div>

                                {/* User Assignment Section */}
                                <div className="mt-4 pt-4 border-t border-brass/30">
                                  <h5 className="text-xs font-semibold text-navy-dark mb-2">Assign User:</h5>

                                  {role.assignedUser ? (
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {role.assignedUser.username}
                                      </span>
                                      <button
                                        onClick={() => assignUserToRole(role.id, '')}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <input
                                        type="text"
                                        placeholder="Search users by username..."
                                        value={selectedUserForRole[role.id] || ''}
                                        onChange={(e) => setSelectedUserForRole(prev => ({ ...prev, [role.id]: e.target.value }))}
                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                      />

                                      {/* User dropdown list */}
                                      {selectedUserForRole[role.id] && (
                                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded bg-white">
                                          {users
                                            .filter(user =>
                                              user.username.toLowerCase().includes((selectedUserForRole[role.id] || '').toLowerCase())
                                            )
                                            .slice(0, 5)
                                            .map((user) => (
                                              <div
                                                key={user.id}
                                                onClick={() => {
                                                  assignUserToRole(role.id, user.id);
                                                }}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                              >
                                                <div className="font-medium">{user.username}</div>
                                                <div className="text-xs text-gray-500">{user.discordId}</div>
                                              </div>
                                            ))
                                          }
                                          {users.filter(user =>
                                            user.username.toLowerCase().includes((selectedUserForRole[role.id] || '').toLowerCase())
                                          ).length === 0 && (
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                              No users found
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Empty Section Message */}
                      {commandRoles.filter(role => role.sectionId === section.id).length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
                          <p>Drop roles here or click "Add Command Role" to add officers to this section</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {/* No Sections Message */}
              {commandSections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No command sections created yet. Click "Add Section" to get started.
                </div>
              )}
            </div>
          )}

          {/* Blacklist Management */}
          {activeTab === 'blacklist' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                🚫 Blacklist Management
              </h2>

              {/* Create Blacklist Entry Form */}
              <form onSubmit={createBlacklistEntry} className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="text-lg font-semibold mb-3">Add Blacklist Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Discord ID (optional)"
                    value={newBlacklistEntry.discordId}
                    onChange={(e) => setNewBlacklistEntry(prev => ({ ...prev, discordId: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Name (if no Discord ID)"
                    value={newBlacklistEntry.name}
                    onChange={(e) => setNewBlacklistEntry(prev => ({ ...prev, name: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Reason for blacklist"
                    value={newBlacklistEntry.reason}
                    onChange={(e) => setNewBlacklistEntry(prev => ({ ...prev, reason: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newBlacklistEntry.reason || (!newBlacklistEntry.discordId && !newBlacklistEntry.name)}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                >
                  Add to Blacklist
                </button>
              </form>

              {/* Blacklist Entries */}
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-red-100">
                      <th className="px-4 py-2 text-left">Discord ID</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Reason</th>
                      <th className="px-4 py-2 text-left">Added By</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blacklist.filter(entry => entry.isActive).map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-mono text-sm">{entry.discordId || 'N/A'}</td>
                        <td className="px-4 py-2">{entry.name || 'N/A'}</td>
                        <td className="px-4 py-2">{entry.reason}</td>
                        <td className="px-4 py-2 text-sm">{entry.addedBy}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => removeBlacklistEntry(entry.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {blacklist.filter(entry => entry.isActive).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No active blacklist entries found.
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Admin Footer */}
        <div className="mt-8 text-center">
          <div className="neo-brutal-box bg-navy-dark p-6">
            <div className="text-sail-white">
              <h3 className="text-xl font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                ⚓ KRAKEN Command Center ⚓
              </h3>
              <p className="text-sail-white/70 text-sm mb-4">
                "Victory belongs to the most persevering" - Admiral Nelson
              </p>
              <div className="flex justify-center items-center gap-4 text-sm">
                <span className="text-brass-bright">Fleet Status: Operational</span>
                <span>•</span>
                <span className="text-brass-bright">Security Level: Admiral Only</span>
                <span>•</span>
                <span className="text-brass-bright">Version: 2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
