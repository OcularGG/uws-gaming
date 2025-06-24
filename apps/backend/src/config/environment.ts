import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'preview']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  MAINTENANCE_MODE: z.string().transform(Boolean).default('false'),
});

const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET || 'development-secret-change-in-production',
  },
  sentry: {
    dsn: env.SENTRY_DSN,
  },
  cors: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
  },
  maintenance: {
    enabled: env.MAINTENANCE_MODE,
  },
} as const;
