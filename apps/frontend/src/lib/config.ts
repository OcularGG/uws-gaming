/**
 * Environment configuration utilities for KrakenGaming
 * Handles environment-specific settings across local, preview, and production
 */

export type Environment = 'local' | 'preview' | 'production';

export interface AppConfig {
  env: Environment;
  domain: string;
  apiUrl: string;
  botUrl: string;
  appName: string;
  appVersion: string;
  maintenanceMode: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  sentryDsn?: string;
  discordClientId?: string;
  discordRedirectUri: string;
}

/**
 * Get the current environment
 */
export function getEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_ENV as Environment;
  return env || 'local';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Check if running in preview
 */
export function isPreview(): boolean {
  return getEnvironment() === 'preview';
}

/**
 * Check if running locally
 */
export function isLocal(): boolean {
  return getEnvironment() === 'local';
}

/**
 * Get the app configuration based on environment
 */
export function getAppConfig(): AppConfig {
  const env = getEnvironment();

  return {
    env,
    domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    botUrl: process.env.NEXT_PUBLIC_BOT_URL || 'http://localhost:3001',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'KrakenGaming',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    discordRedirectUri: process.env.DISCORD_REDIRECT_URI || `${process.env.NEXT_PUBLIC_DOMAIN}/auth/discord/callback`,
  };
}

/**
 * Get API base URL with proper protocol
 */
export function getApiUrl(path = ''): string {
  const config = getAppConfig();
  const baseUrl = config.apiUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
}

/**
 * Get full URL for the current domain
 */
export function getFullUrl(path = ''): string {
  const config = getAppConfig();
  const protocol = isLocal() ? 'http' : 'https';
  const baseUrl = `${protocol}://${config.domain}`;
  const cleanPath = path.replace(/^\//, '');
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
}

/**
 * Get Discord OAuth URL
 */
export function getDiscordOAuthUrl(): string {
  const config = getAppConfig();
  const scopes = 'bot%20applications.commands%20guilds%20guilds.join%20email%20connections';
  const redirectUri = encodeURIComponent(config.discordRedirectUri);

  return `https://discord.com/api/oauth2/authorize?client_id=${config.discordClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`;
}

/**
 * Environment-specific feature flags
 */
export const featureFlags = {
  get enableDiscordBot(): boolean {
    return !isLocal() || process.env.ENABLE_DISCORD_BOT === 'true';
  },

  get enableDatabase(): boolean {
    return process.env.DATABASE_URL !== undefined;
  },

  get enableCloudStorage(): boolean {
    return !isLocal() || process.env.ENABLE_CLOUD_STORAGE === 'true';
  },

  get enableEmailNotifications(): boolean {
    return !isLocal() || process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
  },
} as const;

const config = {
  getEnvironment,
  isProduction,  isPreview,
  isLocal,
  getAppConfig,
  getApiUrl,
  getFullUrl,
  getDiscordOAuthUrl,
  featureFlags,
};

export default config;
