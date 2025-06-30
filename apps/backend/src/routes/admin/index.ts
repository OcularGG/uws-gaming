import { FastifyPluginAsync } from 'fastify'
import usersRoutes from './users'
import activityRoutes from './activity'
import auditRoutes from './audit'
import gdprRoutes from './gdpr'
import rolesRoutes from './roles'
import blacklistRoutes from './blacklist'
import galleryReportsRoutes from './gallery-reports'
import portBattleRoutes from './port-battles'

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // Register all admin sub-routes
  await fastify.register(usersRoutes, { prefix: '/users' })
  await fastify.register(activityRoutes, { prefix: '/activity' })
  await fastify.register(auditRoutes, { prefix: '/audit' })
  await fastify.register(gdprRoutes, { prefix: '/gdpr' })
  await fastify.register(rolesRoutes, { prefix: '/roles' })
  await fastify.register(blacklistRoutes, { prefix: '/blacklist' })
  await fastify.register(galleryReportsRoutes, { prefix: '/gallery-reports' })
  await fastify.register(portBattleRoutes, { prefix: '/port-battles' })

  // Admin dashboard route
  fastify.get('/dashboard', async (request, reply) => {
    return { message: 'Admin Dashboard API' }
  })
}

export default adminRoutes
