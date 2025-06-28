// Simplified seed script for core authentication functionality

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Create roles
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator with full access',
        permissions: ['all']
      }
    })

    const userRole = await prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: {
        name: 'user',
        description: 'Standard user',
        permissions: ['read']
      }
    })

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@krakengaming.org' },
      update: {},
      create: {
        email: 'admin@krakengaming.org',
        username: 'Admiral_Kraken',
        password: adminPassword,
        firstName: 'Admiral',
        lastName: 'Kraken',
        isActive: true,
        isApproved: true,
        canCreatePortBattles: true
      }
    })

    // Create test user
    const userPassword = await bcrypt.hash('user123', 12)
    const testUser = await prisma.user.upsert({
      where: { email: 'user@krakengaming.org' },
      update: {},
      create: {
        email: 'user@krakengaming.org',
        username: 'Captain_Test',
        password: userPassword,
        firstName: 'Captain',
        lastName: 'Test',
        isActive: true,
        isApproved: true
      }
    })

    // Assign roles to users
    await prisma.userRole.upsert({
      where: { 
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    })

    await prisma.userRole.upsert({
      where: { 
        userId_roleId: {
          userId: testUser.id,
          roleId: userRole.id
        }
      },
      update: {},
      create: {
        userId: testUser.id,
        roleId: userRole.id
      }
    })

    console.log('✅ Database seeded successfully!')
    console.log({
      users: {
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          username: adminUser.username,
          password: 'admin123',
          roles: ['admin']
        },
        user: {
          id: testUser.id,
          email: testUser.email,
          username: testUser.username,
          password: 'user123',
          roles: ['user']
        }
      }
    })

    console.log('\n🏴‍☠️ Login Credentials for Testing:')
    console.log('=====================================')
    console.log('Admin Login:')
    console.log('  Email: admin@krakengaming.org')
    console.log('  Password: admin123')
    console.log('User Login:')
    console.log('  Email: user@krakengaming.org')
    console.log('  Password: user123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed()
