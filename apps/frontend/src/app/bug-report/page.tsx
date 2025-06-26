'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { useRouter } from 'next/navigation';

const BUG_TYPES = [
  'Login/Authentication Issue',
  'Gallery Upload Problem',
  'Port Battle Sign-up Error',
  'Navigation/UI Issue',
  'Performance Problem',
  'Discord Integration Issue',
  'Application Submission Error',
  'Admin Panel Bug',
  'Other'
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low - Minor inconvenience', color: 'text-green-600' },
  { value: 'medium', label: 'Medium - Affects functionality', color: 'text-yellow-600' },
  { value: 'high', label: 'High - Blocks important features', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical - Site unusable', color: 'text-red-600' }
];

export default function BugReportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    bugType: '',
    severity: 'medium',
    url: '',
    browser: '',
    device: '',
    additionalInfo: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const bugReport = {
        ...formData,
        reporterEmail: session?.user?.email || '',
        reporterName: session?.user?.name || 'Anonymous',
        reporterDiscordId: session?.user?.discordId || '',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        status: 'open'
      };

      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bugReport),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to submit bug report');
      }
    } catch (error) {
      console.error('Bug report submission error:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return !!(formData.title && formData.description && formData.bugType && formData.severity);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-sandstone-light pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="neo-brutal-box p-8 text-center">
            <div className="text-6xl mb-6">🐛✅</div>
            <h1 className="text-3xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Bug Report Submitted!
            </h1>
            <p className="text-lg text-navy-dark/80 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
              Thank you for helping improve KrakenGaming! Our development team will review your report and get back to you if needed.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/')}
                className="neo-brutal-button bg-brass text-navy-dark px-6 py-3"
              >
                Return Home
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    title: '',
                    description: '',
                    stepsToReproduce: '',
                    expectedBehavior: '',
                    actualBehavior: '',
                    bugType: '',
                    severity: 'medium',
                    url: '',
                    browser: '',
                    device: '',
                    additionalInfo: ''
                  });
                }}
                className="neo-brutal-button bg-sail-white text-navy-dark px-6 py-3"
              >
                Report Another Bug
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sandstone-light pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
            <span className="text-brass">🐛</span> Bug Report
          </h1>
          <p className="text-xl text-navy-dark/80 max-w-3xl mx-auto" style={{fontFamily: 'Crimson Text, serif'}}>
            Help us improve KrakenGaming by reporting issues you encounter. Your feedback keeps our ship sailing smoothly!
          </p>
        </div>

        <div className="neo-brutal-box p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                Bug Details
              </h2>

              {/* Title */}
              <div>
                <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Bug Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief summary of the issue"
                  className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                  required
                />
              </div>

              {/* Bug Type & Severity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Bug Type *
                  </label>
                  <select
                    value={formData.bugType}
                    onChange={(e) => handleInputChange('bugType', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                    required
                  >
                    <option value="">Select bug type...</option>
                    {BUG_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => handleInputChange('severity', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                    required
                  >
                    {SEVERITY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the bug"
                  rows={4}
                  className="w-full p-3 border-2 border-navy-dark text-navy-dark resize-vertical"
                  required
                />
              </div>
            </div>

            {/* Reproduction Steps */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                Reproduction Information
              </h2>

              <div>
                <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Steps to Reproduce
                </label>
                <textarea
                  value={formData.stepsToReproduce}
                  onChange={(e) => handleInputChange('stepsToReproduce', e.target.value)}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. Enter...&#10;4. See error"
                  rows={4}
                  className="w-full p-3 border-2 border-navy-dark text-navy-dark resize-vertical"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Expected Behavior
                  </label>
                  <textarea
                    value={formData.expectedBehavior}
                    onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                    placeholder="What should happen?"
                    rows={3}
                    className="w-full p-3 border-2 border-navy-dark text-navy-dark resize-vertical"
                  />
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Actual Behavior
                  </label>
                  <textarea
                    value={formData.actualBehavior}
                    onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                    placeholder="What actually happens?"
                    rows={3}
                    className="w-full p-3 border-2 border-navy-dark text-navy-dark resize-vertical"
                  />
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                Technical Details
              </h2>

              <div>
                <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Page URL (where the bug occurred)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://krakengaming.org/..."
                  className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Browser
                  </label>
                  <input
                    type="text"
                    value={formData.browser}
                    onChange={(e) => handleInputChange('browser', e.target.value)}
                    placeholder="Chrome 120, Firefox 121, Safari 17, etc."
                    className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                  />
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Device
                  </label>
                  <input
                    type="text"
                    value={formData.device}
                    onChange={(e) => handleInputChange('device', e.target.value)}
                    placeholder="Desktop, Mobile, Tablet, specific device"
                    className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Screenshots, error messages, or any other relevant information"
                  rows={3}
                  className="w-full p-3 border-2 border-navy-dark text-navy-dark resize-vertical"
                />
              </div>
            </div>

            {/* Contact Information */}
            {session && (
              <div className="bg-sandstone-100 p-4 rounded border-2 border-navy-dark/20">
                <h3 className="text-lg font-semibold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Contact Information
                </h3>
                <p className="text-navy-dark/70 text-sm" style={{fontFamily: 'Crimson Text, serif'}}>
                  We'll use your account information to follow up if needed:
                </p>
                <div className="mt-2 text-sm text-navy-dark">
                  <strong>Name:</strong> {session.user?.name}<br />
                  <strong>Email:</strong> {session.user?.email}
                  {session.user?.discordId && (
                    <>
                      <br />
                      <strong>Discord:</strong> Connected
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4 justify-center">
              <button
                type="submit"
                disabled={!isFormValid() || loading}
                className="neo-brutal-button bg-brass text-navy-dark px-8 py-3 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Bug Report'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="neo-brutal-button bg-cannon-smoke text-sail-white px-8 py-3"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
