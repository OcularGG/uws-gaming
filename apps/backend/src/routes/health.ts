import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

const healthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
  version: z.string(),
  environment: z.string(),
  database: z.object({
    status: z.string(),
    latency: z.number().optional(),
  }),
});

type HealthResponse = z.infer<typeof healthResponseSchema>;

export async function healthRoutes(fastify: FastifyInstance) {
  // Basic health check
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Basic health check',
      description: 'Returns basic application health status',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    return reply.status(200).send(response);
  });

  // Detailed health check with database
  fastify.get('/health/detailed', {
    schema: {
      tags: ['Health'],
      summary: 'Detailed health check',
      description: 'Returns detailed application health including database connectivity',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                latency: { type: 'number' },
              },
            },
          },
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database connectivity
      const dbStart = Date.now();
      let dbStatus = 'ok';
      let dbLatency = 0;      try {
        // Database health check using Prisma
        // await prisma.$queryRaw`SELECT 1 as health_check`;
        // For now, simulate database check without actual connection
        dbLatency = Date.now() - dbStart;
        dbStatus = 'simulated'; // Indicate this is a simulation
      } catch (error) {
        dbStatus = 'error';
        fastify.log.error('Database health check failed', error);
      }

      const response: HealthResponse = {
        status: dbStatus === 'ok' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: dbStatus,
          ...(dbStatus === 'ok' && { latency: dbLatency }),
        },
      };

      const statusCode = response.status === 'ok' ? 200 : 503;
      return reply.status(statusCode).send(response);
    } catch (error) {
      fastify.log.error('Health check failed', error);
      return reply.status(503).send({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  });

  // Readiness probe
  fastify.get('/ready', {
    schema: {
      tags: ['Health'],
      summary: 'Readiness probe',
      description: 'Kubernetes readiness probe endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            ready: { type: 'boolean' },
          },
        },
        503: {
          type: 'object',
          properties: {
            ready: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database connectivity for readiness
      // await prisma.$queryRaw`SELECT 1 as readiness_check`;
      // For now, simulate readiness check
      return reply.status(200).send({ ready: true });
    } catch (error) {
      fastify.log.error('Readiness check failed', error);
      return reply.status(503).send({
        ready: false,
        error: 'Service not ready',
      });
    }
  });

  // Liveness probe
  fastify.get('/live', {
    schema: {
      tags: ['Health'],
      summary: 'Liveness probe',
      description: 'Kubernetes liveness probe endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            alive: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ alive: true });
  });
}
