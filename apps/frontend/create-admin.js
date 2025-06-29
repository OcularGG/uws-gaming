/**
 * Script to create or update the default admin user
 * Run with: node create-admin.js
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'admin@krakengaming.org',
  password: 'KrakenAdmin2025!',
  username: 'KrakenAdmin',
  discordId: '1207434980855259206'
};

async function createAdminUser() {
  try {
    console.log('🔧 Creating/updating admin user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_CREDENTIALS.password, 12);

    // Create or update admin user
    const adminUser = await prisma.user.upsert({
      where: { email: DEFAULT_ADMIN_CREDENTIALS.email },
      update: {
        password: hashedPassword,
        canCreatePortBattles: true,
        discordId: DEFAULT_ADMIN_CREDENTIALS.discordId,
        username: DEFAULT_ADMIN_CREDENTIALS.username
      },
      create: {
        email: DEFAULT_ADMIN_CREDENTIALS.email,
        username: DEFAULT_ADMIN_CREDENTIALS.username,
        password: hashedPassword,
        discordId: DEFAULT_ADMIN_CREDENTIALS.discordId,
        canCreatePortBattles: true
      }
    });

    console.log('✅ Admin user created/updated successfully!');
    console.log('');
    console.log('=== ADMIN LOGIN CREDENTIALS ===');
    console.log(`Email: ${DEFAULT_ADMIN_CREDENTIALS.email}`);
    console.log(`Password: ${DEFAULT_ADMIN_CREDENTIALS.password}`);
    console.log(`Username: ${DEFAULT_ADMIN_CREDENTIALS.username}`);
    console.log(`Discord ID: ${DEFAULT_ADMIN_CREDENTIALS.discordId}`);
    console.log('================================');
    console.log('');
    console.log('🌐 You can now login at: http://localhost:3000/auth/login');
    console.log('👑 Admin features will be available after login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser();
