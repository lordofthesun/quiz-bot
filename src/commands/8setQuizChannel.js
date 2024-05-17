const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { getGuild } = require('../utils/quizUtils.js');
const { scheduleRandomQuizzes } = require('../main.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName(`auto-quiz`)
        .setDescription(`Установите отправление викторины раз в X времени`)
        .addChannelOption(option => option
            .setName('канал')
            .setDescription('Установите канал для отправки викторины')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('интервал')
            .setDescription('Интервал для случайной викторины в минутах. Оставьте пустым, чтобы отключить')
            .setRequired(false)
        ),

    async execute(interaction) {

        const guild = await getGuild(interaction.guildId);

        const channel = interaction.options.getChannel('канал');
        const interval = interaction.options.getInteger('интервал');
        const perms = new PermissionsBitField(interaction.memberPermissions)
        if (!perms.toArray().includes("Administrator")) return interaction.reply({ content: "❌ Нет доступа. Вам нужны права **Администратора**." })
        if (interval <= 0 || interval === null) {
            guild.random_quiz_channel = null;
            guild.random_quiz_interval = null;
            await guild.save();
            await scheduleRandomQuizzes();

            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`✅ Авто-отправка выключена`)
                        .setDescription(`Вопросы больше не будут отправляться автоматически в указанный Вами канал.`)
                ], ephemeral: true
            });
        } else if (interval < 30) {
            return await interaction.reply({ content: `⚠️ Интервал должен составлять не менее 30 минут!`, ephemeral: true });
        } else {

            // Check if the channel is a text channel
            if (channel.type !== 0) return await interaction.reply({ content: `⚠️ Канал должен быть текстовым!`, ephemeral: true });

            try {
                // Check if the bot can send messages in the channel
                const message = await channel.send({ content: `⚠️ Это тестовое сообщение, чтобы проверить, может ли бот отправлять сообщения в этом канале.` });
                await message.delete();
            } catch (error) {
                // If not, return an error
                return await interaction.reply({ content: `⚠️ Бот не может отправлять сообщения в этом канале! **Проверьте права доступа к каналу для бота.**`, ephemeral: true });
            }

            guild.random_quiz_channel = channel.id;
            guild.random_quiz_interval = interval;
            await guild.save();
            await scheduleRandomQuizzes();

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`✅ Установлен канал викторины!`)
                        .setDescription(`Канал с викторинами был настроен на <#${channel.id}>, а интервал был установлен на ${interval} минут.`)
                ], ephemeral: true
            });

        }
    }
}