import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { config } from '../config/environment';
import { adminMiddleware, AuthenticatedRequest } from '../middleware/auth';

const maintenanceStatusSchema = z.object({
  maintenanceMode: z.boolean(),
  message: z.string().optional(),
  estimatedDowntime: z.string().optional(),
  lastUpdated: z.string(),
});

type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>;

interface MaintenanceRequestBody {
  enabled: boolean;
  message?: string;
  estimatedDowntime?: string;
}

export async function maintenanceRoutes(fastify: FastifyInstance) {
  // Get maintenance status
  fastify.get('/maintenance', {
    schema: {
      tags: ['Maintenance'],
      summary: 'Get maintenance status',
      description: 'Returns current maintenance mode status',
      response: {
        200: {
          type: 'object',
          properties: {
            maintenanceMode: { type: 'boolean' },
            message: { type: 'string' },
            estimatedDowntime: { type: 'string' },
            lastUpdated: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const response: MaintenanceStatus = {
      maintenanceMode: config.maintenance.enabled,
      message: config.maintenance.enabled
        ? 'The system is currently under maintenance. Please check back later.'
        : 'System is operational',
      estimatedDowntime: config.maintenance.enabled ? 'TBA' : undefined,
      lastUpdated: new Date().toISOString(),
    };

    return reply.status(200).send(response);
  });
  // Set maintenance mode (admin endpoint - protected)
  fastify.post('/maintenance', {
    preHandler: adminMiddleware,
    schema: {
      tags: ['Maintenance'],
      summary: 'Set maintenance mode',
      description: 'Enable or disable maintenance mode (admin only)',
      body: {
        type: 'object',
        required: ['enabled'],
        properties: {
          enabled: { type: 'boolean' },
          message: { type: 'string' },
          estimatedDowntime: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            maintenanceMode: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { enabled, message, estimatedDowntime } = request.body as MaintenanceRequestBody;
    const user = (request as AuthenticatedRequest).user;

    fastify.log.info({
      action: 'maintenance_mode_change',
      enabled,
      message,
      estimatedDowntime,
      adminUser: user?.email,
    }, 'Maintenance mode changed by admin');

    return reply.status(200).send({
      success: true,
      maintenanceMode: enabled,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
    });
  });

  // Maintenance check middleware helper
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip maintenance check for health and maintenance endpoints
    const skipPaths = ['/health', '/maintenance', '/docs', '/ready', '/live'];
    const shouldSkip = skipPaths.some(path => request.url.startsWith(path));

    if (!shouldSkip && config.maintenance.enabled) {
      return reply.status(503).send({
        error: 'Service Unavailable',
        message: 'The system is currently under maintenance. Please check back later.',
        maintenanceMode: true,
        timestamp: new Date().toISOString(),
      });
    }
  });
}
