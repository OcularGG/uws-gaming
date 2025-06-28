import { auth } from "@/lib/auth"

export default async function NewAuthDebugPage() {
  const session = await auth()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">New Auth.js Debug Page</h1>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Session Status:</h2>
        {session ? (
          <div>
            <p className="text-green-600 font-medium">✅ Authenticated</p>
            <div className="mt-4">
              <h3 className="font-semibold">User Information:</h3>
              <pre className="bg-white p-2 rounded mt-2 text-sm">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-medium">❌ Not Authenticated</p>
            <div className="mt-4">
              <a
                href="/api/auth/signin/discord"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Sign In with Discord
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Auth.js Endpoints Test:</h2>
        <div className="space-y-2">
          <a href="/api/auth/providers" className="block text-blue-600 hover:underline">
            /api/auth/providers - List available providers
          </a>
          <a href="/api/auth/session" className="block text-blue-600 hover:underline">
            /api/auth/session - Current session
          </a>
          <a href="/api/auth/signin/discord" className="block text-blue-600 hover:underline">
            /api/auth/signin/discord - Discord OAuth login
          </a>
          <a href="/api/auth/signout" className="block text-blue-600 hover:underline">
            /api/auth/signout - Sign out
          </a>
        </div>
      </div>
    </div>
  )
}
