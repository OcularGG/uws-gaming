import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legal | UWS',
  description: 'Legal information, Terms of Service, Privacy Policy, and other legal documents for United We Stand.',
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-sandstone-light">
      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold hero-title-gradient mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Legal Information
          </h1>
          <p className="text-xl text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
            Important legal documents and policies for United We Stand
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="neo-brutal-box p-6">
            <h2 className="text-2xl font-semibold captain-gradient mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Terms of Service
            </h2>
            <p className="text-navy-dark mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
              Our Terms of Service outline the rules and regulations for using the UWS platform.
            </p>
            <Link
              href="/legal/terms"
              className="text-brass hover:text-brass-bright font-medium" style={{fontFamily: 'Cinzel, serif'}}
            >
              Read Terms of Service →
            </Link>
          </div>

          <div className="neo-brutal-box p-6">
            <h2 className="text-2xl font-semibold captain-gradient mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Privacy Policy
            </h2>
            <p className="text-navy-dark mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
              Learn how we collect, use, and protect your personal information.
            </p>
            <Link
              href="/legal/privacy"
              className="text-brass hover:text-brass-bright font-medium" style={{fontFamily: 'Cinzel, serif'}}
            >
              Read Privacy Policy →
            </Link>
          </div>

          <div className="neo-brutal-box p-6">
            <h2 className="text-2xl font-semibold captain-gradient mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Cookie Policy
            </h2>
            <p className="text-navy-dark mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
              Information about how we use cookies and similar technologies.
            </p>
            <Link
              href="/legal/cookies"
              className="text-brass hover:text-brass-bright font-medium" style={{fontFamily: 'Cinzel, serif'}}
            >
              Read Cookie Policy →
            </Link>
          </div>

          <div className="neo-brutal-box p-6">
            <h2 className="text-2xl font-semibold captain-gradient mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Community Guidelines
            </h2>
            <p className="text-navy-dark mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
              Rules and expectations for community behavior on our platform.
            </p>
            <Link
              href="/legal/community"
              className="text-brass hover:text-brass-bright font-medium" style={{fontFamily: 'Cinzel, serif'}}
            >
              Read Community Guidelines →
            </Link>
          </div>
        </div>

        <div className="neo-brutal-box p-6">
          <h2 className="text-2xl font-semibold captain-gradient mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Contact Information
          </h2>
          <div className="space-y-2 text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
            <p><strong>Legal Inquiries:</strong> legal@unitedwestand.org</p>
            <p><strong>Privacy Questions:</strong> privacy@unitedwestand.org</p>
            <p><strong>General Contact:</strong> support@unitedwestand.org</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-navy-dark/70" style={{fontFamily: 'Cinzel, serif'}}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
