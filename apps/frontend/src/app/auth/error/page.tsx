'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">
            An error occurred during authentication.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-sm font-medium text-red-800">Error Type:</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-2 text-left">
            <h3 className="font-medium text-gray-900">Debug Information:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Error: {error || 'Unknown'}</li>
              <li>• URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</li>
              <li>• Timestamp: {new Date().toISOString()}</li>
            </ul>
          </div>

          <div className="mt-6">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
