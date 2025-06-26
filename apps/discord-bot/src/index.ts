import { Client, GatewayIntentBits, Partials, ActivityType } from 'discord.js';
import * as Sentry from '@sentry/node';
import * as http from 'http';
import { config } from './config/environment';
import { logger } from './utils/logger';
import { CommandManager } from './core/CommandManager';
import { EventManager } from './core/EventManager';
import ApplicationButtonHandler from './events/applicationButtons';

// Initialize Sentry for error tracking
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.env,
    tracesSampleRate: config.env === 'production' ? 0.1 : 1.0,
  });
}

class KrakenBot {
  public readonly client: Client;
  private commandManager: CommandManager;
  private eventManager: EventManager;
  private buttonHandler: ApplicationButtonHandler;
  private healthServer: http.Server;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User,
      ],
    });

    this.commandManager = new CommandManager(this.client);
    this.eventManager = new EventManager(this.client);
    this.buttonHandler = new ApplicationButtonHandler(this.client);

    // Create health check server for Cloud Run
    this.healthServer = http.createServer((req, res) => {
      if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          botReady: this.client.isReady()
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🤖 Initializing KrakenGaming Discord Bot...');

      // Set up error handling
      this.setupErrorHandling();

      // Load commands and events
      await this.commandManager.loadCommands();
      await this.eventManager.loadEvents();

      // Set up ready event
      this.client.once('ready', () => {
        logger.info(`✅ Bot is ready! Logged in as ${this.client.user?.tag}`);
        logger.info(`🌐 Serving ${this.client.guilds.cache.size} guilds`);

        // Set bot activity
        this.client.user?.setActivity('KrakenGaming.org', {
          type: ActivityType.Watching,
        });
      });      // Login to Discord
      await this.client.login(config.discord.token);

      // Start health check server for Cloud Run
      const port = parseInt(process.env.PORT || '8080', 10);
      this.healthServer.listen(port, () => {
        logger.info(`✅ Health check server running on port ${port}`);
      });
    } catch (error) {
      logger.error('Failed to initialize bot:', error);
      Sentry.captureException(error);
      process.exit(1);
    }
  }

  private setupErrorHandling(): void {
    // Handle Discord.js errors
    this.client.on('error', (error) => {
      logger.error('Discord client error:', error);
      Sentry.captureException(error);
    });

    // Handle process errors
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection:', { reason, promise });
      Sentry.captureException(reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      Sentry.captureException(error);
      process.exit(1);
    });    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      try {
        // Close health server
        if (this.healthServer) {
          this.healthServer.close();
          logger.info('Health server closed');
        }

        // Disconnect bot
        await this.client.destroy();
        logger.info('Bot disconnected successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
  async shutdown(): Promise<void> {
    logger.info('Shutting down bot...');

    // Close health server
    if (this.healthServer) {
      this.healthServer.close();
    }

    // Disconnect bot
    await this.client.destroy();
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  const bot = new KrakenBot();
  bot.initialize().catch((error) => {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  });
}

export { KrakenBot };
