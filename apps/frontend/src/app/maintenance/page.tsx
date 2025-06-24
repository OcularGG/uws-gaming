import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Under Maintenance | KrakenGaming',
  description: 'KrakenGaming is currently under maintenance. We will be back shortly.',
};

export default function MaintenancePage() {
  const estimatedTime = process.env.NEXT_PUBLIC_MAINTENANCE_ESTIMATED_TIME || 'shortly';
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE ||
    'We are currently performing scheduled maintenance to improve your gaming experience.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-600 rounded-full mb-6">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Under Maintenance
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            {maintenanceMessage}
          </p>
          <p className="text-lg text-gray-400 mb-8">
            We&rsquo;ll be back {estimatedTime}. Thank you for your patience!
          </p>
        </div>

        {/* Status Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">
                Status
              </h3>
              <p className="text-orange-400 font-medium">
                Maintenance in Progress
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">
                Started
              </h3>
              <p className="text-white">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">
                Estimated Duration
              </h3>
              <p className="text-white">
                {estimatedTime}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Need immediate assistance?
          </p>
          <div className="space-x-4">
            <a
              href="mailto:support@krakengaming.org"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Contact Support
            </a>
            <a
              href="https://status.krakengaming.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white border border-white hover:bg-white hover:text-gray-900 rounded-lg transition-colors"
            >
              Status Page
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>&copy; 2025 KrakenGaming. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
