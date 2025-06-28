import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUnifiedSession, isAdminSession } from '@/lib/session';

// GET - Fetch blacklist entries
export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const blacklist = await prisma.blacklistEntry.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ blacklist });
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create blacklist entry
export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { discordId, name, reason } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    if (!discordId && !name) {
      return NextResponse.json({ error: 'Either Discord ID or name is required' }, { status: 400 });
    }

    const entry = await prisma.blacklistEntry.create({
      data: {
        discordId: discordId || null,
        name: name || null,
        reason,
        addedBy: session.user.username || session.user.name || 'Unknown Admin',
        isActive: true
      }
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error creating blacklist entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove blacklist entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    const entry = await prisma.blacklistEntry.update({
      where: { id },
      data: {
        isActive: false,
        removedBy: session.user.username || session.user.name || 'Unknown Admin',
        removedAt: new Date()
      }
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error removing blacklist entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
