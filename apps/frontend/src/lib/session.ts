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
 * Get session from either Auth.js or mock session (in development)
 * This allows API routes to work with both real and dev login sessions
 */
export async function getUnifiedSession(request: NextRequest): Promise<UnifiedSession | null> {
  // First try to get real Auth.js session
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

  // In development, check for mock session in headers
  if (process.env.NODE_ENV === 'development') {
    const mockSessionHeader = request.headers.get('x-mock-session');
    if (mockSessionHeader) {
      try {
        const mockSession = JSON.parse(mockSessionHeader);
        if (mockSession.user) {
          return {
            user: {
              id: mockSession.user.id,
              name: mockSession.user.name,
              email: mockSession.user.email,
              image: mockSession.user.image,
              discordId: mockSession.user.discordId,
              username: mockSession.user.username,
              discriminator: mockSession.user.discriminator,
              isMember: mockSession.user.isMember,
              isAdmin: mockSession.user.isAdmin,
            }
          };
        }
      } catch (error) {
        console.error('Error parsing mock session:', error);
      }
    }
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
