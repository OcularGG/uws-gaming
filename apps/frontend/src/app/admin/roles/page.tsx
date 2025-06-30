'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { isAdmin as checkIsAdmin } from '@/lib/adminUtils'
import { rolesApi } from '@/lib/adminApi'
import Link from 'next/link'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export default function RolesPage() {
  const { data: session, status } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user && checkIsAdmin(session.user)) {
      fetchRolesAndPermissions()
    }
  }, [session])

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true)
      setError(null)

      const [rolesResponse, permissionsResponse] = await Promise.all([
        rolesApi.getRoles(),
        rolesApi.getPermissions()
      ])

      setRoles(rolesResponse || [])
      setPermissions(permissionsResponse || [])
    } catch (error) {
      console.error('Error fetching roles and permissions:', error)
      setError('Failed to load roles and permissions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return

    try {
      await rolesApi.createRole(newRole)
      setShowCreateRole(false)
      setNewRole({ name: '', description: '', permissions: [] })
      await fetchRolesAndPermissions()
    } catch (error) {
      console.error('Error creating role:', error)
      setError('Failed to create role')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      await rolesApi.deleteRole(roleId)
      await fetchRolesAndPermissions()
    } catch (error) {
      console.error('Error deleting role:', error)
      setError('Failed to delete role')
    }
  }

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session?.user || !checkIsAdmin(session.user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-500"
          >
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                  Admin
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">Roles & Permissions</span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
              <p className="mt-2 text-gray-600">Manage user roles and permissions</p>
            </div>
            <button
              onClick={() => setShowCreateRole(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Role
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading roles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Roles List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Current Roles</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{role.name}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{role.permissions.length} permissions</span>
                        <span>{role.userCount} users</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <span
                            key={permission}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Available Permissions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Available Permissions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                      <div className="space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {permission.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Role Modal */}
        {showCreateRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Role</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter role name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter role description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {permissions.map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={newRole.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRole({
                                ...newRole,
                                permissions: [...newRole.permissions, permission.id]
                              })
                            } else {
                              setNewRole({
                                ...newRole,
                                permissions: newRole.permissions.filter(p => p !== permission.id)
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCreateRole}
                  disabled={!newRole.name.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Role
                </button>
                <button
                  onClick={() => {
                    setShowCreateRole(false)
                    setNewRole({ name: '', description: '', permissions: [] })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
