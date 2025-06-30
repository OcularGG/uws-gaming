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

const auditRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', adminAuth)

  // Get audit logs
  fastify.get('/logs', async (request: any, reply) => {
    try {
      const {
        adminUserId,
        targetUserId,
        action,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = request.query

      const where: any = {}

      if (adminUserId) {
        where.adminUserId = adminUserId
      }

      if (targetUserId) {
        where.targetUserId = targetUserId
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

      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          adminUser: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          },
          targetUser: {
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

      const totalLogs = await prisma.auditLog.count({ where })

      return {
        auditLogs,
        pagination: {
          page,
          limit,
          total: totalLogs,
          pages: Math.ceil(totalLogs / limit)
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to fetch audit logs' })
    }
  })

  // Export audit logs as CSV
  fastify.get('/export', async (request: any, reply) => {
    try {
      const { startDate, endDate, format = 'csv' } = request.query
      const adminUser = request.user

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

      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          adminUser: {
            select: {
              username: true,
              email: true
            }
          },
          targetUser: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Log the export action
      await prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          action: 'audit_logs_export',
          resource: 'audit_log',
          details: {
            exportFormat: format,
            recordCount: auditLogs.length,
            dateRange: { startDate, endDate }
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      })

      if (format === 'json') {
        reply.header('Content-Type', 'application/json')
        reply.header('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`)
        return auditLogs
      }

      // Generate CSV
      const csvHeader = 'Date,Admin User,Target User,Action,Resource,Previous Value,New Value,Reason,IP Address,Success\n'
      const csvRows = auditLogs.map(log => {
        const date = new Date(log.createdAt).toISOString()
        const adminUser = log.adminUser?.username || 'Unknown'
        const targetUser = log.targetUser?.username || 'N/A'
        const action = log.action
        const resource = log.resource || 'N/A'
        const previousValue = log.previousValue ? JSON.stringify(log.previousValue).replace(/"/g, '""') : 'N/A'
        const newValue = log.newValue ? JSON.stringify(log.newValue).replace(/"/g, '""') : 'N/A'
        const reason = log.reason || 'N/A'
        const ipAddress = log.ipAddress || 'N/A'
        const success = log.success ? 'Yes' : 'No'

        return `"${date}","${adminUser}","${targetUser}","${action}","${resource}","${previousValue}","${newValue}","${reason}","${ipAddress}","${success}"`
      }).join('\n')

      const csv = csvHeader + csvRows

      reply.header('Content-Type', 'text/csv')
      reply.header('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`)
      return csv
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to export audit logs' })
    }
  })

  // Create audit log entry (for manual logging)
  fastify.post('/log', async (request: any, reply) => {
    try {
      const {
        targetUserId,
        action,
        resource,
        resourceId,
        previousValue,
        newValue,
        reason
      } = request.body
      const adminUser = request.user

      if (!action) {
        return reply.code(400).send({ error: 'Action is required' })
      }

      const auditLog = await prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          targetUserId,
          action,
          resource,
          resourceId,
          previousValue,
          newValue,
          reason,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      })

      return { success: true, auditLog }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to create audit log' })
    }
  })
}

export default auditRoutes
