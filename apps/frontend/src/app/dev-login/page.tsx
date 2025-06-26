'use client'

import { signIn } from 'next-auth/react'
import { useSession } from '@/hooks/useSession'

// Mock user data for local development
const MOCK_USERS = {
  admin: {
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@krakengaming.org',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY0MDQ0Ii8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    discordId: '1207434980855259206', // This matches the admin ID in Navigation.tsx
    username: 'AdminKraken',
    discriminator: '0001',
    isMember: true,
    isAdmin: true
  },
  user: {
    id: 'regular-user-id',
    name: 'Regular User',
    email: 'user@krakengaming.org',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMDA3Q0ZGIi8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    discordId: '123456789012345678',
    username: 'RegularKraken',
    discriminator: '0002',
    isMember: true,
    isAdmin: false
  }
}

export default function DevLogin() {
  const { data: session } = useSession()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only available in development mode.</p>
        </div>
      </div>
    )
  }

  const handleMockLogin = async (userType: 'admin' | 'user') => {
    const mockUser = MOCK_USERS[userType]

    // Store mock session data in localStorage for the auth system to pick up
    localStorage.setItem('mock-session', JSON.stringify({
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }))

    // Trigger a page reload to activate the mock session
    window.location.reload()
  }

  const handleLogout = () => {
    localStorage.removeItem('mock-session')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-sail-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
              KrakenGaming
            </h1>
            <h2 className="text-xl text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Development Login
            </h2>
            <p className="text-sm text-gray-600">
              Quick login options for local development and testing
            </p>
          </div>

          {session ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="font-semibold text-green-800 mb-2">Currently Logged In</h3>
                <div className="text-sm text-green-700">
                  <p><strong>Name:</strong> {session.user?.name}</p>
                  <p><strong>Role:</strong> {(session.user as any)?.discordId === '1207434980855259206' ? 'Admin' : 'Regular User'}</p>
                  <p><strong>Discord ID:</strong> {(session.user as any)?.discordId}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-3 px-4 rounded font-medium hover:bg-red-700 transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => handleMockLogin('admin')}
                className="w-full bg-brass text-navy-dark py-3 px-4 rounded font-medium hover:bg-brass-bright transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                🏴‍☠️ Login as Admin
              </button>

              <button
                onClick={() => handleMockLogin('user')}
                className="w-full bg-navy text-sail-white py-3 px-4 rounded font-medium hover:bg-navy-dark transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                ⚓ Login as Regular User
              </button>

              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => signIn('discord')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded font-medium hover:bg-blue-700 transition-colors"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  🔗 Login with Discord (Real)
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">Development Tools</p>
            <div className="space-y-2">
              <a
                href="/"
                className="block text-sm text-navy hover:text-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                → Go to Homepage
              </a>
              <a
                href="/admin"
                className="block text-sm text-navy hover:text-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                → Admin Panel (Admin only)
              </a>
              <a
                href="/apply"
                className="block text-sm text-navy hover:text-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                → Application Form
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
