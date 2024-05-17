const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, ComponentBuilder, TextInputBuilder, PermissionsBitField } = require('discord.js');
const guildModel = require('../models/guildModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auction')
        .setDescription('Аукцион сервера'),

    async execute(interaction) {


      let data = await guildModel.findOne({ guild_id: interaction.guild.id });
      if(!data) data = await guildModel.create({ guild_id: interaction.guild.id });
      let mapp = null
      if (data.auction.list.length > 0) {
          mapp = data.auction.list.map((x, i) => {
              return `- #${i + 1} <@&${x.role}> - ${x.price} очков ${x.description ? `\n— ${x.description}` : ` `}`
          })
      }
      let emb = new EmbedBuilder().setColor("#f3ae6d").setDescription(`${mapp ? `${mapp.join("\n")}` : `Тут пока пусто...`}`).setTitle("Аукцион сервера")
      let btn1 = new ButtonBuilder().setCustomId('buy').setLabel('Купить').setStyle("Secondary")
      let btn2 = new ButtonBuilder().setCustomId('add').setLabel('Добавить товар').setStyle("Secondary")
      let btn3 = new ButtonBuilder().setCustomId('delete').setLabel('Удалить товар').setStyle("Secondary")
      let ll = new ActionRowBuilder().addComponents(btn2)
      if (mapp) ll = new ActionRowBuilder().addComponents(btn1, btn2, btn3)
      interaction.reply({ embeds: [emb], components: [ll] }).then(async msg => {
          let collector = msg.createMessageComponentCollector((b) => b, { componentType: 'BUTTON' })


          collector.on('collect', async b => {
              if (b.customId === 'buy') { //модалка
                  const modal = new ModalBuilder()
                      .setCustomId("buyAuction")
                      .setTitle("Приобрести предмет в магазине")
                      .addComponents(
                          new ActionRowBuilder({
                              components: [
                                  new TextInputBuilder()
                                      .setCustomId("roleNum")
                                      .setLabel("Номер роли")
                                      .setPlaceholder("Номер слева от роли (без #)")
                                      .setStyle("Paragraph")
                                      .setMaxLength(2)
                                      .setMinLength(1)
                                      .setRequired(true)
                              ]
                          })
                      )
                  return b.showModal(modal)
              } else if (b.customId === 'add') { //модалка
                  console.log(b.user.id, b.guild.members.cache.get(b.user.id).permissions.has(PermissionsBitField.Flags.Administrator), b.user.id !== b.guild.ownerId)
                  if (b.user.id === b.guild.ownerId || b.guild.members.cache.get(b.user.id).permissions.has(PermissionsBitField.Flags.Administrator)) {
                      const modal = new ModalBuilder()
                          .setCustomId("setAuction")
                          .setTitle("Выставить роль на аукцион")
                          .addComponents(
                              new ActionRowBuilder({
                                  components: [
                                      new TextInputBuilder()
                                          .setCustomId("id")
                                          .setLabel("ID роли")
                                          .setPlaceholder("1011549124501442661")
                                          .setStyle("Paragraph")
                                          .setMaxLength(19)
                                          .setMinLength(1)
                                          .setRequired(true)
                                  ]
                              }),
                              new ActionRowBuilder({
                                  components: [
                                      new TextInputBuilder()
                                          .setCustomId("price")
                                          .setLabel("Цена")
                                          .setPlaceholder("100")
                                          .setStyle("Paragraph")
                                          .setMaxLength(10)
                                          .setMinLength(1)
                                          .setRequired(true),
                                  ]
                              }),
                              new ActionRowBuilder({
                                  components: [
                                      new TextInputBuilder()
                                          .setCustomId("desc")
                                          .setLabel("Краткое описание")
                                          .setPlaceholder("Супер-пупер крутая роль")
                                          .setStyle("Paragraph")
                                          .setMaxLength(30)
                                          .setMinLength(1)
                                          .setRequired(false)
                                  ]
                              })
                          )
                      return b.showModal(modal)
                  }else return b.reply({ content: "❌ Вы не можете использовать данную функцию.", ephemeral: true })
              }else if(b.customId === "delete"){
                  if (b.user.id === b.guild.ownerId || b.guild.members.cache.get(b.user.id).permissions.has(PermissionsBitField.Flags.Administrator)) {
                  const modal = new ModalBuilder()
                      .setCustomId("deleteAuction")
                      .setTitle("Удалить предмет в магазине")
                      .addComponents(
                          new ActionRowBuilder({
                              components: [
                                  new TextInputBuilder()
                                      .setCustomId("roleNum")
                                      .setLabel("Номер роли")
                                      .setPlaceholder("Номер слева от роли (без #)")
                                      .setStyle("Paragraph")
                                      .setMaxLength(2)
                                      .setMinLength(1)
                                      .setRequired(true)
                              ]
                          })
                      )
                  return b.showModal(modal)
              }else return b.reply({ content: "❌ Вы не можете использовать данную функцию.", ephemeral: true })
          }
          })
      })
    }
}
