'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-navy-dark via-navy to-navy-light lg:bg-sail-white">
          <div className="w-full max-w-md">
            {/* Return to Home Link */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center text-black lg:text-black hover:text-gray-700 lg:hover:text-gray-700 text-sm font-medium transition-colors"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                ← Return to Port
              </Link>
            </div>

            <div className="neo-brutal-box bg-sail-white p-8 lg:shadow-none lg:border-none text-center">
              <div className="text-6xl mb-6">📧</div>
              <h1 className="text-3xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Check Your Email
              </h1>
              <p className="text-navy-dark/70 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
                If an account with that email exists, we've sent you a password reset link.
              </p>
              <Link
                href="/auth/login"
                className="inline-block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-md font-semibold transition-all border-2 border-red-600 hover:border-red-700"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://greydogtales.com/blog/wp-content/uploads/2016/03/ghost_ship_approaching_by_matchack-deviantart.jpg")'
            }}
          />

          {/* Hero Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/80 via-navy-dark/60 to-navy-dark/90"></div>

          {/* Hero Content - Centered */}
          <div className="relative z-10 flex items-center justify-center h-full w-full">
            <div className="text-center px-4 max-w-2xl">
              {/* Pirate Flag Logo */}
              <div className="mb-8 flex justify-center">
                <div className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl logo-floating">
                  <img
                    src="https://i.imgur.com/3efff8f4.png"
                    alt="Pirate Flag Logo"
                    className="w-full h-full object-contain filter drop-shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <svg viewBox="0 0 200 200" class="w-full h-full">
                            <rect x="0" y="0" width="200" height="200" fill="#1a1a1a"/>
                            <circle cx="100" cy="80" r="25" fill="white"/>
                            <circle cx="90" cy="75" r="4" fill="black"/>
                            <circle cx="110" cy="75" r="4" fill="black"/>
                            <polygon points="100,85 95,95 105,95" fill="black"/>
                            <rect x="60" y="125" width="80" height="8" fill="white" transform="rotate(45 100 129)"/>
                            <rect x="60" y="125" width="80" height="8" fill="white" transform="rotate(-45 100 129)"/>
                            <circle cx="67" cy="122" r="6" fill="white"/>
                            <circle cx="133" cy="122" r="6" fill="white"/>
                            <circle cx="67" cy="136" r="6" fill="white"/>
                            <circle cx="133" cy="136" r="6" fill="white"/>
                          </svg>
                        `;
                      }
                    }}
                  />              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-navy-dark via-navy to-navy-light lg:bg-sail-white">
        <div className="w-full max-w-md">
          {/* Return to Home Link */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-black lg:text-black hover:text-gray-700 lg:hover:text-gray-700 text-sm font-medium transition-colors"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              ← Return to Port
            </Link>
          </div>

          <div className="lg:hidden text-center mb-8">
            {/* Mobile logo placeholder if needed */}
          </div>

          <div className="neo-brutal-box bg-sail-white p-8 lg:shadow-none lg:border-none">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="static-red-gradient text-3xl font-bold mb-2">
                Reset Password
              </h2>
              <p className="text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>
                Enter your email to receive a reset link
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-navy-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brass focus:border-transparent transition-all"
                  placeholder="captain@uwsgaming.org"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 rounded-md font-semibold transition-all border-2 ${
                  loading
                    ? 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-red-600 hover:border-red-700'
                }`}
                style={{fontFamily: 'Cinzel, serif'}}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <Link
                href="/auth/login"
                className="block text-red-600 hover:text-red-700 text-sm font-medium"
                style={{fontFamily: 'Crimson Text, serif'}}
              >
                Back to Login
              </Link>
              <div className="text-sm text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>
                Need to join the fleet?{' '}
                <Link href="/apply" className="text-red-600 hover:text-red-700 font-semibold">
                  Apply for a Letter of Marque
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://preview.redd.it/7znsvaed7wo51.jpg?auto=webp&s=9bf67432f156d99e0b1b73e654e07fab1f85dab3")'
          }}
        />

        {/* Hero Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/80 via-navy-dark/60 to-navy-dark/90"></div>

        {/* Hero Content - Centered */}
        <div className="relative z-10 flex items-center justify-center h-full w-full">
          <div className="text-center px-4 max-w-2xl">
            {/* Pirate Flag Logo */}
            <div className="mb-8 flex justify-center">
              <div className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl logo-floating">
                <img
                  src="/uws-logo.png"
                  alt="UWS Logo"
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <svg viewBox="0 0 200 200" class="w-full h-full">
                          <rect x="0" y="0" width="200" height="200" fill="#1a1a1a"/>
                          <circle cx="100" cy="80" r="25" fill="white"/>
                          <circle cx="90" cy="75" r="4" fill="black"/>
                          <circle cx="110" cy="75" r="4" fill="black"/>
                          <polygon points="100,85 95,95 105,95" fill="black"/>
                          <rect x="60" y="125" width="80" height="8" fill="white" transform="rotate(45 100 129)"/>
                          <rect x="60" y="125" width="80" height="8" fill="white" transform="rotate(-45 100 129)"/>
                          <circle cx="67" cy="122" r="6" fill="white"/>
                          <circle cx="133" cy="122" r="6" fill="white"/>
                          <circle cx="67" cy="136" r="6" fill="white"/>
                          <circle cx="133" cy="136" r="6" fill="white"/>
                        </svg>
                      `;
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
