import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json()

    console.log('🔍 Debug Login API called...')
    console.log('📧 Email/Username:', emailOrUsername)
    console.log('🔐 Password length:', password?.length)

    if (!emailOrUsername || !password) {
      return NextResponse.json({ error: 'Email/username and password are required' }, { status: 400 })
    }

    // Try to find user by email first, then by username
    console.log('🔍 Looking for user by email...')
    let user = await prisma.user.findUnique({
      where: { email: emailOrUsername as string },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      console.log('🔍 User not found by email, trying username...')
      user = await prisma.user.findUnique({
        where: { username: emailOrUsername as string },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      })
    }

    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User found:', user.email, user.username)
    console.log('👤 User roles:', user.userRoles.map(ur => ur.role.name))

    if (!user.password) {
      console.log('❌ User has no password')
      return NextResponse.json({ error: 'User has no password set' }, { status: 400 })
    }

    console.log('🔐 Verifying password...')
    const isValidPassword = await bcrypt.compare(password as string, user.password)
    console.log('🔐 Password valid:', isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Get the primary role
    const primaryRole = user.userRoles.find((ur: any) => ur.role.name === 'admin')?.role.name ||
                       user.userRoles[0]?.role.name || 'user'

    console.log('✅ Login successful, role:', primaryRole)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: primaryRole
      }
    })

  } catch (error) {
    console.error('❌ Debug login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
