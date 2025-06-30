const { PrismaClient } = require('@prisma/client');

async function checkAdminUsers() {
  const prisma = new PrismaClient();

  try {
    // Check for admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin'
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    console.log('Admin users found:', adminUsers);

    // Check for any users if no admins exist
    if (adminUsers.length === 0) {
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true
        }
      });
      console.log('All users:', allUsers);
    }

  } catch (error) {
    console.error('Database query error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
