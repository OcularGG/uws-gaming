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

interface CreateRoleRequest {
  name: string
  description: string
  permissions: string[]
}

interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
}

interface AssignRoleRequest {
  userId: string
  roleId: string
}

export default async function rolesRoutes(fastify: FastifyInstance) {
  // Get all roles with permissions and user counts
  fastify.get('/roles', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const roles = await prisma.role.findMany({
        include: {
          users: {
            select: { userId: true }
          }
        }
      })

      const rolesWithCounts = roles.map((role: any) => ({
        ...role,
        userCount: role.users.length,
        permissions: role.permissions || []
      }))

      return { data: rolesWithCounts }
    } catch (error) {
      fastify.log.error('Error fetching roles:', error)
      return reply.status(500).send({ error: 'Failed to fetch roles' })
    }
  })

  // Get available permissions
  fastify.get('/permissions', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Return available permissions based on your system
      const permissions = [
        { id: 'admin.users.view', name: 'View Users', description: 'View user roster', category: 'User Management' },
        { id: 'admin.users.edit', name: 'Edit Users', description: 'Edit user details', category: 'User Management' },
        { id: 'admin.users.delete', name: 'Delete Users', description: 'Delete users', category: 'User Management' },
        { id: 'admin.applications.view', name: 'View Applications', description: 'View applications', category: 'Applications' },
        { id: 'admin.applications.approve', name: 'Approve Applications', description: 'Approve/deny applications', category: 'Applications' },
        { id: 'admin.portbattles.create', name: 'Create Port Battles', description: 'Create port battles', category: 'Port Battles' },
        { id: 'admin.portbattles.manage', name: 'Manage Port Battles', description: 'Manage port battles', category: 'Port Battles' },
        { id: 'admin.gallery.moderate', name: 'Moderate Gallery', description: 'Moderate gallery content', category: 'Gallery' },
        { id: 'admin.blacklist.manage', name: 'Manage Blacklist', description: 'Manage blacklist', category: 'Security' },
        { id: 'admin.roles.manage', name: 'Manage Roles', description: 'Manage roles and permissions', category: 'System' },
        { id: 'admin.audit.view', name: 'View Audit Logs', description: 'View audit logs', category: 'System' },
        { id: 'admin.gdpr.manage', name: 'Manage GDPR', description: 'Handle GDPR requests', category: 'Legal' },
        { id: 'admin.settings.manage', name: 'Manage Settings', description: 'Manage system settings', category: 'System' }
      ]

      return { data: permissions }
    } catch (error) {
      fastify.log.error('Error fetching permissions:', error)
      return reply.status(500).send({ error: 'Failed to fetch permissions' })
    }
  })

  // Create a new role
  fastify.post<{ Body: CreateRoleRequest }>('/roles', async (request: FastifyRequest<{ Body: CreateRoleRequest }>, reply: FastifyReply) => {
    try {
      const { name, description, permissions } = request.body

      if (!name || !description) {
        return reply.status(400).send({ error: 'Name and description are required' })
      }

      // Check if role name already exists
      const existingRole = await prisma.role.findUnique({
        where: { name }
      })

      if (existingRole) {
        return reply.status(400).send({ error: 'Role name already exists' })
      }

      const role = await prisma.role.create({
        data: {
          name,
          description,
          permissions: permissions || []
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'ROLE_CREATE',
          category: 'admin',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: { roleId: role.id, roleName: role.name },
          ipAddress: request.ip
        }
      })

      return { data: role }
    } catch (error) {
      fastify.log.error('Error creating role:', error)
      return reply.status(500).send({ error: 'Failed to create role' })
    }
  })

  // Update a role
  fastify.put<{ Params: { roleId: string }, Body: UpdateRoleRequest }>('/roles/:roleId', async (request: FastifyRequest<{ Params: { roleId: string }, Body: UpdateRoleRequest }>, reply: FastifyReply) => {
    try {
      const { roleId } = request.params
      const { name, description, permissions } = request.body

      const existingRole = await prisma.role.findUnique({
        where: { id: roleId }
      })

      if (!existingRole) {
        return reply.status(404).send({ error: 'Role not found' })
      }

      // Check if new name conflicts with existing role
      if (name && name !== existingRole.name) {
        const nameConflict = await prisma.role.findUnique({
          where: { name }
        })
        if (nameConflict) {
          return reply.status(400).send({ error: 'Role name already exists' })
        }
      }

      const role = await prisma.role.update({
        where: { id: roleId },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(permissions && { permissions })
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'ROLE_UPDATE',
          category: 'admin',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: { roleId: role.id, roleName: role.name, changes: request.body },
          previousValue: { name: existingRole.name, description: existingRole.description, permissions: existingRole.permissions },
          newValue: { name: role.name, description: role.description, permissions: role.permissions },
          ipAddress: request.ip
        }
      })

      return { data: role }
    } catch (error) {
      fastify.log.error('Error updating role:', error)
      return reply.status(500).send({ error: 'Failed to update role' })
    }
  })

  // Delete a role
  fastify.delete<{ Params: { roleId: string } }>('/roles/:roleId', async (request: FastifyRequest<{ Params: { roleId: string } }>, reply: FastifyReply) => {
    try {
      const { roleId } = request.params

      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: { users: true }
      })

      if (!role) {
        return reply.status(404).send({ error: 'Role not found' })
      }

      if (role.users.length > 0) {
        return reply.status(400).send({ error: 'Cannot delete role with assigned users' })
      }

      await prisma.role.delete({
        where: { id: roleId }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'ROLE_DELETE',
          category: 'admin',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: { roleId, roleName: role.name },
          ipAddress: request.ip
        }
      })

      return { message: 'Role deleted successfully' }
    } catch (error) {
      fastify.log.error('Error deleting role:', error)
      return reply.status(500).send({ error: 'Failed to delete role' })
    }
  })

  // Assign role to user
  fastify.post<{ Body: AssignRoleRequest }>('/roles/assign', async (request: FastifyRequest<{ Body: AssignRoleRequest }>, reply: FastifyReply) => {
    try {
      const { userId, roleId } = request.body

      if (!userId || !roleId) {
        return reply.status(400).send({ error: 'User ID and Role ID are required' })
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      // Check if role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      })

      if (!role) {
        return reply.status(404).send({ error: 'Role not found' })
      }

      // Check if assignment already exists
      const existingAssignment = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId
          }
        }
      })

      if (existingAssignment) {
        return reply.status(400).send({ error: 'User already has this role' })
      }

      const userRole = await prisma.userRole.create({
        data: {
          userId,
          roleId,
          assignedBy: request.user?.id || 'system'
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'ROLE_ASSIGN',
          category: 'admin',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          targetUserId: userId,
          targetUserEmail: user.email,
          details: { roleId, roleName: role.name },
          ipAddress: request.ip
        }
      })

      return { data: userRole }
    } catch (error) {
      fastify.log.error('Error assigning role:', error)
      return reply.status(500).send({ error: 'Failed to assign role' })
    }
  })

  // Remove role from user
  fastify.delete<{ Params: { userId: string, roleId: string } }>('/roles/:roleId/users/:userId', async (request: FastifyRequest<{ Params: { userId: string, roleId: string } }>, reply: FastifyReply) => {
    try {
      const { userId, roleId } = request.params

      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId
          }
        },
        include: {
          user: true,
          role: true
        }
      })

      if (!userRole) {
        return reply.status(404).send({ error: 'Role assignment not found' })
      }

      await prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId
          }
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'ROLE_UNASSIGN',
          category: 'admin',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          targetUserId: userId,
          targetUserEmail: userRole.user.email,
          details: { roleId, roleName: userRole.role.name },
          ipAddress: request.ip
        }
      })

      return { message: 'Role removed from user successfully' }
    } catch (error) {
      fastify.log.error('Error removing role:', error)
      return reply.status(500).send({ error: 'Failed to remove role' })
    }
  })

  // Get users with specific role
  fastify.get<{ Params: { roleId: string } }>('/roles/:roleId/users', async (request: FastifyRequest<{ Params: { roleId: string } }>, reply: FastifyReply) => {
    try {
      const { roleId } = request.params

      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  createdAt: true,
                  lastLoginAt: true
                }
              }
            }
          }
        }
      })

      if (!role) {
        return reply.status(404).send({ error: 'Role not found' })
      }

      const users = role.users.map((ur: any) => ({
        ...ur.user,
        assignedAt: ur.assignedAt,
        assignedBy: ur.assignedBy
      }))

      return { data: { role, users } }
    } catch (error) {
      fastify.log.error('Error fetching role users:', error)
      return reply.status(500).send({ error: 'Failed to fetch role users' })
    }
  })
}
