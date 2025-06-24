import { Client } from 'discord.js';
import { logger } from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';

export interface Event {
  name: string;
  once?: boolean;
  execute(...args: any[]): Promise<void>;
}

export class EventManager {
  constructor(private client: Client) {}

  async loadEvents(): Promise<void> {
    const eventsPath = path.join(__dirname, '../events');

    // Create events directory if it doesn't exist
    if (!fs.existsSync(eventsPath)) {
      fs.mkdirSync(eventsPath, { recursive: true });
      logger.info('Created events directory');
      return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file =>
      file.endsWith('.ts') || file.endsWith('.js')
    );

    let loadedEvents = 0;

    for (const file of eventFiles) {      const filePath = path.join(eventsPath, file);
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const event = require(filePath);

        if ('name' in event && 'execute' in event) {
          if (event.once) {
            this.client.once(event.name, (...args) => event.execute(...args));
          } else {
            this.client.on(event.name, (...args) => event.execute(...args));
          }

          logger.debug(`Loaded event: ${event.name}`);
          loadedEvents++;
        } else {
          logger.warn(`Event at ${filePath} is missing required "name" or "execute" property`);
        }
      } catch (error) {
        logger.error(`Error loading event ${file}:`, error);
      }
    }

    logger.info(`Loaded ${loadedEvents} events`);
  }
}
