'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { isAdmin as checkIsAdmin } from '@/lib/adminUtils'
import { adminDashboardApi } from '@/lib/adminApi'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    totalPortBattles: 0,
    pendingApplications: 0,
    activePortBattles: 0,
    galleryReports: 0,
    pendingGDPRRequests: 0,
    totalAuditLogs: 0
  })

  useEffect(() => {
    if (session?.user && checkIsAdmin(session.user)) {
      fetchDashboardStats()
    }
  }, [session])

  const fetchDashboardStats = async () => {
    try {
      const stats = await adminDashboardApi.getStats()
      setStats(stats)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Keep default values on error
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center">
        <div className="text-sail-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session?.user || !checkIsAdmin(session.user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center">
        <div className="neo-brutal-box bg-sail-white p-8 text-center">
          <h1 className="static-red-gradient text-2xl font-bold mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Access Denied
          </h1>
          <p className="text-navy-dark mb-6">You do not have permission to access the admin panel.</p>
          <Link
            href="/"
            className="bg-brass hover:bg-brass-bright text-white px-6 py-3 rounded-md font-semibold transition-all"
            style={{fontFamily: 'Cinzel, serif'}}
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const adminSections = [
    {
      title: 'User Management',
      icon: '👥',
      items: [
        { name: 'Roster', href: '/admin/roster', description: 'View and manage all users', icon: '📋' },
        { name: 'Roles & Permissions', href: '/admin/roles', description: 'Manage user roles and permissions', icon: '🔑' },
        { name: 'Blacklist', href: '/admin/blacklist', description: 'Manage blacklisted users', icon: '🚫' }
      ]
    },
    {
      title: 'Operations',
      icon: '⚔️',
      items: [
        { name: 'Recruiter Manager', href: '/admin/applications', description: 'Manage applications and recruitment', icon: '📝' },
        { name: 'Port Battle Manager', href: '/admin/port-battles', description: 'Manage port battles and events', icon: '🏴‍☠️' }
      ]
    },
    {
      title: 'Content & Reports',
      icon: '📊',
      items: [
        { name: 'Gallery Reports', href: '/admin/gallery-reports', description: 'Review reported gallery content', icon: '🖼️' },
        { name: 'Analytics', href: '/admin/analytics', description: 'View site analytics and statistics', icon: '📈' }
      ]
    },
    {
      title: 'System & Compliance',
      icon: '🛡️',
      items: [
        { name: 'User Activity', href: '/admin/user-activity', description: 'View user activity timeline and logs', icon: '👤' },
        { name: 'Audit Logs', href: '/admin/audit-logs', description: 'View admin actions and system audit logs', icon: '📋' },
        { name: 'GDPR Tools', href: '/admin/gdpr', description: 'Manage data privacy and compliance', icon: '🛡️' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      {/* Header */}
      <div className="bg-navy-dark/50 backdrop-blur-sm border-b border-sail-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="static-red-gradient text-3xl font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                Admin Command Center
              </h1>
              <p className="text-sail-white/70 mt-2" style={{fontFamily: 'Crimson Text, serif'}}>
                Welcome back, Captain {session.user.name}
              </p>
            </div>
            <Link
              href="/"
              className="bg-brass hover:bg-brass-bright text-white px-4 py-2 rounded-md font-semibold transition-all"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Return to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Total Users</p>
                <p className="static-red-gradient text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📝</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Pending Applications</p>
                <p className="static-red-gradient text-2xl font-bold">{stats.pendingApplications}</p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⚔️</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Active Port Battles</p>
                <p className="static-red-gradient text-2xl font-bold">{stats.activePortBattles}</p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🛡️</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">GDPR Requests</p>
                <p className="static-red-gradient text-2xl font-bold">{stats.pendingGDPRRequests}</p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🖼️</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Gallery Reports</p>
                <p className="static-red-gradient text-2xl font-bold">{stats.galleryReports}</p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📋</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Total Applications</p>
                <p className="static-red-gradient text-2xl font-bold">{stats.totalApplications}</p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🗂️</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Port Battles</p>
                <p className="static-red-gradient text-2xl font-bold">{stats.totalPortBattles}</p>
              </div>
            </div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <p className="text-navy-dark/70 text-sm font-medium">Audit Logs (30d)</p>
                <p className="static-red-gradient text-2xl font-bold">{stats.totalAuditLogs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="space-y-8">
          {adminSections.map((section) => (
            <div key={section.title} className="neo-brutal-box bg-sail-white p-6">
              <h2 className="static-red-gradient text-xl font-bold mb-4 flex items-center" style={{fontFamily: 'Cinzel, serif'}}>
                <span className="text-2xl mr-3">{section.icon}</span>
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group p-4 rounded-lg border-2 border-navy-dark hover:border-brass transition-all hover:shadow-lg bg-gradient-to-br from-sail-white to-gray-50"
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <div>
                        <h3 className="font-bold text-navy-dark group-hover:text-brass transition-colors" style={{fontFamily: 'Cinzel, serif'}}>
                          {item.name}
                        </h3>
                        <p className="text-navy-dark/70 text-sm mt-1" style={{fontFamily: 'Crimson Text, serif'}}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
