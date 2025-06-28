'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('kraken-cookies-accepted');
    if (!hasAccepted) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = async () => {
    try {
      // Store acceptance in localStorage
      localStorage.setItem('kraken-cookies-accepted', 'true');
      localStorage.setItem('kraken-cookies-accepted-date', new Date().toISOString());

      // Send acceptance data to backend
      await fetch('/api/cookies/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accepted: true,
          timestamp: new Date().toISOString(),
        }),
      });

      setShowBanner(false);
    } catch (error) {
      console.error('Error recording cookie acceptance:', error);
      setShowBanner(false);
    }
  };

  const declineCookies = () => {
    localStorage.setItem('kraken-cookies-accepted', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-dark/95 backdrop-blur-md border-t-4 border-brass p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-brass font-bold text-lg mb-2" style={{fontFamily: 'Cinzel, serif'}}>
            🍪 Ahoy, Captain!
          </h3>
          <p className="text-gray-200 text-sm" style={{fontFamily: 'Crimson Text, serif'}}>
            We use cookies to enhance your naval experience, analyze fleet performance, and provide personalized content.
            By continuing to sail with us, you consent to our use of cookies as outlined in our{' '}
            <a href="/legal" className="text-brass hover:text-brass-bright underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={declineCookies}
            variant="outline"
            className="border-brass text-brass hover:bg-brass hover:text-navy-dark"
            style={{fontFamily: 'Cinzel, serif'}}
          >
            Decline
          </Button>
          <Button
            onClick={acceptCookies}
            className="bg-brass text-navy-dark hover:bg-brass-bright"
            style={{fontFamily: 'Cinzel, serif'}}
          >
            Accept & Set Sail
          </Button>
        </div>
      </div>
    </div>
  );
}
