import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Extend the FastifyRequest interface to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      username: string
    }
  }
}

interface CreatePortBattleRequest {
  name: string
  description: string
  scheduledTime: string
  port: string
  server: string
  maxParticipants?: number
  requirements?: string
  rewards?: string
}

interface UpdatePortBattleRequest {
  name?: string
  description?: string
  scheduledTime?: string
  port?: string
  server?: string
  maxParticipants?: number
  requirements?: string
  rewards?: string
  status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
}

interface PortBattleQuery {
  status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
  page?: number
  limit?: number
  search?: string
  server?: string
  upcoming?: boolean
}

interface JoinPortBattleRequest {
  userId: string
  shipType?: string
  notes?: string
}

export default async function portBattleRoutes(fastify: FastifyInstance) {
  // Get all port battles with filtering and pagination
  fastify.get<{ Querystring: PortBattleQuery }>('/port-battles', async (request: FastifyRequest<{ Querystring: PortBattleQuery }>, reply: FastifyReply) => {
    try {
      const { status, page = 1, limit = 20, search, server, upcoming } = request.query
      const skip = (page - 1) * limit

      const where: any = {}

      if (status) {
        where.status = status
      }

      if (server) {
        where.server = server
      }

      if (upcoming) {
        where.scheduledTime = { gte: new Date() }
        where.status = { in: ['scheduled', 'active'] }
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { port: { contains: search, mode: 'insensitive' } }
        ]
      }

      const [portBattles, total] = await Promise.all([
        prisma.portBattle.findMany({
          where,
          skip,
          take: limit,
          orderBy: { scheduledTime: 'desc' },
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true
                  }
                }
              }
            },
            _count: {
              select: {
                participants: true
              }
            }
          }
        }),
        prisma.portBattle.count({ where })
      ])

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }

      return { data: { items: portBattles, pagination } }
    } catch (error) {
      fastify.log.error('Error fetching port battles:', error)
      return reply.status(500).send({ error: 'Failed to fetch port battles' })
    }
  })

  // Get specific port battle
  fastify.get<{ Params: { battleId: string } }>('/port-battles/:battleId', async (request: FastifyRequest<{ Params: { battleId: string } }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params

      const portBattle = await prisma.portBattle.findUnique({
        where: { id: battleId },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: { joinedAt: 'asc' }
          }
        }
      })

      if (!portBattle) {
        return reply.status(404).send({ error: 'Port battle not found' })
      }

      return { data: portBattle }
    } catch (error) {
      fastify.log.error('Error fetching port battle:', error)
      return reply.status(500).send({ error: 'Failed to fetch port battle' })
    }
  })

  // Create new port battle
  fastify.post<{ Body: CreatePortBattleRequest }>('/port-battles', async (request: FastifyRequest<{ Body: CreatePortBattleRequest }>, reply: FastifyReply) => {
    try {
      const {
        name,
        description,
        scheduledTime,
        port,
        server,
        maxParticipants,
        requirements,
        rewards
      } = request.body

      if (!name || !description || !scheduledTime || !port || !server) {
        return reply.status(400).send({ error: 'Name, description, scheduled time, port, and server are required' })
      }

      const scheduledDate = new Date(scheduledTime)
      if (scheduledDate < new Date()) {
        return reply.status(400).send({ error: 'Scheduled time must be in the future' })
      }

      const portBattle = await prisma.portBattle.create({
        data: {
          name,
          description,
          scheduledTime: scheduledDate,
          port,
          server,
          maxParticipants: maxParticipants || 50,
          requirements,
          rewards,
          status: 'scheduled',
          createdBy: request.user?.id || 'system'
        },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PORTBATTLE_CREATE',
          category: 'events',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            portBattleId: portBattle.id,
            name: portBattle.name,
            port: portBattle.port,
            server: portBattle.server,
            scheduledTime: portBattle.scheduledTime
          },
          ipAddress: request.ip
        }
      })

      return { data: portBattle }
    } catch (error) {
      fastify.log.error('Error creating port battle:', error)
      return reply.status(500).send({ error: 'Failed to create port battle' })
    }
  })

  // Update port battle
  fastify.put<{ Params: { battleId: string }, Body: UpdatePortBattleRequest }>('/port-battles/:battleId', async (request: FastifyRequest<{ Params: { battleId: string }, Body: UpdatePortBattleRequest }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params
      const updateData = request.body

      const existingBattle = await prisma.portBattle.findUnique({
        where: { id: battleId }
      })

      if (!existingBattle) {
        return reply.status(404).send({ error: 'Port battle not found' })
      }

      // Validate scheduled time if updating
      if (updateData.scheduledTime) {
        const scheduledDate = new Date(updateData.scheduledTime)
        if (scheduledDate < new Date() && existingBattle.status === 'scheduled') {
          return reply.status(400).send({ error: 'Scheduled time must be in the future for scheduled battles' })
        }
        updateData.scheduledTime = scheduledDate as any
      }

      const portBattle = await prisma.portBattle.update({
        where: { id: battleId },
        data: updateData,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          }
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PORTBATTLE_UPDATE',
          category: 'events',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            portBattleId: battleId,
            changes: updateData
          },
          previousValue: {
            name: existingBattle.name,
            status: existingBattle.status,
            scheduledTime: existingBattle.scheduledTime
          },
          newValue: {
            name: portBattle.name,
            status: portBattle.status,
            scheduledTime: portBattle.scheduledTime
          },
          ipAddress: request.ip
        }
      })

      return { data: portBattle }
    } catch (error) {
      fastify.log.error('Error updating port battle:', error)
      return reply.status(500).send({ error: 'Failed to update port battle' })
    }
  })

  // Delete port battle
  fastify.delete<{ Params: { battleId: string } }>('/port-battles/:battleId', async (request: FastifyRequest<{ Params: { battleId: string } }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params

      const portBattle = await prisma.portBattle.findUnique({
        where: { id: battleId },
        include: {
          participants: true
        }
      })

      if (!portBattle) {
        return reply.status(404).send({ error: 'Port battle not found' })
      }

      if (portBattle.status === 'active') {
        return reply.status(400).send({ error: 'Cannot delete an active port battle' })
      }

      await prisma.portBattle.delete({
        where: { id: battleId }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PORTBATTLE_DELETE',
          category: 'events',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            portBattleId: battleId,
            name: portBattle.name,
            port: portBattle.port,
            server: portBattle.server,
            participantCount: portBattle.participants.length
          },
          ipAddress: request.ip
        }
      })

      return { message: 'Port battle deleted successfully' }
    } catch (error) {
      fastify.log.error('Error deleting port battle:', error)
      return reply.status(500).send({ error: 'Failed to delete port battle' })
    }
  })

  // Add participant to port battle
  fastify.post<{ Params: { battleId: string }, Body: JoinPortBattleRequest }>('/port-battles/:battleId/participants', async (request: FastifyRequest<{ Params: { battleId: string }, Body: JoinPortBattleRequest }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params
      const { userId, shipType, notes } = request.body

      if (!userId) {
        return reply.status(400).send({ error: 'User ID is required' })
      }

      const portBattle = await prisma.portBattle.findUnique({
        where: { id: battleId },
        include: {
          participants: true
        }
      })

      if (!portBattle) {
        return reply.status(404).send({ error: 'Port battle not found' })
      }

      if (portBattle.status === 'completed' || portBattle.status === 'cancelled') {
        return reply.status(400).send({ error: 'Cannot join a completed or cancelled port battle' })
      }

      // Check if user already joined
      const existingParticipant = portBattle.participants.find((p: any) => p.userId === userId)
      if (existingParticipant) {
        return reply.status(400).send({ error: 'User is already a participant' })
      }

      // Check max participants limit
      if (portBattle.maxParticipants && portBattle.participants.length >= portBattle.maxParticipants) {
        return reply.status(400).send({ error: 'Port battle is full' })
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, email: true }
      })

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      const participant = await prisma.portBattleParticipant.create({
        data: {
          portBattleId: battleId,
          userId,
          shipType,
          notes,
          addedBy: request.user?.id || 'system'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PORTBATTLE_PARTICIPANT_ADD',
          category: 'events',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          targetUserId: userId,
          targetUserEmail: user.email,
          details: {
            portBattleId: battleId,
            portBattleName: portBattle.name,
            shipType,
            notes
          },
          ipAddress: request.ip
        }
      })

      return { data: participant }
    } catch (error) {
      fastify.log.error('Error adding participant:', error)
      return reply.status(500).send({ error: 'Failed to add participant' })
    }
  })

  // Remove participant from port battle
  fastify.delete<{ Params: { battleId: string, userId: string } }>('/port-battles/:battleId/participants/:userId', async (request: FastifyRequest<{ Params: { battleId: string, userId: string } }>, reply: FastifyReply) => {
    try {
      const { battleId, userId } = request.params

      const participant = await prisma.portBattleParticipant.findUnique({
        where: {
          portBattleId_userId: {
            portBattleId: battleId,
            userId
          }
        },
        include: {
          user: {
            select: { id: true, username: true, email: true }
          },
          portBattle: {
            select: { id: true, name: true, status: true }
          }
        }
      })

      if (!participant) {
        return reply.status(404).send({ error: 'Participant not found' })
      }

      if (participant.portBattle.status === 'active') {
        return reply.status(400).send({ error: 'Cannot remove participants from an active port battle' })
      }

      await prisma.portBattleParticipant.delete({
        where: {
          portBattleId_userId: {
            portBattleId: battleId,
            userId
          }
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PORTBATTLE_PARTICIPANT_REMOVE',
          category: 'events',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          targetUserId: userId,
          targetUserEmail: participant.user.email,
          details: {
            portBattleId: battleId,
            portBattleName: participant.portBattle.name
          },
          ipAddress: request.ip
        }
      })

      return { message: 'Participant removed successfully' }
    } catch (error) {
      fastify.log.error('Error removing participant:', error)
      return reply.status(500).send({ error: 'Failed to remove participant' })
    }
  })

  // Get port battle statistics
  fastify.get('/port-battles/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [scheduled, active, completed, cancelled, upcomingCount, totalParticipants] = await Promise.all([
        prisma.portBattle.count({ where: { status: 'scheduled' } }),
        prisma.portBattle.count({ where: { status: 'active' } }),
        prisma.portBattle.count({ where: { status: 'completed' } }),
        prisma.portBattle.count({ where: { status: 'cancelled' } }),
        prisma.portBattle.count({
          where: {
            status: { in: ['scheduled', 'active'] },
            scheduledTime: { gte: new Date() }
          }
        }),
        prisma.portBattleParticipant.count()
      ])

      // Get upcoming battles
      const upcomingBattles = await prisma.portBattle.findMany({
        where: {
          status: { in: ['scheduled', 'active'] },
          scheduledTime: { gte: new Date() }
        },
        orderBy: { scheduledTime: 'asc' },
        take: 5,
        select: {
          id: true,
          name: true,
          port: true,
          server: true,
          scheduledTime: true,
          _count: {
            select: { participants: true }
          }
        }
      })

      // Get most popular servers
      const popularServers = await prisma.portBattle.groupBy({
        by: ['server'],
        _count: { server: true },
        orderBy: { _count: { server: 'desc' } },
        take: 5
      })

      return {
        data: {
          statusCounts: {
            scheduled,
            active,
            completed,
            cancelled
          },
          upcoming: upcomingCount,
          totalParticipants,
          upcomingBattles,
          popularServers: popularServers.map((s: any) => ({
            server: s.server,
            battleCount: s._count.server
          }))
        }
      }
    } catch (error) {
      fastify.log.error('Error fetching port battle stats:', error)
      return reply.status(500).send({ error: 'Failed to fetch port battle statistics' })
    }
  })

  // Get attendance for a specific port battle
  fastify.get<{ Params: { battleId: string } }>('/port-battles/:battleId/attendance', async (request: FastifyRequest<{ Params: { battleId: string } }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params

      const attendance = await prisma.portBattleAttendance.findMany({
        where: { portBattleId: battleId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      return attendance.map((record: any) => ({
        id: record.id,
        userId: record.userId,
        battleId: record.portBattleId,
        attended: record.status === 'present',
        shipType: record.shipUsed,
        notes: record.notes,
        recordedAt: record.createdAt,
        recordedBy: record.recordedBy,
        user: record.user
      }))
    } catch (error) {
      fastify.log.error('Error fetching attendance:', error)
      return reply.status(500).send({ error: 'Failed to fetch attendance' })
    }
  })

  // Mark attendance for participants (updated for new frontend format)
  fastify.post<{
    Params: { battleId: string },
    Body: {
      attendanceData: Array<{
        userId: string
        attended: boolean
        shipType?: string
        notes?: string
      }>
    }
  }>('/port-battles/:battleId/attendance', async (request: FastifyRequest<{
    Params: { battleId: string },
    Body: {
      attendanceData: Array<{
        userId: string
        attended: boolean
        shipType?: string
        notes?: string
      }>
    }
  }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params
      const { attendanceData } = request.body

      if (!attendanceData || !Array.isArray(attendanceData)) {
        return reply.status(400).send({ error: 'Attendance data is required' })
      }

      const portBattle = await prisma.portBattle.findUnique({
        where: { id: battleId }
      })

      if (!portBattle) {
        return reply.status(404).send({ error: 'Port battle not found' })
      }

      // Clear existing attendance records
      await prisma.portBattleAttendance.deleteMany({
        where: { portBattleId: battleId }
      })

      // Create new attendance records
      const results = await Promise.all(
        attendanceData.map(async (record) => {
          return await prisma.portBattleAttendance.create({
            data: {
              portBattleId: battleId,
              userId: record.userId,
              status: record.attended ? 'present' : 'absent',
              shipUsed: record.shipType,
              notes: record.notes,
              recordedBy: request.user?.id || 'system'
            }
          })
        })
      )

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PORTBATTLE_ATTENDANCE_UPDATE',
          category: 'events',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            portBattleId: battleId,
            portBattleName: portBattle.name,
            attendanceCount: attendanceData.length,
            presentCount: attendanceData.filter(a => a.attended).length
          },
          ipAddress: request.ip
        }
      })

      return { success: true, data: results }
    } catch (error) {
      fastify.log.error('Error recording attendance:', error)
      return reply.status(500).send({ error: 'Failed to record attendance' })
    }
  })

  // Get after action report for a port battle
  fastify.get<{ Params: { battleId: string } }>('/port-battles/:battleId/aar', async (request: FastifyRequest<{ Params: { battleId: string } }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params

      const aar = await prisma.portBattleAAR.findUnique({
        where: { portBattleId: battleId },
        include: {
          portBattle: {
            select: {
              id: true,
              name: true,
              port: true,
              server: true,
              scheduledTime: true,
              status: true
            }
          },
          author: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          reviewer: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      })

      if (!aar) {
        return reply.status(404).send({ error: 'After action report not found' })
      }

      return { data: aar }
    } catch (error) {
      fastify.log.error('Error fetching AAR:', error)
      return reply.status(500).send({ error: 'Failed to fetch after action report' })
    }
  })

  // Get all AARs for a battle (multiple AARs support)
  fastify.get<{ Params: { battleId: string } }>('/port-battles/:battleId/aars', async (request: FastifyRequest<{ Params: { battleId: string } }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params

      const aars = await prisma.portBattleAAR.findMany({
        where: { portBattleId: battleId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return aars.map((aar: any) => ({
        id: aar.id,
        battleId: aar.portBattleId,
        title: aar.battleSummary?.substring(0, 100) + '...' || 'After Action Report',
        summary: aar.battleSummary,
        outcome: aar.outcome,
        lessons: aar.lessons,
        recommendations: aar.recommendations,
        createdAt: aar.createdAt,
        createdBy: aar.authoredBy,
        author: aar.author
      }))
    } catch (error) {
      fastify.log.error('Error fetching AARs:', error)
      return reply.status(500).send({ error: 'Failed to fetch after action reports' })
    }
  })

  // Create a new AAR (POST to /aars endpoint)
  fastify.post<{
    Params: { battleId: string },
    Body: {
      title: string
      summary: string
      outcome: 'victory' | 'defeat' | 'draw' | 'cancelled'
      lessons: string
      recommendations: string
    }
  }>('/port-battles/:battleId/aars', async (request: FastifyRequest<{
    Params: { battleId: string },
    Body: {
      title: string
      summary: string
      outcome: 'victory' | 'defeat' | 'draw' | 'cancelled'
      lessons: string
      recommendations: string
    }
  }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params
      const { title, summary, outcome, lessons, recommendations } = request.body

      const portBattle = await prisma.portBattle.findUnique({
        where: { id: battleId }
      })

      if (!portBattle) {
        return reply.status(404).send({ error: 'Port battle not found' })
      }

      if (!summary || !outcome) {
        return reply.status(400).send({ error: 'Summary and outcome are required' })
      }

      const aar = await prisma.portBattleAAR.create({
        data: {
          portBattleId: battleId,
          outcome,
          battleSummary: summary,
          lessons,
          recommendations,
          authoredBy: request.user?.id || 'system'
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PORTBATTLE_AAR_CREATE',
          category: 'events',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            portBattleId: battleId,
            portBattleName: portBattle.name,
            outcome,
            aarId: aar.id
          },
          ipAddress: request.ip
        }
      })

      return { success: true, data: aar }
    } catch (error) {
      fastify.log.error('Error creating AAR:', error)
      return reply.status(500).send({ error: 'Failed to create after action report' })
    }
  })

  // Update an AAR
  fastify.put<{
    Params: { battleId: string, aarId: string },
    Body: {
      title?: string
      summary?: string
      outcome?: 'victory' | 'defeat' | 'draw' | 'cancelled'
      lessons?: string
      recommendations?: string
    }
  }>('/port-battles/:battleId/aars/:aarId', async (request: FastifyRequest<{
    Params: { battleId: string, aarId: string },
    Body: {
      title?: string
      summary?: string
      outcome?: 'victory' | 'defeat' | 'draw' | 'cancelled'
      lessons?: string
      recommendations?: string
    }
  }>, reply: FastifyReply) => {
    try {
      const { battleId, aarId } = request.params
      const updates = request.body

      const aar = await prisma.portBattleAAR.findFirst({
        where: {
          id: aarId,
          portBattleId: battleId
        }
      })

      if (!aar) {
        return reply.status(404).send({ error: 'AAR not found' })
      }

      const updatedAAR = await prisma.portBattleAAR.update({
        where: { id: aarId },
        data: {
          outcome: updates.outcome || aar.outcome,
          battleSummary: updates.summary || aar.battleSummary,
          lessons: updates.lessons || aar.lessons,
          recommendations: updates.recommendations || aar.recommendations,
          updatedAt: new Date()
        }
      })

      return { success: true, data: updatedAAR }
    } catch (error) {
      fastify.log.error('Error updating AAR:', error)
      return reply.status(500).send({ error: 'Failed to update after action report' })
    }
  })

  // Delete an AAR
  fastify.delete<{ Params: { battleId: string, aarId: string } }>('/port-battles/:battleId/aars/:aarId', async (request: FastifyRequest<{ Params: { battleId: string, aarId: string } }>, reply: FastifyReply) => {
    try {
      const { battleId, aarId } = request.params

      const aar = await prisma.portBattleAAR.findFirst({
        where: {
          id: aarId,
          portBattleId: battleId
        }
      })

      if (!aar) {
        return reply.status(404).send({ error: 'AAR not found' })
      }

      await prisma.portBattleAAR.delete({
        where: { id: aarId }
      })

      return { success: true }
    } catch (error) {
      fastify.log.error('Error deleting AAR:', error)
      return reply.status(500).send({ error: 'Failed to delete after action report' })
    }
  })

  // Publish/unpublish after action report
  fastify.patch<{ Params: { battleId: string }, Body: { isPublished: boolean, reviewedBy?: string } }>('/port-battles/:battleId/aar/publish', async (request: FastifyRequest<{ Params: { battleId: string }, Body: { isPublished: boolean, reviewedBy?: string } }>, reply: FastifyReply) => {
    try {
      const { battleId } = request.params
      const { isPublished, reviewedBy } = request.body

      const aar = await prisma.portBattleAAR.findUnique({
        where: { portBattleId: battleId }
      })

      if (!aar) {
        return reply.status(404).send({ error: 'After action report not found' })
      }

      const updatedAAR = await prisma.portBattleAAR.update({
        where: { portBattleId: battleId },
        data: {
          isPublished,
          publishedAt: isPublished ? new Date() : null,
          reviewedBy: reviewedBy || request.user?.id || 'system'
        },
        include: {
          portBattle: {
            select: { name: true }
          }
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PORTBATTLE_AAR_PUBLISH',
          category: 'events',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            portBattleId: battleId,
            portBattleName: updatedAAR.portBattle.name,
            isPublished
          },
          ipAddress: request.ip
        }
      })

      return { data: updatedAAR }
    } catch (error) {
      fastify.log.error('Error publishing AAR:', error)
      return reply.status(500).send({ error: 'Failed to publish after action report' })
    }
  })

  // Get attendance statistics for all port battles
  fastify.get('/port-battles/attendance/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [totalBattles, completedBattles, totalAttendance, averageAttendance] = await Promise.all([
        prisma.portBattle.count(),
        prisma.portBattle.count({ where: { status: 'completed' } }),
        prisma.portBattleAttendance.count({ where: { status: 'present' } }),
        prisma.portBattleAttendance.groupBy({
          by: ['portBattleId'],
          where: { status: 'present' },
          _count: { userId: true }
        })
      ])

      const avgAttendancePerBattle = averageAttendance.length > 0
        ? (averageAttendance.reduce((sum: number, battle: any) => sum + battle._count.userId, 0) / averageAttendance.length)
        : 0

      // Get top attendees
      const topAttendees = await prisma.portBattleAttendance.groupBy({
        by: ['userId'],
        where: { status: 'present' },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      })

      const attendeeIds = topAttendees.map((a: any) => a.userId)
      const attendeeDetails = await prisma.user.findMany({
        where: { id: { in: attendeeIds } },
        select: { id: true, username: true, email: true }
      })

      const topAttendeesWithDetails = topAttendees.map((attendee: any) => ({
        user: attendeeDetails.find((u: any) => u.id === attendee.userId),
        attendanceCount: attendee._count.userId
      }))

      return {
        data: {
          totalBattles,
          completedBattles,
          totalAttendance,
          averageAttendancePerBattle: Math.round(avgAttendancePerBattle * 10) / 10,
          topAttendees: topAttendeesWithDetails
        }
      }
    } catch (error) {
      fastify.log.error('Error fetching attendance stats:', error)
      return reply.status(500).send({ error: 'Failed to fetch attendance statistics' })
    }
  })
}
