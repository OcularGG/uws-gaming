import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    console.log('🔍 Debug session:', session)

    return NextResponse.json({
      session,
      user: session?.user,
      role: session?.user?.role
    })
  } catch (error) {
    console.error('❌ Debug session error:', error)
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 })
  }
}
