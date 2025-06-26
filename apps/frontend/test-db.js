// Test script to verify database connection and basic API functionality
const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:../../packages/database/dev.db'
      }
    }
  });

  try {
    console.log('Testing database connection...');

    // Test basic connection
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected. Current user count: ${userCount}`);

    // Test creating a user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        discordId: '123456789',
      }
    });
    console.log(`✅ Created test user: ${testUser.id}`);

    // Test bug report creation
    const testBugReport = await prisma.bugReport.create({
      data: {
        title: 'Test Bug Report',
        description: 'This is a test bug report',
        severity: 'Medium',
        reporterId: testUser.id,
        status: 'OPEN',
      }
    });
    console.log(`✅ Created test bug report: ${testBugReport.id}`);

    // Test application creation
    const testApplication = await prisma.application.create({
      data: {
        userId: testUser.id,
        discordId: testUser.discordId,
        discordUsername: testUser.username,
        applicantName: 'Test Captain',
        captainName: 'Test Captain',
        currentNation: 'Great Britain',
        timeZone: 'EST',
        hoursInNavalAction: 100,
        steamConnected: true,
        currentRank: 'Captain',
        preferredRole: 'Commander',
        isPortBattleCommander: false,
        isCrafter: true,
        weeklyPlayTime: 20,
        portBattleAvailability: JSON.stringify(['Monday', 'Tuesday']),
        typicalSchedule: 'Evenings',
        declarationAccuracy: true,
        declarationHonor: true,
        declarationRules: true,
        signature: 'Test Captain',
        status: 'PENDING',
      }
    });
    console.log(`✅ Created test application: ${testApplication.id}`);

    // Clean up test data
    await prisma.application.delete({ where: { id: testApplication.id } });
    await prisma.bugReport.delete({ where: { id: testBugReport.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Cleaned up test data');

    console.log('\n🎉 All database tests passed! The system is ready for use.');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
