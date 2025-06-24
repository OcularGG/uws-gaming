import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'preview']).default('development'),
  DISCORD_BOT_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  DISCORD_REDIRECT_URI: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  API_BASE_URL: z.string().default('http://localhost:4000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  discord: {
    token: env.DISCORD_BOT_TOKEN,
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
    redirectUri: env.DISCORD_REDIRECT_URI,
  },
  sentry: {
    dsn: env.SENTRY_DSN,
  },
  api: {
    baseUrl: env.API_BASE_URL,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;
