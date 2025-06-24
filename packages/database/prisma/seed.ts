import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create default roles
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator with full access',
        permissions: [
          'user.read',
          'user.write',
          'user.delete',
          'admin.access',
          'system.config',
        ],
      },
    });

    const moderatorRole = await prisma.role.upsert({
      where: { name: 'moderator' },
      update: {},
      create: {
        name: 'moderator',
        description: 'Moderator with limited admin access',
        permissions: [
          'user.read',
          'user.write',
          'discord.moderate',
        ],
      },
    });

    const userRole = await prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: {
        name: 'user',
        description: 'Standard user',
        permissions: [
          'profile.read',
          'profile.write',
        ],
      },
    });

    // Create default system configuration
    await prisma.systemConfig.upsert({
      where: { key: 'maintenance_mode' },
      update: {},
      create: {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Enable/disable maintenance mode',
        isPublic: true,
      },
    });

    await prisma.systemConfig.upsert({
      where: { key: 'site_name' },
      update: {},
      create: {
        key: 'site_name',
        value: 'KrakenGaming',
        description: 'Site name displayed in the UI',
        isPublic: true,
      },
    });

    await prisma.systemConfig.upsert({
      where: { key: 'discord_invite_url' },
      update: {},
      create: {
        key: 'discord_invite_url',
        value: 'https://discord.gg/krakengaming',
        description: 'Discord server invite URL',
        isPublic: true,
      },
    });

    console.log('✅ Database seeded successfully!');
    console.log({
      roles: {
        admin: adminRole.id,
        moderator: moderatorRole.id,
        user: userRole.id,
      },
    });
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
