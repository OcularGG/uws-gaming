import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user with secure generated password
    const secureAdminPassword = 'KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced';
    const adminPassword = await bcrypt.hash(secureAdminPassword, 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@uwsgaming.org' },
      update: {},
      create: {
        email: 'admin@uwsgaming.org',
        username: 'Admiral_UWS',
        password: adminPassword,
        role: 'admin',
        emailVerified: true,
      },
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const testUser = await prisma.user.upsert({
      where: { email: 'user@uwsgaming.org' },
      update: {},
      create: {
        email: 'user@uwsgaming.org',
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
          password: 'KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced',
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
    console.log('  Email: admin@uwsgaming.org');
    console.log('  Password: KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced');
    console.log('');
    console.log('User Login:');
    console.log('  Email: user@uwsgaming.org');
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
