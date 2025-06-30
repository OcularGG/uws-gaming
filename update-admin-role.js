const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateUserToAdmin() {
  try {
    console.log('🔍 Finding user with email: litefoot.gg@gmail.com')

    const user = await prisma.user.findUnique({
      where: { email: 'litefoot.gg@gmail.com' }
    })

    if (!user) {
      console.log('❌ User not found!')
      return
    }

    console.log('👤 Found user:', user.username, 'with role:', user.role)

    console.log('🔧 Updating user role to admin...')
    const updatedUser = await prisma.user.update({
      where: { email: 'litefoot.gg@gmail.com' },
      data: { role: 'admin' }
    })

    console.log('✅ User role updated successfully!')
    console.log('👤 User details:', {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role
    })

  } catch (error) {
    console.error('❌ Error updating user role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserToAdmin()
