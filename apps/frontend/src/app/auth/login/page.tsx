'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTypewriter } from '@/hooks/useTypewriter'

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const ships = [
    'Duke of Kent',
    'L\'Ocean',
    'Santa Ana',
    'Santisima Trinidad',
    'Victory',
    'Christian',
    'Le Bucentaure',
    'San Pedro',
    'St. Pavel',
    'Admiral de Ruyter',
    'Implacable',
    'Redoubtable',
    'Constitution',
    'Wapen von Hamburg',
    'Indefatigable'
  ];

  useTypewriter('login-typewriter-ship', ships, 1000);
  useTypewriter('login-typewriter-ship-mobile', ships, 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔍 Attempting login with:', { emailOrUsername, passwordLength: password.length })

    try {
      const result = await signIn('credentials', {
        emailOrUsername,
        password,
        redirect: false,
      })

      console.log('🔐 SignIn result:', result)

      if (result?.error) {
        console.log('❌ Login error:', result.error)
        setError('Invalid email/captain name or password')
      } else if (result?.ok) {
        console.log('✅ Login successful, redirecting to dashboard...')
        // Force a page reload to ensure the session is properly established
        window.location.href = '/dashboard'
      } else {
        console.log('🤔 Unexpected result:', result)
        setError('Authentication failed')
      }
    } catch (error) {
      console.error('💥 Login exception:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section Mimic */}
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
              <div className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl logo-floating">
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

            <h1 className="hero-title-gradient text-4xl md:text-6xl mb-6">
              KRAKEN GAMING
            </h1>
            
            <div className="hero-subtitle text-lg md:text-2xl mb-8 max-w-lg mx-auto"
               style={{
                 color: 'var(--sail-white)',
                 textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 10px rgba(22, 101, 52, 0.3)',
                 fontFamily: 'Crimson Text, serif'
               }}>
              <p>
                Set sail with us in your <span id="login-typewriter-ship" className="typewriter-gradient font-bold"></span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-navy-dark via-navy to-navy-light lg:bg-sail-white">
        <div className="w-full max-w-md">
          {/* Return to Home Link */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sail-white lg:text-navy-dark/70 hover:text-sail-white/80 lg:hover:text-navy-dark text-sm font-medium transition-colors"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              ← Return to Port
            </Link>
          </div>

          <div className="lg:hidden text-center mb-8">
            <h1 className="hero-title-gradient text-4xl font-bold mb-2">
              KRAKEN GAMING
            </h1>
            <div className="text-lg" style={{
              color: 'var(--sail-white)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 10px rgba(22, 101, 52, 0.3)',
              fontFamily: 'Crimson Text, serif'
            }}>
              <p>
                Set sail with us in your <span id="login-typewriter-ship-mobile" className="typewriter-gradient font-bold"></span>
              </p>
            </div>
          </div>

          <div className="neo-brutal-box bg-sail-white p-8 lg:shadow-none lg:border-none">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="hero-title-gradient text-3xl font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Welcome Back, Captain
              </h2>
              <p className="text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>
                Access your Naval Command
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="emailOrUsername" className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Email or Captain Name
                </label>
                <input
                  id="emailOrUsername"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-navy-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brass focus:border-transparent transition-all"
                  placeholder="captain@krakengaming.org or YourCaptainName"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-navy-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brass focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 rounded-md font-semibold transition-all border-2 ${
                  loading
                    ? 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed'
                    : 'bg-brass hover:bg-brass-bright text-white border-brass hover:border-brass-bright'
                }`}
                style={{fontFamily: 'Cinzel, serif'}}
              >
                {loading ? 'Setting Sail...' : 'Set Sail'}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <Link
                href="/auth/forgot-password"
                className="block text-brass hover:text-brass-bright text-sm font-medium"
                style={{fontFamily: 'Crimson Text, serif'}}
              >
                Forgot your password?
              </Link>
              <div className="text-sm text-navy-dark/70" style={{fontFamily: 'Crimson Text, serif'}}>
                Need to join the fleet?{' '}
                <Link href="/apply" className="text-brass hover:text-brass-bright font-semibold">
                  Apply for a Letter of Marque
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
