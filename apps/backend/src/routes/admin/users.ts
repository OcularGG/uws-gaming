import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AdminAuthRequest {
  user?: {
    id: string
    email: string
    role: string
    isAdmin?: boolean
  }
}

// Middleware to check admin permissions
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

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // Add admin auth hook
  fastify.addHook('preHandler', adminAuth)

  // Get admin dashboard stats
  fastify.get('/stats', async (request, reply) => {
    try {
      const [
        totalUsers,
        totalApplications,
        pendingApplications,
        totalPortBattles,
        activePortBattles,
        galleryReports,
        pendingGDPRRequests,
        totalAuditLogs
      ] = await Promise.all([
        prisma.user.count(),
        prisma.application.count(),
        prisma.application.count({ where: { status: 'PENDING' } }),
        prisma.portBattle.count(),
        prisma.portBattle.count({ where: { status: 'active' } }),
        prisma.galleryReport.count({ where: { status: 'pending' } }),
        prisma.gDPRRequest.count({ where: { status: 'pending' } }),
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        })
      ])

      return {
        totalUsers,
        totalApplications,
        pendingApplications,
        totalPortBattles,
        activePortBattles,
        galleryReports,
        pendingGDPRRequests,
        totalAuditLogs
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to fetch dashboard stats' })
    }
  })

  // Get all users for roster management
  fastify.get('/users', async (request: any, reply) => {
    try {
      const { page = 1, limit = 50, search, role, status } = request.query

      const where: any = {}

      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (role && role !== 'all') {
        where.role = role
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              applications: true,
              activityLogs: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })

      const totalUsers = await prisma.user.count({ where })

      return {
        users,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit)
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to fetch users' })
    }
  })

  // Update user role
  fastify.patch('/users/:userId/role', async (request: any, reply) => {
    try {
      const { userId } = request.params
      const { role, reason } = request.body
      const adminUser = request.user

      if (!role || !['user', 'admin', 'moderator'].includes(role)) {
        return reply.code(400).send({ error: 'Invalid role' })
      }

      // Get current user data
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, username: true, email: true }
      })

      if (!currentUser) {
        return reply.code(404).send({ error: 'User not found' })
      }

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role }
      })

      // Log the admin action
      await prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          targetUserId: userId,
          action: 'user_role_change',
          resource: 'user',
          resourceId: userId,
          previousValue: { role: currentUser.role },
          newValue: { role },
          reason,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      })

      // Log user activity
      await prisma.activityLog.create({
        data: {
          userId: adminUser.id,
          action: 'admin_user_role_change',
          category: 'admin',
          resource: 'user',
          resourceId: userId,
          details: {
            targetUser: currentUser.username,
            oldRole: currentUser.role,
            newRole: role,
            reason
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      })

      return { success: true, user: updatedUser }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to update user role' })
    }
  })

  // Delete user
  fastify.delete('/users/:userId', async (request: any, reply) => {
    try {
      const { userId } = request.params
      const { reason } = request.body
      const adminUser = request.user

      if (!reason) {
        return reply.code(400).send({ error: 'Reason is required for user deletion' })
      }

      // Get user data before deletion
      const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          email: true,
          role: true,
          createdAt: true
        }
      })

      if (!userData) {
        return reply.code(404).send({ error: 'User not found' })
      }

      // Log the deletion
      await prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          targetUserId: userId,
          action: 'user_delete',
          resource: 'user',
          resourceId: userId,
          previousValue: userData,
          newValue: null,
          reason,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      })

      // Delete user (cascading deletes should handle related data)
      await prisma.user.delete({
        where: { id: userId }
      })

      return { success: true, message: 'User deleted successfully' }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to delete user' })
    }
  })
}

export default adminRoutes
