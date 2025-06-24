import { Events } from 'discord.js';
import { logger } from '../utils/logger';

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild: any) {
    logger.info(`Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);

    // Log guild information
    logger.debug('Guild details:', {
      name: guild.name,
      id: guild.id,
      memberCount: guild.memberCount,
      ownerId: guild.ownerId,
      region: guild.region,
    });
  },
};
