'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { isAdmin as checkIsAdmin } from '@/lib/adminUtils'
import Link from 'next/link'

interface GalleryReport {
  id: string
  itemId: string
  reporterId: string
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  item: {
    id: string
    title: string
    type: 'image' | 'video'
    url: string
    author: {
      username: string
    }
  }
  reporter: {
    username: string
  }
}

export default function GalleryReportsPage() {
  const { data: session, status } = useSession()
  const [reports, setReports] = useState<GalleryReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending')

  useEffect(() => {
    if (session?.user && checkIsAdmin(session.user)) {
      fetchReports()
    }
  }, [session])

  const fetchReports = async () => {
    try {
      // For now, use placeholder data
      const mockReports: GalleryReport[] = [
        {
          id: '1',
          itemId: 'item1',
          reporterId: 'user1',
          reason: 'inappropriate_content',
          description: 'This image contains inappropriate content that violates community guidelines.',
          status: 'pending',
          createdAt: new Date().toISOString(),
          item: {
            id: 'item1',
            title: 'Battle Screenshot',
            type: 'image',
            url: '/placeholder-400x300.jpg',
            author: { username: 'user123' }
          },
          reporter: { username: 'reporter1' }
        }
      ]

      setReports(mockReports)
    } catch (error) {
      console.error('Error fetching gallery reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    try {
      // API call would go here
      setReports(reports.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      ))
    } catch (error) {
      console.error('Error updating report status:', error)
    }
  }

  const deleteGalleryItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this gallery item? This action cannot be undone.')) {
      try {
        // API call would go here
        setReports(reports.map(report =>
          report.itemId === itemId ? { ...report, status: 'resolved' as const } : report
        ))
      } catch (error) {
        console.error('Error deleting gallery item:', error)
      }
    }
  }

  if (status === 'loading' || loading) {
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
          <h1 className="static-red-gradient text-2xl font-bold mb-4">Access Denied</h1>
          <Link href="/" className="bg-brass hover:bg-brass-bright text-white px-6 py-3 rounded-md">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const filteredReports = reports.filter(report =>
    filter === 'all' || report.status === filter
  )

  const reasonLabels = {
    inappropriate_content: 'Inappropriate Content',
    spam: 'Spam',
    harassment: 'Harassment',
    copyright: 'Copyright Violation',
    other: 'Other'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      {/* Header */}
      <div className="bg-navy-dark/50 backdrop-blur-sm border-b border-sail-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="static-red-gradient text-3xl font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                Gallery Reports
              </h1>
              <p className="text-sail-white/70 mt-2" style={{fontFamily: 'Crimson Text, serif'}}>
                Review and moderate reported gallery content
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-brass hover:bg-brass-bright text-white px-4 py-2 rounded-md font-semibold transition-all"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="neo-brutal-box bg-sail-white p-1 mb-6 inline-flex rounded-lg">
          {(['all', 'pending', 'resolved', 'dismissed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                filter === tab
                  ? 'bg-brass text-white'
                  : 'text-navy-dark hover:bg-navy-dark/5'
              }`}
              style={{fontFamily: 'Cinzel, serif'}}
            >
              {tab} ({reports.filter(r => tab === 'all' || r.status === tab).length})
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.length === 0 ? (
            <div className="neo-brutal-box bg-sail-white p-8 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                No Reports Found
              </h3>
              <p className="text-navy-dark/70">
                {filter === 'pending' ? 'No pending reports to review.' : `No ${filter} reports found.`}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="neo-brutal-box bg-sail-white p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Report Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                          Report #{report.id}
                        </h3>
                        <p className="text-sm text-navy-dark/70">
                          Reported by <span className="font-medium">{report.reporter.username}</span> on{' '}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-navy-dark">Reason: </span>
                        <span className="text-brass font-medium">
                          {reasonLabels[report.reason as keyof typeof reasonLabels] || report.reason}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium text-navy-dark">Description: </span>
                        <p className="text-navy-dark/80 mt-1">{report.description}</p>
                      </div>

                      <div>
                        <span className="font-medium text-navy-dark">Reported Item: </span>
                        <p className="text-navy-dark/80">
                          "{report.item.title}" by {report.item.author.username}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {report.status === 'pending' && (
                      <div className="flex space-x-3 mt-6">
                        <button
                          onClick={() => updateReportStatus(report.id, 'dismissed')}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold transition-all"
                        >
                          Dismiss Report
                        </button>
                        <button
                          onClick={() => deleteGalleryItem(report.itemId)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition-all"
                        >
                          Delete Content
                        </button>
                        <button
                          onClick={() => updateReportStatus(report.id, 'resolved')}
                          className="bg-brass hover:bg-brass-bright text-white px-4 py-2 rounded-md font-semibold transition-all"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div>
                    <h4 className="font-medium text-navy-dark mb-3">Content Preview</h4>
                    <div className="border-2 border-navy-dark/20 rounded-lg overflow-hidden">
                      {report.item.type === 'image' ? (
                        <img
                          src={report.item.url}
                          alt={report.item.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/300/200';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-navy-dark/10 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎥</div>
                            <p className="text-sm text-navy-dark/70">Video Content</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <Link
                        href={`/gallery/${report.itemId}`}
                        className="text-brass hover:text-brass-bright text-sm font-medium"
                        target="_blank"
                      >
                        View Full Item →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="neo-brutal-box bg-sail-white p-4 text-center">
            <div className="text-2xl font-bold static-red-gradient">
              {reports.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-navy-dark/70">Pending</div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'resolved').length}
            </div>
            <div className="text-sm text-navy-dark/70">Resolved</div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {reports.filter(r => r.status === 'dismissed').length}
            </div>
            <div className="text-sm text-navy-dark/70">Dismissed</div>
          </div>
          <div className="neo-brutal-box bg-sail-white p-4 text-center">
            <div className="text-2xl font-bold text-navy-dark">
              {reports.length}
            </div>
            <div className="text-sm text-navy-dark/70">Total Reports</div>
          </div>
        </div>
      </div>
    </div>
  )
}
