import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUnifiedSession, isAdminSession } from '@/lib/session';

// Helper function to check if user is admin
function isAdmin(userId: string): boolean {
  // Define admin user IDs here - in production, this should be in a database or config
  const adminUserIds = ['1207434980855259206']; // Add actual admin Discord IDs
  return adminUserIds.includes(userId);
}

// Mock data for when database is unavailable
const mockPortBattles = [
  {
    id: 'mock-1',
    title: 'Conquest of Port-au-Prince',
    description: 'Strategic assault on the French stronghold. Elite captains required for this critical operation.',
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    timeZone: 'UTC',
    status: 'PLANNED',
    maxParticipants: 50,
    currentParticipants: 32,
    creator: {
      id: 'mock-creator',
      username: 'Admiral_Kraken',
      discordId: '1207434980855259206'
    },
    fleetSetups: [],
    screeningFleets: []
  },
  {
    id: 'mock-2',
    title: 'Defense of Kingston Harbor',
    description: 'Critical defensive operation against incoming threats. All experienced captains report for duty.',
    scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    timeZone: 'UTC',
    status: 'PLANNED',
    maxParticipants: 50,
    currentParticipants: 18,
    creator: {
      id: 'mock-creator',
      username: 'Admiral_Kraken',
      discordId: '1207434980855259206'
    },
    fleetSetups: [],
    screeningFleets: []
  },
  {
    id: 'mock-3',
    title: 'Raid on Spanish Treasure Fleet',
    description: 'High-value target operation. Exceptional seamanship and tactical coordination required.',
    scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    timeZone: 'UTC',
    status: 'PLANNED',
    maxParticipants: 50,
    currentParticipants: 45,
    creator: {
      id: 'mock-creator',
      username: 'Admiral_Kraken',
      discordId: '1207434980855259206'
    },
    fleetSetups: [],
    screeningFleets: []
  }
];

// GET - Fetch port battles, signups, etc.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    // For public viewing (no auth required for list action)
    if (action === 'list') {
      try {
        // Try to fetch from database
        const portBattles = await prisma.portBattle.findMany({
          include: {
            creator: {
              select: { id: true, username: true, discordId: true }
            }
          },
          orderBy: { battleStartTime: 'asc' }
        });

        return NextResponse.json({ portBattles });
      } catch (dbError) {
        console.warn('Database unavailable for port battles, using fallback data:', dbError);

        // Return mock data when database is unavailable
        return NextResponse.json({
          portBattles: mockPortBattles,
          isMockData: true,
          message: 'Using fallback data - database temporarily unavailable'
        });
      }
    }

    // For other actions, require authentication
    const session = await getUnifiedSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    switch (action) {
      case 'calendar': {
        try {
          const startDate = searchParams.get('start');
          const endDate = searchParams.get('end');

          const where: any = {};
          if (startDate) {
            where.scheduledDate = { gte: new Date(startDate) };
          }
          if (endDate) {
            where.scheduledDate = { ...where.scheduledDate, lte: new Date(endDate) };
          }

          const events = await prisma.portBattle.findMany({
            where,
            select: {
              id: true,
              title: true,
              scheduledDate: true,
              status: true,
              maxParticipants: true,
              currentParticipants: true
            },
            orderBy: { scheduledDate: 'asc' }
          });

          return NextResponse.json({ events });
        } catch (dbError) {
          console.error('Database error fetching calendar:', dbError);
          return NextResponse.json({
            events: mockPortBattles.map(pb => ({
              id: pb.id,
              title: pb.title,
              scheduledDate: pb.scheduledDate,
              status: pb.status,
              maxParticipants: pb.maxParticipants,
              currentParticipants: pb.currentParticipants
            })),
            isMockData: true
          });
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Port battles API error:', error);
    return NextResponse.json({
      error: 'Server error',
      portBattles: action === 'list' ? mockPortBattles : undefined,
      isMockData: true
    }, { status: 500 });
  }
}

// POST - Create new port battle, signup for battles, etc.
export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { action, ...data } = await request.json();

    switch (action) {
      case 'create': {
        // Check if user can create port battles
        if (!isAdmin(session.user.id)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        try {
          const portBattle = await prisma.portBattle.create({
            data: {
              ...data,
              creatorId: session.user.id,
              status: 'PLANNED'
            },
            include: {
              creator: {
                select: { id: true, username: true, discordId: true }
              }
            }
          });

          return NextResponse.json({ portBattle });
        } catch (dbError) {
          console.error('Database error creating port battle:', dbError);
          return NextResponse.json({
            error: 'Database temporarily unavailable - port battle creation disabled'
          }, { status: 500 });
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Port battles POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
