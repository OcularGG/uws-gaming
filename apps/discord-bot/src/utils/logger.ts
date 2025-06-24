import { config } from '../config/environment';

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (config.logging.level === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (['debug', 'info'].includes(config.logging.level)) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(config.logging.level)) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
};
