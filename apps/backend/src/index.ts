import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import * as Sentry from '@sentry/node';
import { config } from './config/environment';
import { healthRoutes } from './routes/health';
import { maintenanceRoutes } from './routes/maintenance';
import adminRoutes from './routes/admin';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';

// Initialize Sentry for error tracking
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.env,
    tracesSampleRate: config.env === 'production' ? 0.1 : 1.0,
  });
}

const build = async (opts?: { logger?: boolean }) => {
  const fastify = Fastify({
    logger: opts?.logger !== false ? logger : false,
    trustProxy: true,
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  });

  // CORS configuration
  await fastify.register(cors, {
    origin: config.cors.allowedOrigins,
    credentials: true,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'KrakenGaming API',
        description: 'Cloud-native backend API for KrakenGaming platform',
        version: '1.0.0',
        contact: {
          name: 'KrakenGaming Team',
          email: 'support@krakengaming.org',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'https://api.krakengaming.org',
          description: 'Production server',
        },
        {
          url: 'https://api.preview.krakengaming.org',
          description: 'Preview server',
        },
        {
          url: 'http://localhost:4000',
          description: 'Local development server',
        },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Maintenance', description: 'Maintenance mode endpoints' },
        { name: 'Admin', description: 'Administrative endpoints' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });

  // Register routes
  await fastify.register(healthRoutes, { prefix: '/api/v1' });
  await fastify.register(maintenanceRoutes, { prefix: '/api/v1' });
  await fastify.register(adminRoutes, { prefix: '/api/v1/admin' });

  // Error handler
  fastify.setErrorHandler(errorHandler);

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    await fastify.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return fastify;
};

const start = async () => {
  try {
    const fastify = await build();

    await fastify.listen({
      port: config.port,
      host: config.host,
    });

    logger.info(`🚀 Server running on ${config.host}:${config.port}`);
    logger.info(`📚 API documentation available at http://${config.host}:${config.port}/docs`);
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

export { build };
