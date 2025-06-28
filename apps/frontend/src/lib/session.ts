import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export interface UnifiedSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    discordId?: string;
    username?: string;
    discriminator?: string;
    isMember?: boolean;
    isAdmin?: boolean;
  } | null;
}

/**
 * Get session from Auth.js
 */
export async function getUnifiedSession(request: NextRequest): Promise<UnifiedSession | null> {
  // Get real Auth.js session
  const realSession = await auth();
  if (realSession?.user?.id) {
    return {
      user: {
        id: realSession.user.id,
        name: realSession.user.name,
        email: realSession.user.email,
        image: realSession.user.image,
        discordId: (realSession.user as any).discordId,
        username: (realSession.user as any).username,
        discriminator: (realSession.user as any).discriminator,
        isMember: (realSession.user as any).isMember,
        isAdmin: (realSession.user as any).isAdmin,
      }
    };
  }

  return null;
}

/**
 * Check if a user is admin based on their Discord ID
 */
export function isAdmin(userId?: string | null): boolean {
  if (!userId) return false;

  // Define admin Discord IDs here - in production, this should be in a database or config
  const adminDiscordIds = ['1207434980855259206'];
  return adminDiscordIds.includes(userId);
}

/**
 * Check if a user is admin from a session
 */
export function isAdminSession(session: UnifiedSession | null): boolean {
  return isAdmin(session?.user?.discordId) || session?.user?.isAdmin === true;
}
