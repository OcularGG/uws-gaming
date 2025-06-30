import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Application schema for validation
const applicationSchema = z.object({
  // User Registration
  email: z.string().email('Valid email is required'),
  captainName: z.string().min(1, 'Captain name is required'),

  // Personal Particulars
  preferredNickname: z.string().min(1, 'Preferred nickname is required'),
  currentNation: z.string().min(1, 'Current nation is required'),
  timeZone: z.string().min(1, 'Timezone is required'),

  // Naval Experience
  hoursInNavalAction: z.string().min(1, 'Hours in Naval Action is required'),
  currentRank: z.string().min(1, 'Current rank is required'),
  previousCommands: z.string().optional(),
  preferredRole: z.string().min(1, 'Preferred role is required'),
  isPortBattleCommander: z.boolean(),
  commanderExperience: z.string().optional(),

  // Crafting
  isCrafter: z.boolean(),

  // Availability
  weeklyPlayTime: z.string().min(1, 'Weekly play time is required'),
  portBattleAvailability: z.array(z.string()),
  typicalSchedule: z.string().min(1, 'Typical schedule is required'),

  // Declarations
  declarationAccuracy: z.literal(true, { errorMap: () => ({ message: 'You must accept the accuracy declaration' }) }),
  declarationHonor: z.literal(true, { errorMap: () => ({ message: 'You must accept the honor declaration' }) }),
  declarationRules: z.literal(true, { errorMap: () => ({ message: 'You must accept the rules declaration' }) }),

  // Signature
  signature: z.string().min(1, 'Signature is required'),
})

export async function POST(request: Request) {
  try {
    console.log('🔍 Application API called...')

    // @ts-ignore - Type issues with Prisma schema mismatch
    const session = await auth()

    const body = await request.json()
    console.log('📝 Application data received for userId:', body.userId)

    // If there's no session but a userId is provided (new registration case)
    let userId = session?.user?.id
    if (!userId && body.userId) {
      console.log('📋 Using provided userId from registration:', body.userId)
      userId = body.userId

      // Verify the userId exists in the database
      const user = await prisma.user.findUnique({
        where: { id: body.userId }
      })

      if (!user) {
        console.log('❌ Invalid userId provided')
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
      }
    }

    if (!userId) {
      console.log('❌ No authentication and no valid userId')
      return NextResponse.json({ error: 'Not authenticated and no valid user ID provided' }, { status: 401 })
    }

    const validatedData = applicationSchema.parse(body)
    console.log('✅ Application data validated')

    // Check for existing application
    const existingApplication = await prisma.application.findFirst({
      where: {
        OR: [
          { userId: userId },
          { email: validatedData.email }
        ]
      }
    })

    if (existingApplication) {
      console.log('❌ Application already exists')
      return NextResponse.json({
        error: 'An application has already been submitted for this account or email address'
      }, { status: 400 })
    }

    // Check cooldown period
    // @ts-ignore - Schema mismatch
    const cooldownPeriod = await prisma.applicationCooldown.findUnique({
      where: { userId: userId }
    })

    if (cooldownPeriod && new Date() < cooldownPeriod.canReapplyAt) {
      const canReapplyAt = cooldownPeriod.canReapplyAt.toISOString()
      console.log('❌ User is in cooldown period')
      return NextResponse.json({
        error: `You can reapply after ${canReapplyAt}`
      }, { status: 400 })
    }

    console.log('📝 Creating application...')
    // Create the application
    // @ts-ignore - Prisma client types need to be regenerated
    const application = await prisma.application.create({
      data: {
        // Map frontend form fields to new schema
        // @ts-ignore - Schema mismatch
        userId: userId, // Add the userId field
        email: validatedData.email,
        applicantName: validatedData.captainName,
        captainName: validatedData.captainName,
        preferredNickname: validatedData.preferredNickname,
        currentNation: validatedData.currentNation,
        timeZone: validatedData.timeZone,
        hoursInNavalAction: parseInt(validatedData.hoursInNavalAction),
        steamConnected: false, // Default value
        currentRank: validatedData.currentRank,
        previousCommands: validatedData.previousCommands || null,
        preferredRole: validatedData.preferredRole,
        isPortBattleCommander: validatedData.isPortBattleCommander,
        commanderExperience: validatedData.commanderExperience || null,
        isCrafter: validatedData.isCrafter,
        weeklyPlayTime: parseInt(validatedData.weeklyPlayTime),
        portBattleAvailability: JSON.stringify(validatedData.portBattleAvailability), // Convert array to JSON string
        typicalSchedule: validatedData.typicalSchedule,
        declarationAccuracy: validatedData.declarationAccuracy,
        declarationHonor: validatedData.declarationHonor,
        declarationRules: validatedData.declarationRules,
        signature: validatedData.signature,
        status: 'PENDING' // Use uppercase to match schema comment
      }
    })

    console.log('✅ Application created successfully with ID:', application.id)
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.id
    })

  } catch (error) {
    console.error('Application submission error:', error)

    if (error instanceof z.ZodError) {
      console.log('❌ Validation error:', error.errors)
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to submit application'
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'

    if (isAdmin) {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })

      if (user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Return all applications for admin
      const applications = await prisma.application.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ applications })
    } else {
      // Return user's own application
      const application = await prisma.application.findFirst({
        where: { userId: session.user.id }
      })

      return NextResponse.json({ application })
    }

  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json({
      error: 'Failed to fetch applications'
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { applicationId, status, feedback } = body

    if (!applicationId || !status) {
      return NextResponse.json({
        error: 'Application ID and status are required'
      }, { status: 400 })
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        feedback: feedback || null,
        reviewedAt: new Date()
      }
    })

    // If rejected, create cooldown period
    if (status === 'REJECTED') {
      const cooldownDate = new Date()
      cooldownDate.setDate(cooldownDate.getDate() + 30) // 30 day cooldown

      await prisma.applicationCooldown.upsert({
        where: { userId: application.userId },
        update: { canReapplyAt: cooldownDate },
        create: {
          userId: application.userId,
          canReapplyAt: cooldownDate
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`
    })

  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json({
      error: 'Failed to update application'
    }, { status: 500 })
  }
}
