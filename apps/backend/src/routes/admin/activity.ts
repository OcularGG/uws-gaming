import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const adminAuth = async (request: any, reply: any) => {
  const user = request.user

  if (!user) {
    return reply.code(401).send({ error: 'Authentication required' })
  }

  const isAdmin = user.role === 'admin' || user.isAdmin === true

  if (!isAdmin) {
    return reply.code(403).send({ error: 'Admin access required' })
  }
}

const activityRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', adminAuth)

  // Get user activity logs
  fastify.get('/user-activity', async (request: any, reply) => {
    try {
      const {
        userId,
        category,
        action,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = request.query

      const where: any = {}

      if (userId) {
        where.userId = userId
      }

      if (category && category !== 'all') {
        where.category = category
      }

      if (action) {
        where.action = { contains: action, mode: 'insensitive' }
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) {
          where.createdAt.gte = new Date(startDate)
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate)
        }
      }

      const activities = await prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })

      const totalActivities = await prisma.activityLog.count({ where })

      return {
        activities,
        pagination: {
          page,
          limit,
          total: totalActivities,
          pages: Math.ceil(totalActivities / limit)
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to fetch user activities' })
    }
  })

  // Get activity analytics
  fastify.get('/analytics', async (request: any, reply) => {
    try {
      const { startDate, endDate } = request.query

      const where: any = {}
      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) {
          where.createdAt.gte = new Date(startDate)
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate)
        }
      }

      // Get category counts
      const categoryStats = await prisma.activityLog.groupBy({
        by: ['category'],
        where,
        _count: {
          id: true
        }
      })

      // Get action counts (top 10)
      const actionStats = await prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })

      // Get daily activity for the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const dailyActivities = await prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM activity_logs
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `

      // Get unique users count
      const uniqueUsers = await prisma.activityLog.findMany({
        where,
        select: { userId: true },
        distinct: ['userId']
      })

      // Get security events count
      const securityEvents = await prisma.activityLog.count({
        where: {
          ...where,
          category: 'security'
        }
      })

      // Get error rate
      const totalLogs = await prisma.activityLog.count({ where })
      const failedLogs = await prisma.activityLog.count({
        where: {
          ...where,
          success: false
        }
      })

      return {
        totalActivities: totalLogs,
        uniqueUsers: uniqueUsers.length,
        categoryCounts: categoryStats.reduce((acc: any, stat) => {
          acc[stat.category] = stat._count.id
          return acc
        }, {}),
        actionCounts: actionStats.reduce((acc: any, stat) => {
          acc[stat.action] = stat._count.id
          return acc
        }, {}),
        dailyActivity: dailyActivities,
        securityEvents,
        errorRate: totalLogs > 0 ? failedLogs / totalLogs : 0
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to fetch activity analytics' })
    }
  })

  // Log a new activity (for when actions are performed via API)
  fastify.post('/log', async (request: any, reply) => {
    try {
      const { action, category, resource, resourceId, details } = request.body
      const user = request.user

      if (!action || !category) {
        return reply.code(400).send({ error: 'Action and category are required' })
      }

      const activity = await prisma.activityLog.create({
        data: {
          userId: user.id,
          action,
          category,
          resource,
          resourceId,
          details: details || {},
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          severity: 'info',
          success: true
        }
      })

      return { success: true, activity }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to log activity' })
    }
  })
}

export default activityRoutes
