'use client'

import { useSession } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'

export default function DevLoginTest() {
  const { data: session, status, isMockSession } = useSession()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testAdminLogin = () => {
    addResult('Testing Admin Login...')
    const mockAdmin = {
      id: 'dev-admin-user-id',
      name: 'KrakenGaming Admin',
      email: 'admin@krakengaming.org',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY0MDQ0Ii8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
      discordId: '1207434980855259206',
      username: 'AdminKraken',
      discriminator: '0001',
      isMember: true,
      isAdmin: true,
      canCreatePortBattles: true
    }

    localStorage.setItem('mock-session', JSON.stringify({
      user: mockAdmin,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }))

    addResult('Admin mock session stored. Reloading...')
    setTimeout(() => window.location.reload(), 500)
  }

  const testUserLogin = () => {
    addResult('Testing User Login...')
    const mockUser = {
      id: 'dev-regular-user-id',
      name: 'Regular Pirate',
      email: 'pirate@krakengaming.org',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMDA3Q0ZGIi8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
      discordId: '987654321098765432',
      username: 'RegularPirate',
      discriminator: '0002',
      isMember: true,
      isAdmin: false,
      canCreatePortBattles: false
    }

    localStorage.setItem('mock-session', JSON.stringify({
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }))

    addResult('User mock session stored. Reloading...')
    setTimeout(() => window.location.reload(), 500)
  }

  const clearSession = () => {
    addResult('Clearing session...')
    localStorage.removeItem('mock-session')
    setTimeout(() => window.location.reload(), 500)
  }

  const testApiAccess = async () => {
    addResult('Testing API access...')
    try {
      const response = await fetch('/api/port-battles?action=list')
      if (response.ok) {
        addResult('✅ API access successful - user is authenticated')
      } else if (response.status === 401) {
        addResult('❌ API access denied - user not authenticated (expected if logged out)')
      } else {
        addResult(`⚠️ API returned status: ${response.status}`)
      }
    } catch (error) {
      addResult(`❌ API test failed: ${error}`)
    }
  }

  const testAdminAccess = async () => {
    addResult('Testing Admin API access...')
    try {
      const response = await fetch('/api/admin?action=listUsers')
      if (response.ok) {
        addResult('✅ Admin API access successful - user has admin privileges')
      } else if (response.status === 403) {
        addResult('❌ Admin API access denied - user lacks admin privileges (expected for regular users)')
      } else if (response.status === 401) {
        addResult('❌ Admin API access denied - user not authenticated')
      } else {
        addResult(`⚠️ Admin API returned status: ${response.status}`)
      }
    } catch (error) {
      addResult(`❌ Admin API test failed: ${error}`)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      addResult(`✅ Session loaded: ${session?.user?.name} (${isMockSession ? 'Mock' : 'Real'})`)
      const isAdmin = session?.user?.discordId === '1207434980855259206'
      addResult(`${isAdmin ? '✅' : '❌'} Admin status: ${isAdmin ? 'YES' : 'NO'}`)
    } else if (status === 'unauthenticated') {
      addResult('❌ No active session')
    }
  }, [session, status, isMockSession])

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-sail-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
              Dev Login Test Suite
            </h1>
            <p className="text-sm text-gray-600">
              Automated testing for the development login system
            </p>
          </div>

          {/* Current Session Status */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Current Session Status
            </h2>
            <div className={`p-4 rounded ${session ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p><strong>Status:</strong> {status}</p>
              {session && (
                <>
                  <p><strong>Name:</strong> {session.user?.name}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Discord ID:</strong> {session.user?.discordId}</p>
                  <p><strong>Is Admin:</strong> {session.user?.discordId === '1207434980855259206' ? 'YES' : 'NO'}</p>
                  <p><strong>Session Type:</strong> {isMockSession ? 'Mock (Dev Mode)' : 'Real Discord Session'}</p>
                </>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Test Controls
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={testAdminLogin}
                className="bg-red-600 text-white py-2 px-4 rounded font-medium hover:bg-red-700 transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Test Admin Login
              </button>
              <button
                onClick={testUserLogin}
                className="bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Test User Login
              </button>
              <button
                onClick={testApiAccess}
                className="bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700 transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Test API Access
              </button>
              <button
                onClick={testAdminAccess}
                className="bg-purple-600 text-white py-2 px-4 rounded font-medium hover:bg-purple-700 transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Test Admin API
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={clearSession}
                className="bg-gray-600 text-white py-2 px-4 rounded font-medium hover:bg-gray-700 transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Clear Session
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Test Results
            </h2>
            <div className="bg-gray-50 border rounded p-4 h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 italic">No test results yet. Click the test buttons above to start testing.</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setTestResults([])}
              className="mt-2 bg-gray-500 text-white py-1 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Clear Results
            </button>
          </div>

          {/* Navigation */}
          <div className="text-center pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <a
                href="/dev-login"
                className="block text-sm text-navy hover:text-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                ← Back to Dev Login
              </a>
              <a
                href="/admin"
                className="block text-sm text-navy hover:text-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                → Test Admin Panel
              </a>
              <a
                href="/port-battles"
                className="block text-sm text-navy hover:text-brass transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                → Test Port Battles
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
