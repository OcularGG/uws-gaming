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

interface CreateBlacklistRequest {
  type: 'user' | 'ip' | 'email'
  value: string
  reason: string
  expiresAt?: string
}

interface UpdateBlacklistRequest {
  reason?: string
  expiresAt?: string
  isActive?: boolean
}

interface BlacklistQuery {
  type?: 'user' | 'ip' | 'email'
  page?: number
  limit?: number
  search?: string
  active?: boolean
}

export default async function blacklistRoutes(fastify: FastifyInstance) {
  // Get all blacklist entries with filtering and pagination
  fastify.get<{ Querystring: BlacklistQuery }>('/blacklist', async (request: FastifyRequest<{ Querystring: BlacklistQuery }>, reply: FastifyReply) => {
    try {
      const { type, page = 1, limit = 20, search, active } = request.query
      const skip = (page - 1) * limit

      const where: any = {}

      if (type) {
        where.type = type
      }

      if (search) {
        where.OR = [
          { value: { contains: search, mode: 'insensitive' } },
          { reason: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (active !== undefined) {
        where.isActive = active
      }

      const [blacklistEntries, total] = await Promise.all([
        prisma.blacklist.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            addedByUser: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }),
        prisma.blacklist.count({ where })
      ])

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }

      return { data: { items: blacklistEntries, pagination } }
    } catch (error) {
      fastify.log.error('Error fetching blacklist:', error)
      return reply.status(500).send({ error: 'Failed to fetch blacklist' })
    }
  })

  // Get specific blacklist entry
  fastify.get<{ Params: { entryId: string } }>('/blacklist/:entryId', async (request: FastifyRequest<{ Params: { entryId: string } }>, reply: FastifyReply) => {
    try {
      const { entryId } = request.params

      const entry = await prisma.blacklist.findUnique({
        where: { id: entryId },
        include: {
          addedByUser: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      })

      if (!entry) {
        return reply.status(404).send({ error: 'Blacklist entry not found' })
      }

      return { data: entry }
    } catch (error) {
      fastify.log.error('Error fetching blacklist entry:', error)
      return reply.status(500).send({ error: 'Failed to fetch blacklist entry' })
    }
  })

  // Add new blacklist entry
  fastify.post<{ Body: CreateBlacklistRequest }>('/blacklist', async (request: FastifyRequest<{ Body: CreateBlacklistRequest }>, reply: FastifyReply) => {
    try {
      const { type, value, reason, expiresAt } = request.body

      if (!type || !value || !reason) {
        return reply.status(400).send({ error: 'Type, value, and reason are required' })
      }

      // Check if entry already exists and is active
      const existingEntry = await prisma.blacklist.findFirst({
        where: {
          type,
          value: { equals: value, mode: 'insensitive' },
          isActive: true
        }
      })

      if (existingEntry) {
        return reply.status(400).send({ error: 'This entry is already blacklisted' })
      }

      const entry = await prisma.blacklist.create({
        data: {
          type,
          value: value.toLowerCase(),
          reason,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          addedBy: request.user?.id || 'system',
          isActive: true
        },
        include: {
          addedByUser: {
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
          action: 'BLACKLIST_ADD',
          category: 'security',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            blacklistId: entry.id,
            type: entry.type,
            value: entry.value,
            reason: entry.reason
          },
          ipAddress: request.ip
        }
      })

      return { data: entry }
    } catch (error) {
      fastify.log.error('Error creating blacklist entry:', error)
      return reply.status(500).send({ error: 'Failed to create blacklist entry' })
    }
  })

  // Update blacklist entry
  fastify.put<{ Params: { entryId: string }, Body: UpdateBlacklistRequest }>('/blacklist/:entryId', async (request: FastifyRequest<{ Params: { entryId: string }, Body: UpdateBlacklistRequest }>, reply: FastifyReply) => {
    try {
      const { entryId } = request.params
      const { reason, expiresAt, isActive } = request.body

      const existingEntry = await prisma.blacklist.findUnique({
        where: { id: entryId }
      })

      if (!existingEntry) {
        return reply.status(404).send({ error: 'Blacklist entry not found' })
      }

      const updateData: any = {}
      if (reason !== undefined) updateData.reason = reason
      if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
      if (isActive !== undefined) updateData.isActive = isActive

      const entry = await prisma.blacklist.update({
        where: { id: entryId },
        data: updateData,
        include: {
          addedByUser: {
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
          action: 'BLACKLIST_UPDATE',
          category: 'security',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            blacklistId: entry.id,
            changes: request.body
          },
          previousValue: {
            reason: existingEntry.reason,
            expiresAt: existingEntry.expiresAt,
            isActive: existingEntry.isActive
          },
          newValue: {
            reason: entry.reason,
            expiresAt: entry.expiresAt,
            isActive: entry.isActive
          },
          ipAddress: request.ip
        }
      })

      return { data: entry }
    } catch (error) {
      fastify.log.error('Error updating blacklist entry:', error)
      return reply.status(500).send({ error: 'Failed to update blacklist entry' })
    }
  })

  // Delete blacklist entry
  fastify.delete<{ Params: { entryId: string } }>('/blacklist/:entryId', async (request: FastifyRequest<{ Params: { entryId: string } }>, reply: FastifyReply) => {
    try {
      const { entryId } = request.params

      const entry = await prisma.blacklist.findUnique({
        where: { id: entryId }
      })

      if (!entry) {
        return reply.status(404).send({ error: 'Blacklist entry not found' })
      }

      await prisma.blacklist.delete({
        where: { id: entryId }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'BLACKLIST_DELETE',
          category: 'security',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            blacklistId: entryId,
            type: entry.type,
            value: entry.value,
            reason: entry.reason
          },
          ipAddress: request.ip
        }
      })

      return { message: 'Blacklist entry deleted successfully' }
    } catch (error) {
      fastify.log.error('Error deleting blacklist entry:', error)
      return reply.status(500).send({ error: 'Failed to delete blacklist entry' })
    }
  })

  // Check if a value is blacklisted
  fastify.get<{ Querystring: { type: 'user' | 'ip' | 'email', value: string } }>('/blacklist/check', async (request: FastifyRequest<{ Querystring: { type: 'user' | 'ip' | 'email', value: string } }>, reply: FastifyReply) => {
    try {
      const { type, value } = request.query

      if (!type || !value) {
        return reply.status(400).send({ error: 'Type and value are required' })
      }

      const entry = await prisma.blacklist.findFirst({
        where: {
          type,
          value: { equals: value.toLowerCase(), mode: 'insensitive' },
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      })

      return {
        data: {
          isBlacklisted: !!entry,
          entry: entry || null
        }
      }
    } catch (error) {
      fastify.log.error('Error checking blacklist:', error)
      return reply.status(500).send({ error: 'Failed to check blacklist' })
    }
  })

  // Get blacklist statistics
  fastify.get('/blacklist/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [totalActive, totalExpired, byType] = await Promise.all([
        prisma.blacklist.count({ where: { isActive: true } }),
        prisma.blacklist.count({
          where: {
            isActive: true,
            expiresAt: { lt: new Date() }
          }
        }),
        prisma.blacklist.groupBy({
          by: ['type'],
          where: { isActive: true },
          _count: true
        })
      ])

      const typeStats = byType.reduce((acc: any, item: any) => {
        acc[item.type] = item._count
        return acc
      }, {})

      return {
        data: {
          totalActive,
          totalExpired,
          byType: typeStats
        }
      }
    } catch (error) {
      fastify.log.error('Error fetching blacklist stats:', error)
      return reply.status(500).send({ error: 'Failed to fetch blacklist statistics' })
    }
  })
}
