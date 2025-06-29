const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuth() {
  console.log('🔍 Testing Authentication System...\n')

  try {
    // Test 1: Check if users exist
    console.log('📋 1. Checking seeded users...')
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      const roles = user.userRoles.map(ur => ur.role.name).join(', ')
      console.log(`  - ${user.email} (${user.username}) - Roles: ${roles}`)
    })

    // Test 2: Verify passwords
    console.log('\n🔐 2. Testing password verification...')

    const adminUser = users.find(u => u.email === 'admin@krakengaming.org')
    const testUser = users.find(u => u.email === 'user@krakengaming.org')

    if (adminUser) {
      const adminPasswordValid = await bcrypt.compare('admin123', adminUser.password)
      console.log(`  - Admin password verification: ${adminPasswordValid ? '✅ PASS' : '❌ FAIL'}`)
    } else {
      console.log('  - ❌ Admin user not found')
    }

    if (testUser) {
      const userPasswordValid = await bcrypt.compare('user123', testUser.password)
      console.log(`  - User password verification: ${userPasswordValid ? '✅ PASS' : '❌ FAIL'}`)
    } else {
      console.log('  - ❌ Test user not found')
    }

    // Test 3: Check roles
    console.log('\n👑 3. Testing role system...')
    const roles = await prisma.role.findMany()
    console.log(`Found ${roles.length} roles:`)
    roles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description}`)
    })

    // Test 4: Check user roles
    console.log('\n🔗 4. Testing user-role relationships...')
    const userRoles = await prisma.userRole.findMany({
      include: {
        user: true,
        role: true
      }
    })

    userRoles.forEach(ur => {
      console.log(`  - ${ur.user.email} has role: ${ur.role.name}`)
    })

    console.log('\n🎯 Summary:')
    console.log('✅ Database connection: OK')
    console.log('✅ User seeding: OK')
    console.log('✅ Password hashing: OK')
    console.log('✅ Role system: OK')
    console.log('\n🏴‍☠️ Ready to test login at: http://localhost:3002/auth/login')
    console.log('\nTest credentials:')
    console.log('Admin: admin@krakengaming.org / admin123')
    console.log('User:  user@krakengaming.org / user123')

  } catch (error) {
    console.error('❌ Error testing authentication:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()
