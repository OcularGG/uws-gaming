/**
 * Admin utilities for UWS Gaming
 * Centralized admin user management and permissions
 */

// Admin users - in production, this should be stored in environment variables or database
const ADMIN_USERS = {
  // Email-based admins
  emails: [
    'admin@uwsgaming.org',
    'litefoot.gg@gmail.com'
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

  // Check role from database (primary method)
  if (user.role === 'admin') {
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

  // Check explicit admin flag from database (legacy)
  if (user.isAdmin === true) {
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
    emails: ADMIN_USERS.emails,
    usernames: ADMIN_USERS.usernames
  };
}

/**
 * Check if a user ID (any type) is an admin
 */
export function isAdminById(userId: string): boolean {
  return ADMIN_USERS.emails.includes(userId.toLowerCase()) ||
         ADMIN_USERS.usernames.includes(userId.toLowerCase());
}

/**
 * Check if a user can access audit logs
 */
export function canAccessAuditLogs(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can access GDPR tools
 */
export function canAccessGDPRTools(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can view user activity logs
 */
export function canViewUserActivity(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can manage system settings
 */
export function canManageSystemSettings(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can manage blacklists
 */
export function canManageBlacklist(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can manage gallery reports
 */
export function canManageGalleryReports(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can manage roles and permissions
 */
export function canManageRoles(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can export audit logs
 */
export function canExportAuditLogs(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can process GDPR requests
 */
export function canProcessGDPRRequests(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can delete user data (for GDPR)
 */
export function canDeleteUserData(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can access analytics
 */
export function canAccessAnalytics(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can manage the roster (view all users)
 */
export function canManageRoster(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can track port battle attendance
 */
export function canTrackAttendance(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can create/edit after action reports
 */
export function canManageAARs(user: any): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can view port battle statistics
 */
export function canViewPortBattleStats(user: any): boolean {
  return isAdmin(user);
}
