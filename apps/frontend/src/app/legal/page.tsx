import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legal | KrakenGaming',
  description: 'Legal information, Terms of Service, Privacy Policy, and other legal documents for KrakenGaming.',
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Legal Information
          </h1>
          <p className="text-xl text-gray-600">
            Important legal documents and policies for KrakenGaming
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Terms of Service
            </h2>
            <p className="text-gray-600 mb-4">
              Our Terms of Service outline the rules and regulations for using the KrakenGaming platform.
            </p>
            <Link
              href="/legal/terms"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Read Terms of Service →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Privacy Policy
            </h2>
            <p className="text-gray-600 mb-4">
              Learn how we collect, use, and protect your personal information.
            </p>
            <Link
              href="/legal/privacy"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Read Privacy Policy →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Cookie Policy
            </h2>
            <p className="text-gray-600 mb-4">
              Information about how we use cookies and similar technologies.
            </p>
            <Link
              href="/legal/cookies"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Read Cookie Policy →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Community Guidelines
            </h2>
            <p className="text-gray-600 mb-4">
              Rules and expectations for community behavior on our platform.
            </p>
            <Link
              href="/legal/community"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Read Community Guidelines →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-2 text-gray-600">
            <p><strong>Legal Inquiries:</strong> legal@krakengaming.org</p>
            <p><strong>Privacy Questions:</strong> privacy@krakengaming.org</p>
            <p><strong>General Contact:</strong> support@krakengaming.org</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
