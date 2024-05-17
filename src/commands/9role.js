const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../models/guildModel')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Установите роль для авто-викторины, чтобы бот упоминал её при авто-викторине').addRoleOption(opt => opt.setName("роль").setDescription("Выберите роль")),

    async execute(interaction) {
        const perms = new PermissionsBitField(interaction.memberPermissions)
        if (!perms.toArray().includes("Administrator")) return interaction.reply({ content: "❌ Нет доступа. Вам нужны права **Администратора**." })
        const data = await Guild.findOne({ guild_id: interaction.guild.id })
        if (!data.random_quiz_interval) return interaction.reply({ content: "❌ Система авто-викторин не работает на вашем сервере." })
        let role = interaction.options.getRole('роль')

              if (!role) {
                  interaction.reply({ content: "✅ Роль удалена." })
                  data.rolePing = undefined
                  data.save()

              } else {
                  interaction.reply({ content: "✅ Роль установлена." })
                  data.rolePing = role.id
                  data.save()
              }
          }
      }