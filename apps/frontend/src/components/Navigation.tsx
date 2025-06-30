'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useAuth';

const getNavigationItems = (session: any, isAdmin: boolean) => {
  const baseItems = [
    { name: 'Home', href: '/' },
    { name: 'Marketplace', href: '/marketplace' },
    {
      name: 'Tools',
      href: '/tools',
      submenu: [
        { name: 'Map', href: '/tools/naval-map' }
      ]
    },
    { name: 'Port Battles', href: '/port-battles' },
    { name: 'Gallery', href: '/gallery' },
  ];

  // Add Apply link for non-members only
  if (!session || !session.user?.isMember) {
    baseItems.push({ name: 'Apply Now', href: '/apply' });
  }

  // Add Admin link for admin users
  if (isAdmin) {
    baseItems.push({ name: 'Admin', href: '/admin' });
  }

  return baseItems;
};

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Check if we're on the homepage
  const isHomepage = pathname === '/';

  // Check if user is admin based on role
  const isAdmin = session?.user?.role === 'admin';

  // Get navigation items based on user state
  const navigationItems = getNavigationItems(session, isAdmin);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuth = async () => {
    if (session) {
      // Use the NextAuth signout endpoint directly with proper callback
      window.location.href = '/api/auth/signout?callbackUrl=' + encodeURIComponent(window.location.origin);
    } else {
      // Redirect to login page
      window.location.href = '/auth/login';
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            {/* Navigation Links - Centered, No Borders */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-8">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href || (item.submenu && item.submenu.some(sub => pathname === sub.href));

                  if (item.submenu) {
                    return (
                      <div
                        key={item.name}
                        className="relative group"
                      >
                        <Link
                          href={item.href}
                          className={`nav-item px-4 py-2 text-sm font-bold ${
                            isActive ? 'active' : ''
                          } ${isHomepage ? 'static-red-gradient' : ''}`}
                          style={{
                            fontFamily: 'Cinzel, serif',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            color: isHomepage ? 'transparent' : 'var(--navy-dark)',
                            textShadow: isHomepage ? 'none' : 'none'
                          }}
                        >
                          {item.name} ↓
                        </Link>

                        <div className="absolute top-full left-0 mt-1 w-36 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="nav-submenu-item block px-4 py-3 text-sm font-bold text-navy-dark transition-all duration-200"
                              style={{
                                fontFamily: 'Cinzel, serif',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                              }}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`nav-item px-4 py-2 text-sm font-bold ${
                        isActive ? 'active' : ''
                      } ${isHomepage ? 'static-red-gradient' : ''}`}
                      style={{
                        fontFamily: 'Cinzel, serif',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: isHomepage ? 'transparent' : 'var(--navy-dark)',
                        textShadow: isHomepage ? 'none' : 'none'
                      }}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="nav-item p-2"
                style={{
                  color: isHomepage ? 'white' : 'var(--navy-dark)',
                  textShadow: isHomepage ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                }}
                aria-label="Open menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mx-4 mt-2">
            <div className="bg-sail-white/95 rounded-lg shadow-lg p-4 space-y-2">              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-item block px-4 py-2 text-base font-bold ${
                      isActive ? 'active' : ''
                    }`}
                    style={{
                      fontFamily: 'Cinzel, serif',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      color: 'var(--navy-dark)'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            {session ? (
              <div className="border-t border-navy-dark/20 pt-2 mt-2">
                <div className="px-4 py-2 text-sm font-semibold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                  {session.user?.name}
                </div>
                <Link
                  href="/gallery/favorites"
                  className="block px-4 py-2 text-sm text-navy-dark hover:bg-brass/20 transition-colors duration-200"
                  style={{fontFamily: 'Cinzel, serif'}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Favorites
                </Link>
                <Link
                  href="/gallery?filter=myuploads"
                  className="block px-4 py-2 text-sm text-navy-dark hover:bg-brass/20 transition-colors duration-200"
                  style={{fontFamily: 'Cinzel, serif'}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Uploads
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-navy-dark hover:bg-brass/20 transition-colors duration-200"
                    style={{fontFamily: 'Cinzel, serif'}}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ⚓ Admin Panel
                  </Link>
                )}
              </div>
            ) : null}
            <button
              className="block w-full text-left px-4 py-2 bg-brass hover:bg-brass-bright text-navy-dark font-medium rounded transition-all duration-300 mt-4"
              style={{fontFamily: 'Cinzel, serif'}}
              onClick={handleAuth}
            >
              {session ? 'Logout' : 'Login'}
            </button>
            </div>
          </div>
        )}
      </nav>

      {/* Profile Picture / Login Button - Top Right */}
      <div className="fixed top-4 right-6 z-50">
        {status === 'loading' ? (
          <div className="w-10 h-10 bg-sail-white rounded-full shadow-lg animate-pulse flex items-center justify-center">
            <div className="text-xs text-navy-dark">...</div>
          </div>
        ) : session ? (
          <div className="relative group">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg border-2 border-brass hover:border-brass-bright transition-all duration-300 cursor-pointer">
              <img
                src={session.user?.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNkI3Mjg2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'}
                alt={session.user?.name || 'Profile'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNkI3Mjg2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                }}
              />
            </div>
            {/* Profile Dropdown - Hidden on mobile, shown on hover/focus */}
            <div className="hidden md:block absolute right-0 mt-2 w-48 bg-sail-white rounded-lg shadow-lg border-2 border-navy-dark opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="p-3 border-b border-navy-dark/20">
                <div className="text-sm font-semibold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                  {session.user?.name}
                </div>
                <div className="text-xs text-navy-dark/70">
                  UWS Captain
                </div>
              </div>
              <div className="py-2">
                <Link
                  href="/gallery/favorites"
                  className="block px-4 py-2 text-sm text-navy-dark hover:bg-brass/20 transition-colors duration-200"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  My Favorites
                </Link>
                <Link
                  href="/gallery?filter=myuploads"
                  className="block px-4 py-2 text-sm text-navy-dark hover:bg-brass/20 transition-colors duration-200"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  My Uploads
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-navy-dark hover:bg-brass/20 transition-colors duration-200 border-t border-navy-dark/20"
                    style={{fontFamily: 'Cinzel, serif'}}
                  >
                    ⚓ Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleAuth}
                  className="block w-full text-left px-4 py-2 text-sm text-navy-dark hover:bg-brass/20 transition-colors duration-200"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="login-floating px-6 py-3 bg-brass text-navy-dark font-medium rounded-full shadow-lg hover:bg-brass-bright transition-all duration-300"
            style={{fontFamily: 'Cinzel, serif'}}
            onClick={handleAuth}
          >
            Login
          </button>
        )}
      </div>
    </>
  );
}
