import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Registration API called...')
    const { email, username, password } = await request.json()
    console.log('📝 Data received:', { email, username, passwordLength: password?.length })

    // Validation
    if (!email || !username || !password) {
      console.log('❌ Validation failed: Missing fields')
      return NextResponse.json({ error: 'Email, username, and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      console.log('❌ Validation failed: Password too short')
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    console.log('🔍 Checking for existing user...')
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email === email ? 'email' : 'username')
      return NextResponse.json({
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      }, { status: 409 })
    }

    console.log('🔐 Hashing password...')
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('👤 Creating user...')
    // Create user with RBAC system
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      }
    })
    console.log('✅ User created with ID:', user.id)

    console.log('👑 Getting user role...')
    // Get the default 'user' role
    const userRole = await prisma.role.findUnique({
      where: { name: 'user' }
    })

    if (userRole) {
      console.log('🔗 Assigning user role...')
      // Assign the user role
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id
        }
      })
      console.log('✅ Role assigned successfully')
    } else {
      console.log('⚠️ User role not found in database')
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = { ...user, password: hashedPassword }

    console.log('🎉 Registration completed successfully')
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
