import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@krakengaming.org' },
      update: {},
      create: {
        email: 'admin@krakengaming.org',
        username: 'Admiral_Kraken',
        password: adminPassword,
        role: 'admin',
        emailVerified: true,
      },
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const testUser = await prisma.user.upsert({
      where: { email: 'user@krakengaming.org' },
      update: {},
      create: {
        email: 'user@krakengaming.org',
        username: 'Captain_Test',
        password: userPassword,
        role: 'user',
        emailVerified: true,
      },
    });

    console.log('✅ Database seeded successfully!');
    console.log({
      users: {
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          username: adminUser.username,
          password: 'admin123',
        },
        user: {
          id: testUser.id,
          email: testUser.email,
          username: testUser.username,
          password: 'user123',
        },
      },
    });

    console.log('\n🏴‍☠️ Login Credentials for Testing:');
    console.log('=====================================');
    console.log('Admin Login:');
    console.log('  Email: admin@krakengaming.org');
    console.log('  Password: admin123');
    console.log('');
    console.log('User Login:');
    console.log('  Email: user@krakengaming.org');
    console.log('  Password: user123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
