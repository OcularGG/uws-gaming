import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUnifiedSession, isAdminSession } from '@/lib/session';

// GET - Fetch admin data (users, clans, strikes, etc.)
export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'users': {
        // Get all users with their permissions and strikes
        const users = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            email: true,
            discordId: true,
            canCreatePortBattles: true,
            createdAt: true,
            strikes: {
              where: { isRemoved: false },
              select: { id: true, reason: true, createdAt: true }
            },
            _count: {
              select: {
                portBattles: true,
                portBattleSignups: true
              }
            }
          },
          orderBy: { username: 'asc' }
        });

        return NextResponse.json({ users });
      }

      case 'clans': {
        // Get all clans
        const clans = await prisma.clan.findMany({
          orderBy: { name: 'asc' }
        });

        return NextResponse.json({ clans });
      }

      case 'strikes': {
        // Get all user strikes
        const strikes = await prisma.userStrike.findMany({
          include: {
            user: {
              select: { id: true, username: true, discordId: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ strikes });
      }

      case 'ports': {
        // Get all ports
        const ports = await prisma.port.findMany({
          orderBy: { name: 'asc' }
        });

        return NextResponse.json({ ports });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in admin GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create clans, assign permissions, etc.
export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create_clan': {
        const { name } = body;

        if (!name) {
          return NextResponse.json({ error: 'Clan name is required' }, { status: 400 });
        }

        const clan = await prisma.clan.create({
          data: { name }
        });

        return NextResponse.json({ clan });
      }

      case 'create_port': {
        const { name, region } = body;

        if (!name) {
          return NextResponse.json({ error: 'Port name is required' }, { status: 400 });
        }

        const port = await prisma.port.create({
          data: {
            name,
            region: region || null
          }
        });

        return NextResponse.json({ port });
      }

      case 'issue_strike': {
        const { userId, reason } = body;

        if (!userId || !reason) {
          return NextResponse.json({ error: 'User ID and reason are required' }, { status: 400 });
        }

        const strike = await prisma.userStrike.create({
          data: {
            userId,
            reason,
            issuedBy: session.user.id
          }
        });

        return NextResponse.json({ strike });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in admin POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update permissions, clans, etc.
export async function PUT(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update_user_permissions': {
        const { userId, canCreatePortBattles } = body;

        if (!userId) {
          return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const user = await prisma.user.update({
          where: { id: userId },
          data: { canCreatePortBattles: !!canCreatePortBattles },
          select: {
            id: true,
            username: true,
            canCreatePortBattles: true
          }
        });

        return NextResponse.json({ user });
      }

      case 'remove_strike': {
        const { strikeId } = body;

        if (!strikeId) {
          return NextResponse.json({ error: 'Strike ID is required' }, { status: 400 });
        }

        const strike = await prisma.userStrike.update({
          where: { id: strikeId },
          data: {
            isRemoved: true,
            removedBy: session.user.id,
            removedAt: new Date()
          }
        });

        return NextResponse.json({ strike });
      }

      case 'update_clan': {
        const { clanId, name, isActive } = body;

        if (!clanId) {
          return NextResponse.json({ error: 'Clan ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (isActive !== undefined) updateData.isActive = isActive;

        const clan = await prisma.clan.update({
          where: { id: clanId },
          data: updateData
        });

        return NextResponse.json({ clan });
      }

      case 'update_port': {
        const { portId, name, region, isActive } = body;

        if (!portId) {
          return NextResponse.json({ error: 'Port ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (region !== undefined) updateData.region = region;
        if (isActive !== undefined) updateData.isActive = isActive;

        const port = await prisma.port.update({
          where: { id: portId },
          data: updateData
        });

        return NextResponse.json({ port });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in admin PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete clans, strikes, etc.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    switch (action) {
      case 'delete_clan': {
        if (!id) {
          return NextResponse.json({ error: 'Clan ID is required' }, { status: 400 });
        }

        await prisma.clan.delete({
          where: { id }
        });

        return NextResponse.json({ message: 'Clan deleted successfully' });
      }

      case 'delete_port': {
        if (!id) {
          return NextResponse.json({ error: 'Port ID is required' }, { status: 400 });
        }

        await prisma.port.delete({
          where: { id }
        });

        return NextResponse.json({ message: 'Port deleted successfully' });
      }

      case 'delete_strike': {
        if (!id) {
          return NextResponse.json({ error: 'Strike ID is required' }, { status: 400 });
        }

        await prisma.userStrike.delete({
          where: { id }
        });

        return NextResponse.json({ message: 'Strike deleted successfully' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in admin DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
