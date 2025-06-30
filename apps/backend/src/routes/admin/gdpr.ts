import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'
import * as fs from 'fs/promises'
import * as path from 'path'

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

const gdprRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', adminAuth)

  // Get all GDPR requests
  fastify.get('/requests', async (request: any, reply) => {
    try {
      const { status, type, page = 1, limit = 50 } = request.query

      const where: any = {}
      if (status && status !== 'all') {
        where.status = status
      }
      if (type && type !== 'all') {
        where.type = type
      }

      const requests = await prisma.gDPRRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          },
          processor: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })

      const totalRequests = await prisma.gDPRRequest.count({ where })

      return {
        requests,
        pagination: {
          page,
          limit,
          total: totalRequests,
          pages: Math.ceil(totalRequests / limit)
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to fetch GDPR requests' })
    }
  })

  // Process a GDPR request (approve/reject)
  fastify.patch('/requests/:requestId', async (request: any, reply) => {
    try {
      const { requestId } = request.params
      const { status, notes } = request.body
      const adminUser = request.user

      if (!['processing', 'completed', 'rejected'].includes(status)) {
        return reply.code(400).send({ error: 'Invalid status' })
      }

      const gdprRequest = await prisma.gDPRRequest.findUnique({
        where: { id: requestId },
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

      if (!gdprRequest) {
        return reply.code(404).send({ error: 'GDPR request not found' })
      }

      const updatedRequest = await prisma.gDPRRequest.update({
        where: { id: requestId },
        data: {
          status,
          processedBy: adminUser.id,
          processedAt: new Date(),
          notes
        }
      })

      // Log the admin action
      await prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          targetUserId: gdprRequest.userId,
          action: 'gdpr_request_processed',
          resource: 'gdpr_request',
          resourceId: requestId,
          previousValue: { status: gdprRequest.status },
          newValue: { status },
          reason: notes,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      })

      return { success: true, request: updatedRequest }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to process GDPR request' })
    }
  })

  // Get user data summary for GDPR
  fastify.get('/user-data/:userId', async (request: any, reply) => {
    try {
      const { userId } = request.params

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          applications: true,
          activityLogs: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              applications: true,
              activityLogs: true,
              gdprRequests: true
            }
          }
        }
      })

      if (!user) {
        return reply.code(404).send({ error: 'User not found' })
      }

      // Calculate data size estimate
      const dataTypes = {
        profile: true,
        applications: user._count.applications > 0,
        activityLogs: user._count.activityLogs > 0,
        gdprRequests: user._count.gdprRequests > 0
      }

      // Rough estimate of data size
      const estimatedSize = Math.round(
        (JSON.stringify(user).length / 1024) +
        (user._count.activityLogs * 0.5) +
        (user._count.applications * 2)
      )

      return {
        userId: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        dataTypes,
        totalDataSize: `${estimatedSize} KB`,
        counts: user._count
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to fetch user data summary' })
    }
  })

  // Export user data (for data export requests)
  fastify.post('/export-user-data/:userId', async (request: any, reply) => {
    try {
      const { userId } = request.params
      const adminUser = request.user

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          applications: true,
          activityLogs: {
            orderBy: { createdAt: 'desc' }
          },
          gdprRequests: true,
          sessions: true
        }
      })

      if (!user) {
        return reply.code(404).send({ error: 'User not found' })
      }

      // Create export data (remove sensitive fields)
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        applications: user.applications.map(app => ({
          id: app.id,
          status: app.status,
          captainName: app.captainName,
          preferredNickname: app.preferredNickname,
          submittedAt: app.submittedAt,
          reviewedAt: app.reviewedAt
        })),
        activityLogs: user.activityLogs.map(log => ({
          action: log.action,
          category: log.category,
          details: log.details,
          createdAt: log.createdAt
        })),
        gdprRequests: user.gdprRequests.map(req => ({
          type: req.type,
          status: req.status,
          createdAt: req.createdAt,
          completedAt: req.completedAt
        }))
      }

      // Generate filename and save export
      const filename = `user_data_export_${userId}_${Date.now()}.json`
      const exportPath = path.join(process.cwd(), 'exports', filename)

      // Ensure exports directory exists
      await fs.mkdir(path.dirname(exportPath), { recursive: true })

      // Write export file
      await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2))

      // Update GDPR request if this was for a request
      const gdprRequest = await prisma.gDPRRequest.findFirst({
        where: {
          userId,
          type: 'export',
          status: 'processing'
        }
      })

      if (gdprRequest) {
        await prisma.gDPRRequest.update({
          where: { id: gdprRequest.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            downloadUrl: `/api/admin/gdpr/download/${filename}`
          }
        })
      }

      // Log the action
      await prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          targetUserId: userId,
          action: 'gdpr_data_export',
          resource: 'user_data',
          resourceId: userId,
          details: { filename, recordCount: Object.keys(exportData).length },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      })

      return {
        success: true,
        filename,
        downloadUrl: `/api/admin/gdpr/download/${filename}`,
        message: 'User data exported successfully'
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to export user data' })
    }
  })

  // Delete user data (for deletion requests)
  fastify.delete('/delete-user-data/:userId', async (request: any, reply) => {
    try {
      const { userId } = request.params
      const { reason, confirmDelete } = request.body
      const adminUser = request.user

      if (!confirmDelete) {
        return reply.code(400).send({ error: 'Delete confirmation required' })
      }

      if (!reason) {
        return reply.code(400).send({ error: 'Reason is required for data deletion' })
      }

      // Get user data before deletion for audit log
      const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              applications: true,
              activityLogs: true,
              gdprRequests: true
            }
          }
        }
      })

      if (!userData) {
        return reply.code(404).send({ error: 'User not found' })
      }

      // Log the deletion before actually deleting
      await prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          targetUserId: userId,
          action: 'gdpr_data_deletion',
          resource: 'user_data',
          resourceId: userId,
          previousValue: userData,
          newValue: null,
          reason,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      })

      // Delete user (cascade should handle related data)
      await prisma.user.delete({
        where: { id: userId }
      })

      // Update any pending GDPR deletion requests
      await prisma.gDPRRequest.updateMany({
        where: {
          userId,
          type: 'deletion',
          status: 'processing'
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
          processedBy: adminUser.id
        }
      })

      return {
        success: true,
        message: 'User data deleted successfully',
        deletedCounts: userData._count
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to delete user data' })
    }
  })

  // Download exported data
  fastify.get('/download/:filename', async (request: any, reply) => {
    try {
      const { filename } = request.params

      // Validate filename to prevent directory traversal
      if (!/^user_data_export_[a-zA-Z0-9_]+\.json$/.test(filename)) {
        return reply.code(400).send({ error: 'Invalid filename' })
      }

      const filePath = path.join(process.cwd(), 'exports', filename)

      try {
        const fileContent = await fs.readFile(filePath)
        reply.header('Content-Type', 'application/json')
        reply.header('Content-Disposition', `attachment; filename="${filename}"`)
        return fileContent
      } catch (fileError) {
        return reply.code(404).send({ error: 'File not found' })
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to download file' })
    }
  })
}

export default gdprRoutes
