/**
 * Admin utilities for KrakenGaming
 * Centralized admin user management and permissions
 */

// Admin users - in production, this should be stored in environment variables or database
const ADMIN_USERS = {
  // Discord-based admins
  discordIds: [
    '1207434980855259206' // Original admin Discord ID
  ],
  // Email-based admins
  emails: [
    'admin@krakengaming.org'
  ],
  // Username-based admins (fallback)
  usernames: [
    'admin'
  ]
}

/**
 * Check if a user has admin privileges
 */
export function isAdmin(user: any): boolean {
  if (!user) return false;

  // Check Discord ID
  if (user.discordId && ADMIN_USERS.discordIds.includes(user.discordId)) {
    return true;
  }

  // Check email
  if (user.email && ADMIN_USERS.emails.includes(user.email.toLowerCase())) {
    return true;
  }

  // Check username
  if (user.username && ADMIN_USERS.usernames.includes(user.username.toLowerCase())) {
    return true;
  }

  // Check explicit admin flag from database
  if (user.isAdmin === true) {
    return true;
  }

  // Check by user ID for backwards compatibility
  if (user.id && ADMIN_USERS.discordIds.includes(user.id)) {
    return true;
  }

  return false;
}

/**
 * Check if a user can access port battle management
 */
export function canManagePortBattles(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can access the approval queue
 */
export function canAccessApprovalQueue(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can approve/deny role requests
 */
export function canApproveRoleRequests(user: any): boolean {
  return isAdmin(user);
}

/**
 * Get admin user identifiers for API use
 */
export function getAdminIdentifiers() {
  return {
    discordIds: ADMIN_USERS.discordIds,
    emails: ADMIN_USERS.emails,
    usernames: ADMIN_USERS.usernames
  };
}

/**
 * Check if a user ID (any type) is an admin
 */
export function isAdminById(userId: string): boolean {
  return ADMIN_USERS.discordIds.includes(userId) ||
         ADMIN_USERS.emails.includes(userId.toLowerCase()) ||
         ADMIN_USERS.usernames.includes(userId.toLowerCase());
}
