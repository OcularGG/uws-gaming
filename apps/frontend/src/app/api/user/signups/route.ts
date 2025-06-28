import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedSession } from '@/lib/session';

// GET - Fetch user signups
export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock signups until Prisma schema is fully resolved
    // TODO: Replace with actual database queries once schema is stable
    const signups = [
      {
        id: '1',
        status: 'approved',
        portBattle: {
          id: 'pb1',
          title: 'Battle for Cartagena',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          port: {
            name: 'Cartagena'
          }
        },
        fleetRole: {
          name: 'Line Ship Captain',
          setup: {
            name: 'Main Fleet'
          }
        }
      },
      {
        id: '2',
        status: 'pending',
        portBattle: {
          id: 'pb2',
          title: 'Defense of Kingston',
          scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // In 3 days
          port: {
            name: 'Kingston'
          }
        },
        fleetRole: {
          name: 'Frigate Captain',
          setup: {
            name: 'Screening Fleet'
          }
        }
      }
    ];

    return NextResponse.json({ signups });
  } catch (error) {
    console.error('Error fetching user signups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
