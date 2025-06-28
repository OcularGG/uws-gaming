import { useSession } from '@/hooks/useAuth';

/**
 * Custom fetch function for authenticated requests
 */
export function useAuthenticatedFetch() {
  const { data: session } = useSession();

  return async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);

    return fetch(url, {
      ...options,
      headers,
    });
  };
}

/**
 * Get headers for API calls
 */
export function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json'
  };
}
