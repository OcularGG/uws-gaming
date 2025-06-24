var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/index.ts
import { Client as Client2, GatewayIntentBits, Partials, ActivityType } from "discord.js";
import * as Sentry from "@sentry/node";
import * as http from "http";

// src/config/environment.ts
import { z } from "zod";
var envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "preview"]).default("development"),
  DISCORD_BOT_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  DISCORD_REDIRECT_URI: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  API_BASE_URL: z.string().default("http://localhost:4000"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});
var env = envSchema.parse(process.env);
var config = {
  env: env.NODE_ENV,
  discord: {
    token: env.DISCORD_BOT_TOKEN,
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
    redirectUri: env.DISCORD_REDIRECT_URI
  },
  sentry: {
    dsn: env.SENTRY_DSN
  },
  api: {
    baseUrl: env.API_BASE_URL
  },
  logging: {
    level: env.LOG_LEVEL
  }
};

// src/utils/logger.ts
var logger = {
  debug: (message, ...args) => {
    if (config.logging.level === "debug") {
      console.log(`[DEBUG] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message}`, ...args);
    }
  },
  info: (message, ...args) => {
    if (["debug", "info"].includes(config.logging.level)) {
      console.log(`[INFO] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    if (["debug", "info", "warn"].includes(config.logging.level)) {
      console.warn(`[WARN] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    console.error(`[ERROR] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message}`, ...args);
  }
};

// src/core/CommandManager.ts
import { Collection } from "discord.js";
import * as path from "path";
import * as fs from "fs";
var CommandManager = class {
  constructor(client) {
    this.client = client;
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) {
        logger.warn(`No command matching ${interaction.commandName} was found.`);
        return;
      }
      try {
        await command.execute(interaction);
        logger.debug(`Command ${interaction.commandName} executed successfully`);
      } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}:`, error);
        const reply = {
          content: "There was an error while executing this command!",
          ephemeral: true
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    });
  }
  commands = new Collection();
  async loadCommands() {
    const commandsPath = path.join(__dirname, "../commands");
    if (!fs.existsSync(commandsPath)) {
      fs.mkdirSync(commandsPath, { recursive: true });
      logger.info("Created commands directory");
      return;
    }
    const commandFiles = fs.readdirSync(commandsPath).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    );
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const command = __require(filePath);
        if ("data" in command && "execute" in command) {
          this.commands.set(command.data.name, command);
          logger.debug(`Loaded command: ${command.data.name}`);
        } else {
          logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
        }
      } catch (error) {
        logger.error(`Error loading command ${file}:`, error);
      }
    }
    logger.info(`Loaded ${this.commands.size} commands`);
  }
  getCommands() {
    return this.commands;
  }
  getCommandData() {
    return this.commands.map((command) => command.data.toJSON());
  }
};

// src/core/EventManager.ts
import * as path2 from "path";
import * as fs2 from "fs";
var EventManager = class {
  constructor(client) {
    this.client = client;
  }
  async loadEvents() {
    const eventsPath = path2.join(__dirname, "../events");
    if (!fs2.existsSync(eventsPath)) {
      fs2.mkdirSync(eventsPath, { recursive: true });
      logger.info("Created events directory");
      return;
    }
    const eventFiles = fs2.readdirSync(eventsPath).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    );
    let loadedEvents = 0;
    for (const file of eventFiles) {
      const filePath = path2.join(eventsPath, file);
      try {
        const event = __require(filePath);
        if ("name" in event && "execute" in event) {
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
};

// src/index.ts
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.env,
    tracesSampleRate: config.env === "production" ? 0.1 : 1
  });
}
var KrakenBot = class {
  client;
  commandManager;
  eventManager;
  healthServer;
  constructor() {
    this.client = new Client2({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User
      ]
    });
    this.commandManager = new CommandManager(this.client);
    this.eventManager = new EventManager(this.client);
    this.healthServer = http.createServer((req, res) => {
      if (req.url === "/health" || req.url === "/") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          status: "healthy",
          uptime: process.uptime(),
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          botReady: this.client.isReady()
        }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
      }
    });
  }
  async initialize() {
    try {
      logger.info("\u{1F916} Initializing KrakenGaming Discord Bot...");
      this.setupErrorHandling();
      await this.commandManager.loadCommands();
      await this.eventManager.loadEvents();
      this.client.once("ready", () => {
        logger.info(`\u2705 Bot is ready! Logged in as ${this.client.user?.tag}`);
        logger.info(`\u{1F310} Serving ${this.client.guilds.cache.size} guilds`);
        this.client.user?.setActivity("KrakenGaming.org", {
          type: ActivityType.Watching
        });
      });
      await this.client.login(config.discord.token);
      const port = parseInt(process.env.PORT || "8080", 10);
      this.healthServer.listen(port, () => {
        logger.info(`\u2705 Health check server running on port ${port}`);
      });
    } catch (error) {
      logger.error("Failed to initialize bot:", error);
      Sentry.captureException(error);
      process.exit(1);
    }
  }
  setupErrorHandling() {
    this.client.on("error", (error) => {
      logger.error("Discord client error:", error);
      Sentry.captureException(error);
    });
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled promise rejection:", { reason, promise });
      Sentry.captureException(reason);
    });
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception:", error);
      Sentry.captureException(error);
      process.exit(1);
    });
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
        if (this.healthServer) {
          this.healthServer.close();
          logger.info("Health server closed");
        }
        await this.client.destroy();
        logger.info("Bot disconnected successfully");
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown:", error);
        process.exit(1);
      }
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  }
  async shutdown() {
    logger.info("Shutting down bot...");
    if (this.healthServer) {
      this.healthServer.close();
    }
    await this.client.destroy();
  }
};
if (__require.main === module) {
  const bot = new KrakenBot();
  bot.initialize().catch((error) => {
    logger.error("Failed to start bot:", error);
    process.exit(1);
  });
}
export {
  KrakenBot
};
