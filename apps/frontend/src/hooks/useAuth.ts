'use client'

import { useEffect, useState } from 'react'

export function useSession() {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [mockSession, setMockSession] = useState<any>(null)

  useEffect(() => {
    let mockStorageListener: (() => void) | null = null

    // Check for mock session in development
    if (process.env.NODE_ENV === 'development') {
      const checkMockSession = () => {
        const stored = localStorage.getItem('mock-session')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            // Check if session is expired
            if (new Date(parsed.expires) > new Date()) {
              setMockSession(parsed)
              setSession(parsed)
              setStatus('authenticated')
              return true
            } else {
              // Session expired, remove it
              localStorage.removeItem('mock-session')
            }
          } catch (e) {
            // Invalid session, remove it
            localStorage.removeItem('mock-session')
          }
        }
        setMockSession(null)
        return false
      }

      // Create storage listener
      mockStorageListener = () => {
        if (!checkMockSession()) {
          // Mock session removed, check real session
          checkRealSession()
        }
      }

      // Check for mock session first
      if (checkMockSession()) {
        // Listen for storage changes (for cross-tab sync)
        window.addEventListener('storage', mockStorageListener)
        return () => {
          if (mockStorageListener) {
            window.removeEventListener('storage', mockStorageListener)
          }
        }
      }

      // Listen for storage changes
      window.addEventListener('storage', checkMockSession)
    }

    // Check for session using Auth.js v5 session endpoint
    const checkRealSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const sessionData = await response.json()
          if (sessionData && sessionData.user) {
            setSession(sessionData)
            setStatus('authenticated')
          } else {
            setSession(null)
            setStatus('unauthenticated')
          }
        } else {
          setSession(null)
          setStatus('unauthenticated')
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setSession(null)
        setStatus('unauthenticated')
      }
    }

    checkRealSession()

    // Set up periodic session checking
    const interval = setInterval(checkRealSession, 60000) // Check every minute

    return () => {
      clearInterval(interval)
      if (mockStorageListener) {
        window.removeEventListener('storage', mockStorageListener)
      }
    }
  }, [])

  return {
    data: session,
    status,
    isMockSession: mockSession !== null
  }
}
