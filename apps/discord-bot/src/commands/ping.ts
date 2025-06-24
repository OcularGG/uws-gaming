import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong! and shows bot latency'),

  async execute(interaction: CommandInteraction) {
    const sent = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Roundtrip Latency', value: `${latency}ms`, inline: true },
        { name: 'WebSocket Heartbeat', value: `${apiLatency}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({
      content: '',
      embeds: [embed],
    });
  },
};
