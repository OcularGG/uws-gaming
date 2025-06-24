import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Shows information about KrakenGaming'),

  async execute(interaction: CommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(0x7B2CBF)
      .setTitle('🐙 KrakenGaming')
      .setDescription('Welcome to the KrakenGaming community!')
      .addFields(
        { name: '🌐 Website', value: '[krakengaming.org](https://krakengaming.org)', inline: true },
        { name: '🤖 Bot Version', value: '1.0.0', inline: true },
        { name: '🚀 Status', value: 'Online', inline: true }
      )
      .setFooter({
        text: 'KrakenGaming Discord Bot',
        iconURL: interaction.client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  },
};
