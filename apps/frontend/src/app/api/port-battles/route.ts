import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUnifiedSession, isAdminSession } from '@/lib/session';
import { isAdmin } from '@/lib/adminUtils';

// Mock data for when database is unavailable
const mockPortBattles = [
  {
    id: 'pb-1',
    title: 'Assault on Cartagena',
    description: 'Strategic assault on the Spanish stronghold. Balanced fleet composition required for harbor penetration.',
    scheduledDate: new Date('2025-07-02T19:30:00Z').toISOString(),
    timeZone: 'UTC',
    status: 'PLANNED',
    maxParticipants: 15,
    currentParticipants: 8,
    battleType: 'OFFENSIVE',
    captainsCode: 'KRAKEN-PB1-2025',
    allowExternalSignups: true,
    creator: {
      id: 'admin-user',
      username: 'Admiral_Nelson'
    },
    location: 'Cartagena Port',
    duration: 90,
    requiredBR: 400,
    waterType: 'SHALLOW_WATER',
    fleetSetups: [
      {
        id: 'fs-1',
        setupName: 'Main Fleet',
        roles: [
          { id: 'r-1', shipName: 'HMS Victory', brValue: 80, signups: [] },
          { id: 'r-2', shipName: 'HMS Temeraire', brValue: 80, signups: [] },
          { id: 'r-3', shipName: 'HMS Bellerophon', brValue: 74, signups: [] },
          { id: 'r-4', shipName: 'HMS Minotaur', brValue: 74, signups: [] },
          { id: 'r-5', shipName: 'HMS Leander', brValue: 50, signups: [] },
          { id: 'r-6', shipName: 'HMS Diana', brValue: 38, signups: [] }
        ]
      }
    ],
    screeningFleets: [
      {
        id: 'sf-1',
        fleetType: 'OFFENSIVE',
        commanderName: 'Captain Hardy',
        nation: 'GB',
        shipsRequired: 'Fast frigates preferred',
        signups: []
      }
    ]
  },
  {
    id: 'pb-2',
    title: 'Deep Water Battle - La Tortue',
    description: 'High-intensity deep water engagement. Heavy ships of the line required for maximum firepower.',
    scheduledDate: new Date('2025-07-05T20:30:00Z').toISOString(),
    timeZone: 'UTC',
    status: 'PLANNED',
    maxParticipants: 18,
    currentParticipants: 12,
    battleType: 'DEFENSIVE',
    captainsCode: 'KRAKEN-PB2-2025',
    allowExternalSignups: true,
    creator: {
      id: 'admin-user',
      username: 'Captain_Blackbeard'
    },
    location: 'La Tortue Deep Water',
    duration: 120,
    requiredBR: 500,
    waterType: 'DEEP_WATER',
    fleetSetups: [
      {
        id: 'fs-2',
        setupName: 'Heavy Fleet',
        roles: [
          { id: 'r-7', shipName: 'USS Constitution', brValue: 85, signups: [] },
          { id: 'r-8', shipName: 'USS United States', brValue: 85, signups: [] },
          { id: 'r-9', shipName: 'USS President', brValue: 85, signups: [] },
          { id: 'r-10', shipName: 'USS Constellation', brValue: 74, signups: [] },
          { id: 'r-11', shipName: 'USS Essex', brValue: 50, signups: [] },
          { id: 'r-12', shipName: 'USS Boston', brValue: 44, signups: [] }
        ]
      }
    ],
    screeningFleets: [
      {
        id: 'sf-2',
        fleetType: 'OFFENSIVE',
        commanderName: 'Anne Bonny',
        nation: 'Pirates',
        shipsRequired: 'Fast ships for harassment',
        signups: []
      },
      {
        id: 'sf-3',
        fleetType: 'DEFENSIVE',
        commanderName: 'French Admiral',
        nation: 'France',
        shipsRequired: 'Heavy ships of the line',
        signups: []
      }
    ]
  },
  {
    id: 'pb-3',
    title: 'Charleston Harbor Defense',
    description: 'Defensive operation against British invasion fleet. Light and fast ships needed for harbor defense.',
    scheduledDate: new Date('2025-07-08T19:00:00Z').toISOString(),
    timeZone: 'UTC',
    status: 'PLANNED',
    maxParticipants: 20,
    currentParticipants: 15,
    battleType: 'FLAG_PLANT',
    captainsCode: 'KRAKEN-PB3-2025',
    allowExternalSignups: false, // No external signups for this one
    creator: {
      id: 'admin-user',
      username: 'Commodore_Jones'
    },
    location: 'Charleston Harbor',
    duration: 75,
    requiredBR: 300,
    waterType: 'SHALLOW_WATER',
    fleetSetups: [
      {
        id: 'fs-3',
        setupName: 'Defense Fleet',
        roles: [
          { id: 'r-13', shipName: 'HMS Surprise', brValue: 50, signups: [] },
          { id: 'r-14', shipName: 'HMS Speedy', brValue: 38, signups: [] },
          { id: 'r-15', shipName: 'HMS Lively', brValue: 38, signups: [] },
          { id: 'r-16', shipName: 'HMS Arethusa', brValue: 38, signups: [] },
          { id: 'r-17', shipName: 'HMS Pallas', brValue: 32, signups: [] },
          { id: 'r-18', shipName: 'HMS Phoenix', brValue: 32, signups: [] },
          { id: 'r-19', shipName: 'HMS Active', brValue: 28, signups: [] },
          { id: 'r-20', shipName: 'HMS Wolverine', brValue: 18, signups: [] }
        ]
      }
    ],
    screeningFleets: []
  },
  {
    id: 'pb-4',
    title: 'Baltic Sea Engagement - Gustavia',
    description: 'Complex multi-national engagement in contested waters. Mixed fleet composition for versatility.',
    scheduledDate: new Date('2025-07-10T21:30:00Z').toISOString(),
    timeZone: 'UTC',
    status: 'PLANNED',
    maxParticipants: 16,
    currentParticipants: 9,
    battleType: 'SCREENING',
    creator: {
      id: 'admin-user',
      username: 'Swedish_Admiral'
    },
    location: 'Gustavia Deep Water',
    duration: 100,
    requiredBR: 450,
    waterType: 'DEEP_WATER',
    fleetSetups: [
      {
        id: 'fs-4',
        setupName: 'Baltic Fleet',
        roles: [
          { id: 'r-21', shipName: 'Bellona', brValue: 74, signups: [] },
          { id: 'r-22', shipName: 'Göteborg', brValue: 74, signups: [] },
          { id: 'r-23', shipName: 'Stockholm', brValue: 64, signups: [] },
          { id: 'r-24', shipName: 'Kalmar', brValue: 54, signups: [] },
          { id: 'r-25', shipName: 'Malmö', brValue: 50, signups: [] },
          { id: 'r-26', shipName: 'Visby', brValue: 38, signups: [] }
        ]
      }
    ],
    screeningFleets: [
      {
        id: 'sf-4',
        fleetType: 'OFFENSIVE',
        commanderName: 'Captain Lindqvist',
        nation: 'Sweden',
        shipsRequired: 'Northern European ships',
        signups: []
      }
    ]
  },
  {
    id: 'pb-5',
    title: 'Spanish Treasure Defense - Vera Cruz',
    description: 'Critical defense of Spanish treasure operations. Elite coordination required against British raiders.',
    scheduledDate: new Date('2025-07-12T20:00:00Z').toISOString(),
    timeZone: 'UTC',
    status: 'PLANNED',
    maxParticipants: 14,
    currentParticipants: 11,
    battleType: 'OFFENSIVE',
    creator: {
      id: 'admin-user',
      username: 'El_Capitan_Hernandez'
    },
    location: 'Vera Cruz Port',
    duration: 85,
    requiredBR: 350,
    waterType: 'SHALLOW_WATER',
    fleetSetups: [
      {
        id: 'fs-5',
        setupName: 'Spanish Fleet',
        roles: [
          { id: 'r-27', shipName: 'Santísima Trinidad', brValue: 80, signups: [] },
          { id: 'r-28', shipName: 'Santa Ana', brValue: 80, signups: [] },
          { id: 'r-29', shipName: 'San Juan Nepomuceno', brValue: 74, signups: [] },
          { id: 'r-30', shipName: 'Argonauta', brValue: 74, signups: [] },
          { id: 'r-31', shipName: 'Monarca', brValue: 68, signups: [] },
          { id: 'r-32', shipName: 'Mercedes', brValue: 44, signups: [] }
        ]
      }
    ],
    screeningFleets: []
  }
];

// GET - Fetch port battles, signups, etc.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    // For public viewing (no auth required for list, calendar, and get actions)
    if (action === 'list' || action === 'calendar' || action === 'get') {
      try {
        if (action === 'list') {
          // Try to fetch from database
          const portBattles = await prisma.portBattle.findMany({
            include: {
              creator: {
                select: { id: true, username: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          });

          return NextResponse.json({ portBattles });
        }

        if (action === 'calendar') {
          const startDate = searchParams.get('start');
          const endDate = searchParams.get('end');

          const where: any = {};
          if (startDate) {
            where.meetupTime = { gte: new Date(startDate) };
          }
          if (endDate) {
            where.meetupTime = { ...where.meetupTime, lte: new Date(endDate) };
          }

          const upcomingBattles = await prisma.portBattle.findMany({
            where,
            select: {
              id: true,
              portName: true,
              meetupTime: true,
              battleStartTime: true,
              isDeepWater: true,
              meetupLocation: true,
              brLimit: true,
              commanderName: true,
              creator: {
                select: { username: true }
              }
            },
            orderBy: { meetupTime: 'asc' }
          });

          return NextResponse.json({ upcomingBattles });
        }

        if (action === 'get') {
          // Check mock data since database might not have port battles yet
          const id = searchParams.get('id');
          if (!id) {
            return NextResponse.json({ error: 'Port battle ID required' }, { status: 400 });
          }

          const mockBattle = mockPortBattles.find(pb => pb.id === id);
          if (mockBattle) {
            // Transform mock data to match expected frontend interface
            const transformedBattle = {
              ...mockBattle,
              portName: mockBattle.title,
              meetupTime: mockBattle.scheduledDate,
              battleStartTime: mockBattle.scheduledDate,
              isDeepWater: mockBattle.waterType === 'DEEP_WATER',
              meetupLocation: mockBattle.location,
              brLimit: mockBattle.requiredBR,
              commanderName: mockBattle.creator.username,
              // Ensure fleetSetups are properly transformed
              fleetSetups: mockBattle.fleetSetups.map(setup => ({
                ...setup,
                isActive: true, // Mock setups are always active
                setupOrder: 1,  // Mock setup order
                roles: setup.roles.map(role => ({
                  ...role,
                  roleOrder: setup.roles.indexOf(role) + 1,
                  signups: role.signups || []
                }))
              })),
              screeningFleets: mockBattle.screeningFleets || []
            };

            return NextResponse.json({
              portBattle: transformedBattle,
              isMockData: true
            });
          }

          return NextResponse.json({ error: 'Port battle not found' }, { status: 404 });
        }

        if (action === 'validateCode') {
          const id = searchParams.get('id');
          const code = searchParams.get('code');

          if (!id || !code) {
            return NextResponse.json({ error: 'Port battle ID and code required' }, { status: 400 });
          }

          const mockBattle = mockPortBattles.find(pb => pb.id === id);
          if (mockBattle && mockBattle.allowExternalSignups && mockBattle.captainsCode === code) {
            return NextResponse.json({ valid: true });
          }

          return NextResponse.json({ valid: false, error: 'Invalid code' });
        }
      } catch (dbError) {
        console.warn('Database unavailable for port battles, using fallback data:', dbError);

        if (action === 'list') {
          // Return mock data when database is unavailable
          return NextResponse.json({
            portBattles: mockPortBattles,
            isMockData: true,
            message: 'Using fallback data - database temporarily unavailable'
          });
        }

        if (action === 'calendar') {
          // Return calendar data from mock battles
          const upcomingBattles = mockPortBattles.map(pb => ({
            id: pb.id,
            portName: pb.title, // Use title as portName for mock data
            meetupTime: pb.scheduledDate,
            battleStartTime: pb.scheduledDate,
            isDeepWater: pb.waterType === 'DEEP_WATER',
            meetupLocation: pb.location,
            brLimit: pb.requiredBR,
            commanderName: pb.creator.username,
            battleType: pb.battleType,
            creator: { username: pb.creator.username }
          }));

          return NextResponse.json({
            upcomingBattles,
            isMockData: true,
            message: 'Using fallback data - database temporarily unavailable'
          });
        }
      }
    }

    // For other actions, require authentication
    const session = await getUnifiedSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    switch (action) {
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Port battles API error:', error);
    return NextResponse.json({
      error: 'Server error',
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
        if (!isAdmin(session.user)) {
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
                select: { id: true, username: true }
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

      case 'signup': {
        // Redirect to the role requests endpoint
        const requestsResponse = await fetch(new URL('/api/port-battles/requests', request.url).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': request.headers.get('Authorization') || '',
            'Cookie': request.headers.get('Cookie') || ''
          },
          body: JSON.stringify(data)
        });

        if (!requestsResponse.ok) {
          const errorData = await requestsResponse.json();
          return NextResponse.json(errorData, { status: requestsResponse.status });
        }

        const responseData = await requestsResponse.json();
        return NextResponse.json(responseData);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Port battles POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
