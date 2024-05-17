const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { random_quiz_interval, random_quiz_channel, rolePing } = require('../models/guildModel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Подробная информация про Quiz!'),

    async execute(interaction) {
        const latency = Date.now() - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        let apiLatencyMsg;

        if (apiLatency < 0) apiLatencyMsg = '**Задержка:** `-` (Вычисление)';
        else apiLatencyMsg = `**API задержка:** \`${apiLatency}ms\``;

        const pingEmbed = new EmbedBuilder()
            .setTitle('Quiz!')
            .addFields(
                { name: 'Основное', value: `> **Задержка:** \`${latency}ms\`\n> ${apiLatencyMsg}\n> **Discord.js:** \`v${require('discord.js').version}\`\n> **Node.js:** \`${process.version}\``, inline: true },
                { name: 'Дополнительно', value: `> **Разработчик:** [lordofsunshine](https://discord.com/users/619036853030617099)\n> **Серверов:** \`${interaction.client.guilds.cache.size}\``, inline: true },
            )
            .setColor('#f3ae6d')
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }));

        return interaction.reply({ embeds: [pingEmbed], ephemeral: true });
    }
}
