// Discord Bot test setup
process.env.NODE_ENV = 'test';
process.env.DISCORD_BOT_TOKEN = 'test-token';
process.env.DISCORD_CLIENT_ID = 'test-client-id';
process.env.DISCORD_CLIENT_SECRET = 'test-client-secret';
process.env.BOT_PORT = '0'; // Use random available port

// Mock Discord.js to avoid actual connections during tests
jest.mock('discord.js', () => {
  const mockClient = {
    login: jest.fn().mockResolvedValue('test-token'),
    destroy: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    once: jest.fn(),
    isReady: jest.fn().mockReturnValue(false),
    user: null,
    options: {
      intents: ['Guilds', 'GuildMessages'],
    },
    listenerCount: jest.fn().mockReturnValue(0),
  };

  return {
    Client: jest.fn().mockImplementation(() => mockClient),
    GatewayIntentBits: {
      Guilds: 1,
      GuildMessages: 512,
      MessageContent: 32768,
    },
    SlashCommandBuilder: jest.fn().mockImplementation(() => ({
      setName: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      toJSON: jest.fn().mockReturnValue({}),
    })),
  };
});
