/**
 * Test file to verify admin user permissions for port battles
 */

// Simple admin check function (copy of the logic from adminUtils.ts)
function isAdmin(user) {
  if (!user) return false;

  // Admin users
  const ADMIN_USERS = {
    discordIds: ['1207434980855259206'],
    emails: ['admin@krakengaming.org'],
    usernames: ['admin']
  };

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

// Test admin users
const testUsers = [
  // Discord-based admin
  {
    id: '1207434980855259206',
    discordId: '1207434980855259206',
    email: 'admin@krakengaming.org',
    username: 'KrakenAdmin'
  },
  // Email-based admin
  {
    id: 'user-123',
    email: 'admin@krakengaming.org',
    username: 'AdminUser'
  },
  // Regular user
  {
    id: 'user-456',
    email: 'user@example.com',
    username: 'RegularUser'
  },
  // Admin by username
  {
    id: 'user-789',
    email: 'test@example.com',
    username: 'admin'
  }
];

console.log('=== Admin Rights Test ===\n');

testUsers.forEach((user, index) => {
  console.log(`User ${index + 1}: ${user.username} (${user.email})`);
  console.log(`  Is Admin: ${isAdmin(user)}`);
  console.log(`  Can Manage Port Battles: ${isAdmin(user)}`);
  console.log(`  Can Access Approval Queue: ${isAdmin(user)}`);
  console.log('');
});

// Test specific cases
console.log('=== Specific Tests ===');
console.log(`admin@krakengaming.org email admin: ${isAdmin({ email: 'admin@krakengaming.org' })}`);
console.log(`Discord ID admin: ${isAdmin({ discordId: '1207434980855259206' })}`);
console.log(`Username admin: ${isAdmin({ username: 'admin' })}`);
console.log(`Regular user: ${isAdmin({ email: 'user@example.com' })}`);
console.log(`Null user: ${isAdmin(null)}`);
console.log(`Undefined user: ${isAdmin(undefined)}`);
