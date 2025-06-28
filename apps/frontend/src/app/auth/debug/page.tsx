'use client';

import { useSession } from '@/hooks/useAuth';
import { getProviders } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState<any>(null);
  const [authUrl, setAuthUrl] = useState<string>('');

  useEffect(() => {
    getProviders().then(setProviders);
    setAuthUrl(window.location.origin);
  }, []);

  return (
    <div className="min-h-screen bg-navy-dark text-sail-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-brass">🔐 Authentication Debug</h1>

        <div className="grid gap-6">
          {/* Current Session */}
          <div className="neo-brutal-box p-6 bg-sail-white text-navy-dark">
            <h2 className="text-xl font-bold mb-4">Current Session</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>User:</strong> {session?.user?.name || 'Not logged in'}</p>
              <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
              <p><strong>Discord ID:</strong> {session?.user?.discordId || 'N/A'}</p>
            </div>
            <pre className="mt-4 bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          {/* Environment Info */}
          <div className="neo-brutal-box p-6 bg-sail-white text-navy-dark">
            <h2 className="text-xl font-bold mb-4">Environment Info</h2>
            <div className="space-y-2">
              <p><strong>Current URL:</strong> {authUrl}</p>
              <p><strong>Environment:</strong> {process.env.NEXT_PUBLIC_ENV}</p>
              <p><strong>Domain:</strong> {process.env.NEXT_PUBLIC_DOMAIN}</p>
            </div>
          </div>

          {/* Providers */}
          <div className="neo-brutal-box p-6 bg-sail-white text-navy-dark">
            <h2 className="text-xl font-bold mb-4">Available Providers</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(providers, null, 2)}
            </pre>
          </div>

          {/* Auth URLs */}
          <div className="neo-brutal-box p-6 bg-sail-white text-navy-dark">
            <h2 className="text-xl font-bold mb-4">Auth URLs to Test</h2>
            <div className="space-y-2">
              <a
                href="/api/auth/signin"
                className="block p-3 bg-brass text-navy-dark hover:bg-brass-bright transition-colors"
              >
                🔑 Sign In Page
              </a>
              <a
                href="/api/auth/signout"
                className="block p-3 bg-cannon-smoke text-sail-white hover:bg-gray-600 transition-colors"
              >
                🚪 Sign Out
              </a>
              <a
                href="/api/auth/session"
                className="block p-3 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                📋 Session JSON
              </a>
            </div>
          </div>

          {/* Discord OAuth URLs */}
          <div className="neo-brutal-box p-6 bg-sail-white text-navy-dark">
            <h2 className="text-xl font-bold mb-4">Expected Discord Redirect URIs</h2>
            <div className="space-y-2 text-sm">
              <p className="font-mono bg-gray-100 p-2 rounded">
                {authUrl}/api/auth/callback/discord
              </p>
              <p className="text-gray-600">
                ☝️ This URL must be configured in your Discord application
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
