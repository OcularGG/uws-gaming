import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedSession } from '@/lib/session';

// GET - Fetch user statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock stats until Prisma schema is fully resolved
    // TODO: Replace with actual database queries once schema is stable
    const stats = {
      totalSignups: 5,
      upcomingBattles: 2,
      completedBattles: 3,
      pendingSignups: 1
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
