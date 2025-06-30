import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json()

    console.log('🔧 Updating user role:', { email, role })

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role }
    })

    console.log('✅ User role updated:', updatedUser)

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role
      }
    })
  } catch (error) {
    console.error('❌ Error updating user role:', error)
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }
}
