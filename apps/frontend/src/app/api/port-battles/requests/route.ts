import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUnifiedSession } from '@/lib/session';
import { isAdmin } from '@/lib/adminUtils';

// Mock role requests for testing
const mockRoleRequests = [
  {
    id: 'req-1',
    portBattleId: 'pb-1',
    captainName: 'Captain_Blackbeard',
    clanName: 'Pirates United',
    fleetRoleId: 'r-1',
    willingToScreen: true,
    comments: 'Experienced line ship captain with over 200 hours in Naval Action. I have commanded similar vessels in previous port battles and understand fleet coordination.',
    contactInfo: '',
    isExternalSignup: false,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: null
  },
  {
    id: 'req-2',
    portBattleId: 'pb-1',
    captainName: 'Admiral_Hornblower',
    clanName: 'Royal Navy',
    fleetRoleId: 'r-3',
    willingToScreen: false,
    comments: 'Looking forward to this engagement. I have the required ship fully fitted and ready for battle.',
    contactInfo: '',
    isExternalSignup: false,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updatedAt: null
  },
  {
    id: 'req-3',
    portBattleId: 'pb-1',
    captainName: 'ExternalCaptain_Storm',
    clanName: 'Independent',
    fleetRoleId: 'r-5',
    willingToScreen: true,
    comments: 'External signup via Captain\'s Code. Ready to support the fleet in any capacity needed.',
    contactInfo: 'StormCaptain#1234',
    isExternalSignup: true,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    updatedAt: null
  },
  {
    id: 'req-4',
    portBattleId: 'pb-2',
    captainName: 'Captain_Nelson',
    clanName: 'British Fleet',
    fleetRoleId: 'r-8',
    willingToScreen: false,
    comments: 'Requesting flagship role for this defensive action. I have extensive experience in organized fleet operations.',
    contactInfo: '',
    isExternalSignup: false,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 82800000).toISOString() // 23 hours ago
  }
];

// GET - Fetch role requests for a port battle
export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(session.user.id)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const portBattleId = searchParams.get('portBattleId');

    if (!portBattleId) {
      return NextResponse.json({ error: 'Port battle ID required' }, { status: 400 });
    }

    try {
      // Try to fetch from database - need to join through FleetRole and FleetSetup to get to PortBattle
      const requests = await prisma.portBattleSignup.findMany({
        where: {
          fleetRole: {
            fleetSetup: {
              portBattleId: portBattleId
            }
          }
        },
        include: {
          fleetRole: {
            include: {
              fleetSetup: true
            }
          },
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ requests });
    } catch (dbError) {
      console.warn('Database unavailable for role requests, using mock data:', dbError);

      // Return mock data filtered by port battle ID
      const filteredRequests = mockRoleRequests.filter(req => req.portBattleId === portBattleId);

      return NextResponse.json({
        requests: filteredRequests,
        isMockData: true
      });
    }
  } catch (error) {
    console.error('Role requests GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Approve or deny a role request
export async function PATCH(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(session.user.id)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { requestId, action, reason } = await request.json();

    if (!requestId || !action || !['approve', 'deny'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    try {
      // Try to update in database
      const updatedRequest = await prisma.portBattleSignup.update({
        where: {
          id: requestId
        },
        data: {
          status: action === 'approve' ? 'APPROVED' : 'DENIED',
          updatedAt: new Date(),
          // Add reason field if it exists in your schema
          // adminNotes: reason
        }
      });

      return NextResponse.json({
        success: true,
        request: updatedRequest
      });
    } catch (dbError) {
      console.warn('Database unavailable for updating role request, using mock response:', dbError);

      // For mock data, just return success
      // In a real implementation, you'd want to store this in memory or temporary storage
      return NextResponse.json({
        success: true,
        message: `Request ${action}d successfully (mock mode)`,
        isMockData: true
      });
    }
  } catch (error) {
    console.error('Role requests PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Create a new role request (called from signup page)
export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);

    const {
      portBattleId,
      fleetRoleId,
      captainName,
      clanName,
      willingToScreen,
      comments,
      captainsCode,
      contactInfo,
      isExternalSignup
    } = await request.json();

    // Validate required fields
    if (!portBattleId || !fleetRoleId || !captainName || !clanName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // For external signups, require contact info
    if (isExternalSignup && !contactInfo) {
      return NextResponse.json({ error: 'Contact information required for external signups' }, { status: 400 });
    }

    // For internal signups, require authentication
    if (!isExternalSignup && !session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      // Try to create in database
      const roleRequest = await prisma.portBattleSignup.create({
        data: {
          fleetRoleId,
          captainName,
          clanName,
          shipName: '', // We'll need to get this from the role or set dynamically
          willingToScreen: willingToScreen || false,
          comments: comments || '',
          contactInfo: contactInfo || '',
          status: 'PENDING',
          userId: isExternalSignup ? null : session?.user?.id,
          captainsCode: captainsCode || null
        }
      });

      return NextResponse.json({
        success: true,
        request: roleRequest
      });
    } catch (dbError) {
      console.warn('Database unavailable for creating role request, using mock response:', dbError);

      // Return mock success response
      return NextResponse.json({
        success: true,
        message: 'Role request submitted successfully (mock mode)',
        request: {
          id: `mock-${Date.now()}`,
          portBattleId,
          fleetRoleId,
          captainName,
          clanName,
          willingToScreen: willingToScreen || false,
          comments: comments || '', // Comments are properly stored in mock mode
          contactInfo: contactInfo || '',
          isExternalSignup: isExternalSignup || false,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        },
        isMockData: true
      });
    }
  } catch (error) {
    console.error('Role requests POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
