import { useSession } from '@/hooks/useAuth';

/**
 * Custom fetch function that includes mock session headers in development
 */
export function useAuthenticatedFetch() {
  const { data: session, isMockSession } = useSession();

  return async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);

    // In development, if we have a mock session, include it in headers
    if (process.env.NODE_ENV === 'development' && isMockSession && session) {
      headers.set('x-mock-session', JSON.stringify(session));
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };
}

/**
 * Get headers that include mock session data for API calls
 */
export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}

  // In development, check for mock session
  if (process.env.NODE_ENV === 'development') {
    try {
      const mockSession = localStorage.getItem('mock-session')
      if (mockSession) {
        const parsed = JSON.parse(mockSession)
        if (new Date(parsed.expires) > new Date()) {
          return {
            'x-mock-session': mockSession,
            'Content-Type': 'application/json'
          }
        } else {
          // Session expired, remove it
          localStorage.removeItem('mock-session')
        }
      }
    } catch (e) {
      // Invalid session, remove it
      localStorage.removeItem('mock-session')
    }
  }

  return {
    'Content-Type': 'application/json'
  }
}
