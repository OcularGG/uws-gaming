import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | UWS',
  description: 'Terms of Service for KrakenGaming platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 text-lg mb-8">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4">
                By accessing and using the KrakenGaming platform (&ldquo;Service&rdquo;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Use License
              </h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily access the materials on KrakenGaming&rsquo;s platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the platform</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Account Registration
              </h2>
              <p className="text-gray-700 mb-4">
                To access certain features of our Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. User Conduct
              </h2>
              <p className="text-gray-700 mb-4">
                You agree to use the Service only for purposes that are legal, proper, and in accordance with these Terms and any applicable laws or regulations. You may not use the Service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>To violate any local, state, national, or international law</li>
                <li>To transmit any harmful, offensive, or inappropriate content</li>
                <li>To impersonate any person or entity</li>
                <li>To engage in any form of harassment or abuse</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Privacy Policy
              </h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Termination
              </h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Disclaimer
              </h2>
              <p className="text-gray-700 mb-4">
                The materials on KrakenGaming&rsquo;s platform are provided on an &lsquo;as is&rsquo; basis. KrakenGaming makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Contact Information
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-700">
                Email: legal@uwsgaming.org
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
