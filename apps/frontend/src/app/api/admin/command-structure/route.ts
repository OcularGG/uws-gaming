import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUnifiedSession, isAdminSession } from '@/lib/session';

// GET - Fetch command structure roles
export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const roles = await prisma.commandStructureRole.findMany({
      where: { isActive: true },
      include: {
        assignedUser: {
          select: {
            id: true,
            username: true,
            discordId: true
          }
        }
      },
      orderBy: { level: 'desc' }
    });

    // Parse permissions JSON string back to array for frontend
    const rolesWithParsedPermissions = roles.map(role => ({
      ...role,
      permissions: JSON.parse(role.permissions || '[]')
    }));

    return NextResponse.json({ roles: rolesWithParsedPermissions });
  } catch (error) {
    console.error('Error fetching command structure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create command structure role
export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, level, permissions, flagCountry } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const role = await prisma.commandStructureRole.create({
      data: {
        title,
        description,
        level: level || 1,
        permissions: JSON.stringify(permissions || []),
        flagCountry: flagCountry || null,
        isActive: true
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            username: true,
            discordId: true
          }
        }
      }
    });

    return NextResponse.json({
      role: {
        ...role,
        permissions: JSON.parse(role.permissions || '[]')
      }
    });
  } catch (error) {
    console.error('Error creating command role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update command structure role or assign user
export async function PUT(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, roleId, userId } = body;

    if (action === 'assign_user') {
      if (!roleId) {
        return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
      }

      const role = await prisma.commandStructureRole.update({
        where: { id: roleId },
        data: {
          assignedUserId: userId || null
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              username: true,
              discordId: true
            }
          }
        }
      });

      return NextResponse.json({
        role: {
          ...role,
          permissions: JSON.parse(role.permissions || '[]')
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating command role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Deactivate command structure role
export async function DELETE(request: NextRequest) {
  try {
    const session = await getUnifiedSession(request);
    if (!session?.user?.id || !isAdminSession(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const role = await prisma.commandStructureRole.update({
      where: { id },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Error deleting command role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
