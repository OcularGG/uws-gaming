// Simple test to validate Discord token
const { Client, GatewayIntentBits } = require('discord.js');

const token = process.env.DISCORD_BOT_TOKEN;
console.log('Token length:', token ? token.length : 'undefined');
console.log('Token starts with:', token ? token.substring(0, 10) + '...' : 'undefined');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log('✅ Bot connected successfully!');
  console.log('Bot tag:', client.user.tag);
  process.exit(0);
});

client.on('error', (error) => {
  console.error('❌ Bot error:', error);
  process.exit(1);
});

client.login(token).catch((error) => {
  console.error('❌ Login failed:', error);
  process.exit(1);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Connection timeout');
  process.exit(1);
}, 30000);
