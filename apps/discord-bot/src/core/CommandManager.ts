import { Client, Collection, SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { logger } from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';

export interface Command {
  data: SlashCommandBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}

export class CommandManager {
  private commands: Collection<string, Command> = new Collection();

  constructor(private client: Client) {
    // Set up interaction handler
    this.client.on('interactionCreate', async (interaction) => {
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
          content: 'There was an error while executing this command!',
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    });
  }

  async loadCommands(): Promise<void> {
    const commandsPath = path.join(__dirname, '../commands');

    // Create commands directory if it doesn't exist
    if (!fs.existsSync(commandsPath)) {
      fs.mkdirSync(commandsPath, { recursive: true });
      logger.info('Created commands directory');
      return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file =>
      file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of commandFiles) {      const filePath = path.join(commandsPath, file);
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
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

  getCommands(): Collection<string, Command> {
    return this.commands;
  }

  getCommandData(): any[] {
    return this.commands.map(command => command.data.toJSON());
  }
}
