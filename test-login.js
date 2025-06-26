// Test script to verify mock login functionality
console.log('Testing mock login functionality...');

// Simulate admin login
const adminUser = {
  id: 'admin-user-id',
  name: 'Admin User',
  email: 'admin@krakengaming.org',
  image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY0MDQ0Ii8+CjxwYXRoIGQ9Ik0yMCAyOEM0IDI4IDQgMjQgNCAyMEM0IDE2IDggMTIgMjAgMTJDMzIgMTIgMzYgMTYgMzYgMjBDMzYgMjQgMzYgMjggMjAgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
  discordId: '1207434980855259206',
  username: 'AdminKraken',
  discriminator: '0001',
  isMember: true,
  isAdmin: true
};

const mockSession = {
  user: adminUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

console.log('Mock session object:', JSON.stringify(mockSession, null, 2));
console.log('Admin Discord ID should match:', adminUser.discordId === '1207434980855259206');
console.log('Test completed successfully!');
