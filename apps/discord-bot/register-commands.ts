import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { readdirSync } from 'fs';
import { join } from 'path';
import { config } from './src/config/environment';

const commands: any[] = [];
const commandsPath = join(__dirname, 'src', 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

console.log('🔍 Loading commands...');

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`✅ Loaded command: ${command.data.name}`);
  } else {
    console.log(`⚠️  Command at ${filePath} is missing required "data" or "execute" property`);
  }
}

const rest = new REST({ version: '10' }).setToken(config.discord.token);

async function registerCommands() {
  try {
    console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

    // Register commands globally
    const data = await rest.put(
      Routes.applicationCommands(config.discord.clientId),
      { body: commands },
    ) as any[];

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
    console.log('Registered commands:');
    data.forEach(cmd => {
      console.log(`  - /${cmd.name}: ${cmd.description}`);
    });

  } catch (error) {
    console.error('❌ Error registering commands:', error);
    process.exit(1);
  }
}

registerCommands();
