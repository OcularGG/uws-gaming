import { Client, GatewayIntentBits } from 'discord.js';
import * as http from 'http';

console.log('Starting Discord bot...');

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Health server listening on port ${PORT}`);
});

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Bot event handlers
client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user?.tag}`);
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  client.destroy();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  client.destroy();
  server.close(() => process.exit(0));
});

// Login to Discord
async function startBot() {
  try {
    const token = process.env.DISCORD_BOT_TOKEN;
    console.log('Bot token length:', token?.length || 0);
    console.log('Bot token prefix:', token?.substring(0, 10) || 'undefined');

    if (!token) {
      throw new Error('DISCORD_BOT_TOKEN environment variable is not set');
    }

    console.log('Attempting to login to Discord...');
    await client.login(token);
  } catch (error) {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
  }
}

startBot();
