import { REST, Routes } from 'discord.js';
import { config } from '../config/environment';
import { CommandManager } from '../core/CommandManager';
import { Client } from 'discord.js';
import { logger } from '../utils/logger';

async function deployCommands() {
  try {
    logger.info('Started refreshing application (/) commands.');

    const client = new Client({ intents: [] });
    const commandManager = new CommandManager(client);
    await commandManager.loadCommands();

    const commands = commandManager.getCommandData();

    const rest = new REST({ version: '10' }).setToken(config.discord.token);

    // Deploy commands globally
    const data = await rest.put(
      Routes.applicationCommands(config.discord.clientId),
      { body: commands }
    ) as any[];

    logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    logger.error('Error deploying commands:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  deployCommands();
}
