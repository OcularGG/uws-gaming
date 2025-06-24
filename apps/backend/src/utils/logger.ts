import pino from 'pino';
import { config } from '../config/environment';

export const logger = pino({
  name: 'krakengaming-backend',
  level: config.env === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(config.env !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});
