'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  discordId: string;
  name: string;
  email?: string;
  image?: string;
  joinedAt: string;
  lastActive: string;
  permissions: {
    canUpload: boolean;
    canComment: boolean;
    canVote: boolean;
    canManagePortBattles: boolean;
    canDeleteOwnPosts: boolean;
    canReportContent: boolean;
    isModerator: boolean;
    isAdmin: boolean;
  };
}

interface ReportedContent {
  id: string;
  type: 'comment' | 'gallery';
  content: string;
  reporter: string;
  reporterDiscordId: string;
  reason: string;
  reportedAt: string;
  status: 'pending' | 'approved' | 'deleted';
  originalItem?: any;
}

interface Application {
  id: string;
  applicantName: string;
  discordUsername?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  responses: {
    personalParticulars: {
      captainName: string;
      preferredNickname: string;
      currentNation: string;
      timeZone: string;
    };
    navalExperience: {
      hoursInNavalAction: number;
      steamVerified: boolean;
      currentRank: string;
      previousCommands: string;
      preferredRole: string;
      isPortBattleCommander: boolean;
      commanderExperience?: string;
    };
    craftingExperience: {
      isCrafter: boolean;
    };
    availability: {
      weeklyPlayTime: number;
      portBattleAvailability: string[];
      typicalSchedule: string;
    };
    signature: string;
    submissionDate: string;
  };
}

interface CommandStructurePosition {
  id: string;
  position: string;
  title: string;
  description: string;
  linkedUserId?: string;
  linkedUserName?: string;
  linkedUserImage?: string;
  displayOrder: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'applications' | 'command'>('users');
  const [loading, setLoading] = useState(true);

  // Mock data - in a real app, this would come from your backend
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      discordId: '1207434980855259206',
      name: 'CHOSEN',
      email: 'admin@krakengaming.org',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY0MDQ0Ii8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
      joinedAt: '2024-01-01T00:00:00Z',
      lastActive: '2024-06-25T10:00:00Z',
      permissions: {
        canUpload: true,
        canComment: true,
        canVote: true,
        canManagePortBattles: true,
        canDeleteOwnPosts: true,
        canReportContent: true,
        isModerator: true,
        isAdmin: true,
      }
    },
    {
      id: '2',
      discordId: '123456789012345678',
      name: 'TestCaptain',
      email: 'test@example.com',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMDA3Q0ZGIi8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
      joinedAt: '2024-02-15T00:00:00Z',
      lastActive: '2024-06-24T15:30:00Z',
      permissions: {
        canUpload: true,
        canComment: true,
        canVote: true,
        canManagePortBattles: false,
        canDeleteOwnPosts: true,
        canReportContent: true,
        isModerator: false,
        isAdmin: false,
      }
    }
  ]);

  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([
    {
      id: '1',
      type: 'comment',
      content: 'This is an inappropriate comment that was reported',
      reporter: 'ReportingUser',
      reporterDiscordId: '987654321098765432',
      reason: 'Inappropriate language',
      reportedAt: '2024-06-25T09:00:00Z',
      status: 'pending'
    },
    {
      id: '2',
      type: 'gallery',
      content: 'Inappropriate gallery post title and description',
      reporter: 'AnotherUser',
      reporterDiscordId: '112233445566778899',
      reason: 'Spam content',
      reportedAt: '2024-06-24T14:30:00Z',
      status: 'pending'
    }
  ]);

  const [applications, setApplications] = useState<Application[]>([
    {
      id: '1',
      applicantName: 'NewRecruit',
      discordUsername: 'NewRecruit#1234',
      submittedAt: '2024-06-24T12:00:00Z',
      status: 'pending',
      responses: {
        personalParticulars: {
          captainName: 'Captain NewRecruit',
          preferredNickname: 'Rookie',
          currentNation: 'Great Britain',
          timeZone: 'EST (UTC-5)'
        },
        navalExperience: {
          hoursInNavalAction: 250,
          steamVerified: true,
          currentRank: 'Lieutenant Commander',
          previousCommands: 'I have commanded several frigate squadrons in patrol operations.',
          preferredRole: 'Line of Battle',
          isPortBattleCommander: false
        },
        craftingExperience: {
          isCrafter: true
        },
        availability: {
          weeklyPlayTime: 20,
          portBattleAvailability: ['Weekends'],
          typicalSchedule: 'Evenings 7-11 PM EST, weekends flexible'
        },
        signature: 'NewRecruit',
        submissionDate: '2024-06-24'
      }
    }
  ]);

  const [commandStructure, setCommandStructure] = useState<CommandStructurePosition[]>([
    {
      id: '1',
      position: 'founder',
      title: 'Chairman of the Defence Council and First Sea Lord',
      description: 'Clan Founder',
      linkedUserId: '1',
      linkedUserName: 'CHOSEN',
      linkedUserImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY0MDQ0Ii8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
      displayOrder: 1
    },
    {
      id: '2',
      position: 'vice-admiral',
      title: 'Vice-Admiral of the Fleet',
      description: 'Second in Command',
      displayOrder: 2
    },
    {
      id: '3',
      position: 'rear-admiral',
      title: 'Rear Admiral - Operations',
      description: 'Port Battle Coordinator',
      displayOrder: 3
    }
  ]);

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.discordId !== '1207434980855259206') {
      router.push('/');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  const handlePermissionToggle = (userId: string, permission: keyof User['permissions']) => {
    setUsers(prev => prev.map(user =>
      user.id === userId
        ? {
            ...user,
            permissions: {
              ...user.permissions,
              [permission]: !user.permissions[permission]
            }
          }
        : user
    ));
  };

  const handleReportAction = (reportId: string, action: 'approve' | 'delete') => {
    setReportedContent(prev => prev.map(report =>
      report.id === reportId
        ? { ...report, status: action === 'approve' ? 'approved' : 'deleted' }
        : report
    ));
  };

  const handleApplicationAction = (applicationId: string, action: 'approve' | 'reject') => {
    setApplications(prev => prev.map(app =>
      app.id === applicationId
        ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' }
        : app
    ));
  };

  const handleCommandStructureLink = (positionId: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setCommandStructure(prev => prev.map(pos =>
      pos.id === positionId
        ? {
            ...pos,
            linkedUserId: userId,
            linkedUserName: user.name,
            linkedUserImage: user.image
          }
        : pos
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4 loading-anchor">⚓</div>
            <h1 className="text-4xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Loading Admiral's Bridge...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.discordId !== '1207434980855259206') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            ⚓ Admiral's Bridge
          </h1>
          <p className="text-sail-white/80 text-xl" style={{fontFamily: 'Crimson Text, serif'}}>
            Command and Control Center for KRAKEN Squadron Operations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="neo-brutal-box bg-sail-white mb-8">
          <div className="flex border-b-2 border-navy-dark">
            {[
              { id: 'users', label: 'User Management', icon: '👥' },
              { id: 'reports', label: 'Content Reports', icon: '⚠️' },
              { id: 'applications', label: 'Applications', icon: '📋' },
              { id: 'command', label: 'Command Structure', icon: '⭐' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brass text-navy-dark border-b-4 border-brass-bright'
                    : 'text-navy-dark hover:bg-brass/20'
                }`}
                style={{fontFamily: 'Cinzel, serif'}}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="neo-brutal-box bg-sail-white p-6">
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                User Management & Permissions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-navy-dark">
                      <th className="text-left p-3 font-semibold" style={{fontFamily: 'Cinzel, serif'}}>User</th>
                      <th className="text-left p-3 font-semibold" style={{fontFamily: 'Cinzel, serif'}}>Discord ID</th>
                      <th className="text-left p-3 font-semibold" style={{fontFamily: 'Cinzel, serif'}}>Last Active</th>
                      <th className="text-left p-3 font-semibold" style={{fontFamily: 'Cinzel, serif'}}>Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-navy-dark/20">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNkI3Mjg2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'}
                              alt={user.name}
                              className="w-10 h-10 rounded-full border-2 border-brass"
                            />
                            <div>
                              <div className="font-semibold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                                {user.name}
                              </div>
                              <div className="text-sm text-navy-dark/70">
                                Joined {formatDate(user.joinedAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-navy-dark font-mono text-sm">{user.discordId}</td>
                        <td className="p-3 text-navy-dark/70 text-sm">{formatDate(user.lastActive)}</td>
                        <td className="p-3">
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(user.permissions).map(([permission, enabled]) => (
                              <label key={permission} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={() => handlePermissionToggle(user.id, permission as keyof User['permissions'])}
                                  className="rounded border-navy-dark/30"
                                  disabled={user.discordId === '1207434980855259206' && permission === 'isAdmin'}
                                />
                                <span className="text-navy-dark capitalize">
                                  {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Content Reports Queue
              </h2>
              <div className="space-y-4">
                {reportedContent.filter(report => report.status === 'pending').map(report => (
                  <div key={report.id} className="border-2 border-navy-dark/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            report.type === 'comment' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {report.type === 'comment' ? '💬 Comment' : '🖼️ Gallery Post'}
                          </span>
                          <span className="text-navy-dark/70 text-sm">
                            Reported by {report.reporter} • {formatDate(report.reportedAt)}
                          </span>
                        </div>
                        <div className="text-navy-dark font-semibold mb-2">
                          Reason: {report.reason}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReportAction(report.id, 'approve')}
                          className="neo-brutal-button bg-green-500 text-white px-4 py-2 text-sm"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReportAction(report.id, 'delete')}
                          className="neo-brutal-button bg-red-500 text-white px-4 py-2 text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    <div className="bg-navy-dark/5 p-3 rounded border-l-4 border-brass">
                      <div className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                        "{report.content}"
                      </div>
                    </div>
                  </div>
                ))}
                {reportedContent.filter(report => report.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-navy-dark/70">
                    <div className="text-4xl mb-4">⚓</div>
                    <p style={{fontFamily: 'Crimson Text, serif'}}>
                      All clear! No pending reports at this time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Membership Applications
              </h2>
              <div className="space-y-6">
                {applications.filter(app => app.status === 'pending').map(application => (
                  <div key={application.id} className="border-2 border-navy-dark/20 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                          Application from {application.applicantName}
                        </h3>
                        <p className="text-navy-dark/70">
                          Submitted {formatDate(application.submittedAt)}
                          {application.discordUsername && ` • Discord: ${application.discordUsername}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApplicationAction(application.id, 'approve')}
                          className="neo-brutal-button bg-green-500 text-white px-6 py-2"
                          style={{fontFamily: 'Cinzel, serif'}}
                        >
                          ⚓ Approve
                        </button>
                        <button
                          onClick={() => handleApplicationAction(application.id, 'reject')}
                          className="neo-brutal-button bg-red-500 text-white px-6 py-2"
                          style={{fontFamily: 'Cinzel, serif'}}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Personal Particulars */}
                      <div className="bg-sandstone-100 p-4 rounded">
                        <h4 className="font-bold text-navy-dark mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                          Personal Particulars
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Captain Name:</strong> {application.responses.personalParticulars.captainName}</p>
                          <p><strong>Preferred Nickname:</strong> {application.responses.personalParticulars.preferredNickname}</p>
                          <p><strong>Current Nation:</strong> {application.responses.personalParticulars.currentNation}</p>
                          <p><strong>Time Zone:</strong> {application.responses.personalParticulars.timeZone}</p>
                        </div>
                      </div>

                      {/* Naval Experience */}
                      <div className="bg-sandstone-100 p-4 rounded">
                        <h4 className="font-bold text-navy-dark mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                          Naval Experience
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Hours in Naval Action:</strong> {application.responses.navalExperience.hoursInNavalAction}
                            {application.responses.navalExperience.steamVerified && ' ✅'}</p>
                          <p><strong>Current Rank:</strong> {application.responses.navalExperience.currentRank}</p>
                          <p><strong>Preferred Role:</strong> {application.responses.navalExperience.preferredRole}</p>
                          <p><strong>PB Commander:</strong> {application.responses.navalExperience.isPortBattleCommander ? 'Yes' : 'No'}</p>
                        </div>
                        {application.responses.navalExperience.previousCommands && (
                          <div className="mt-3">
                            <strong className="text-navy-dark">Previous Commands:</strong>
                            <p className="text-navy-dark/80 mt-1 text-sm italic">
                              "{application.responses.navalExperience.previousCommands}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Availability */}
                      <div className="bg-sandstone-100 p-4 rounded">
                        <h4 className="font-bold text-navy-dark mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                          Availability
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Weekly Play Time:</strong> {application.responses.availability.weeklyPlayTime} hours</p>
                          <p><strong>PB Availability:</strong> {application.responses.availability.portBattleAvailability.join(', ')}</p>
                          <p><strong>Typical Schedule:</strong> {application.responses.availability.typicalSchedule}</p>
                        </div>
                      </div>

                      {/* Signature */}
                      <div className="bg-sandstone-100 p-4 rounded">
                        <h4 className="font-bold text-navy-dark mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                          Officer's Signature
                        </h4>
                        <div className="bg-sail-white p-3 rounded border" style={{fontFamily: 'cursive', fontSize: '18px'}}>
                          {application.responses.signature}
                        </div>
                        <p className="text-sm text-navy-dark/70 mt-2">
                          Signed on {application.responses.submissionDate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {applications.filter(app => app.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-navy-dark/70">
                    <div className="text-4xl mb-4">📋</div>
                    <p style={{fontFamily: 'Crimson Text, serif'}}>
                      No pending applications at this time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'command' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Command Structure Management
              </h2>
              <p className="text-navy-dark/80 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
                Link website users to command positions for display on the homepage.
              </p>
              <div className="space-y-4">
                {commandStructure.map(position => (
                  <div key={position.id} className="border-2 border-navy-dark/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-300 border-2 border-brass rounded overflow-hidden">
                          {position.linkedUserImage ? (
                            <img
                              src={position.linkedUserImage}
                              alt={position.linkedUserName || 'Position'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                              Photo
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                            {position.title}
                          </h3>
                          <p className="text-sm text-navy-dark/70">{position.description}</p>
                          {position.linkedUserName && (
                            <p className="text-sm text-brass font-semibold">
                              Currently: {position.linkedUserName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <select
                          value={position.linkedUserId || ''}
                          onChange={(e) => handleCommandStructureLink(position.id, e.target.value)}
                          className="neo-brutal-button bg-sail-white text-navy-dark px-4 py-2 border-2 border-navy-dark"
                          style={{fontFamily: 'Cinzel, serif'}}
                        >
                          <option value="">No User Linked</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.discordId})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
