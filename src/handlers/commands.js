/**
 * @fileoverview This file handles the registration and execution of slash commands.
 * @module handlers/commands
 */

// ==================== //

require('dotenv').config();
const { Logger } = require('../utils/logger');
const { REST, Routes } = require('discord.js');
const { join } = require("path");
const fs = require('fs');
const { getUser, getGuild } = require('../utils/quizUtils');

const commandsLogger = new Logger('cmds', true);
const token = process.env.DEV_MODE ? process.env.TOKEN : process.env.DEV_TOKEN;
const rest = new REST({ version: '9' }).setToken(token);

// ==================== //

/**
 * @name Registers slash commands for a Discord client.
 * @param {Object} client - The Discord client object.
 * @param {Array} commands - An array of commands to register.
 */

async function registerCommands(client, commands) {

    commandsLogger.info(`Регистрация команд с косой чертой...`);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        )

        commandsLogger.success(`Успешно зарегистрированные косые команды`);

    } catch (error) {
        commandsLogger.error(`Не удалось зарегистрировать команды косой черты`);
        commandsLogger.error(error);
    }
}

// ==================== //

module.exports = async (client) => {

    // Load commands
    const commands = [];
    const commandFiles = fs.readdirSync(join(__dirname, '..', 'commands')).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(join(__dirname, '..', 'commands', file));
        await client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    // Load buttons
    const buttons = [];
    // const buttonFiles = fs.readdirSync(join(__dirname, '..', 'buttons')).filter(file => file.endsWith('.js'));
    // for (const file of buttonFiles) {
    //     const button = require(join(__dirname, '..', 'buttons', file));
    //     buttons.push(button.data.toJSON());
    // }

    // Register commands and buttons
    await registerCommands(client, commands);
    // await registerCommands(client, buttons);

    // Log registered commands and buttons
    commandsLogger.separator();
    commandsLogger.info(`Зарегистрировано ${commands.length} слешей`);
    commandsLogger.info(`Зарегистрировано ${buttons.length} кнопок`);
    commandsLogger.separator();

    client.on('interactionCreate', async interaction => {
        if (interaction.isCommand() || interaction.isAutocomplete()) {



            const command = client.commands.get(interaction.commandName);
            if (!command) {
                commandsLogger.error(`❌ Команда ${interaction.commandName} не существует. Сообщите о проблеме в **[поддержку бота](https://discord.gg/losteam)**.`);
                return;
            }

            if (interaction.isCommand()) {
                try {
                    await command.execute(interaction, client);
                } catch (error) {
                    commandsLogger.error(error.stack)
                    await interaction.reply({ content: '❌ При выполнении этой команды произошла ошибка! Сообщите о проблеме в **[поддержку бота](https://discord.gg/losteam)**.', ephemeral: true });
                }
            } else if (interaction.isAutocomplete()) {
                try {
                    await command.autocomplete(interaction, client);
                } catch (error) {
                    commandsLogger.error(error.stack)
                }
            }
        } else {

            if (interaction.customId === "buyAuction") {
                let p = interaction.fields.getTextInputValue("roleNum")
                let u = await getUser(interaction.user.id)
                let pp = await getGuild(interaction.guild.id)
                let rr = pp.auction.list[p - 1]
                if (!rr) return interaction.reply({ content: "❌ Такого номера роли не существует.", ephemeral: true }).catch(e=>interaction.followUp({ content: "❌ У Вас недостаточно очков.", ephemeral: true }))
                if (u.points < rr.price) return interaction.reply({ content: "❌ У Вас недостаточно очков.", ephemeral: true }).catch(e=>interaction.followUp({ content: "❌ У Вас недостаточно очков.", ephemeral: true }))
                u.points = u.points - rr.price
                u.save()
                let us = interaction.guild.members.cache.get(interaction.user.id)
                us.roles.add(pp.auction.list[p - 1].role).then(x =>
                    interaction.reply({ content: "✅ Вы успешно приобрели роль.", ephemeral: true })
                        .catch(a => interaction.followUp({ content: "✅ Вы успешно приобрели роль.", ephemeral: true })
                        )).catch(err =>
                            interaction.reply({ content: "❌ Ошибка при выдаче роли. **Не хватает прав или роль находится выше роли бота.**" }).catch(err=>
                                interaction.followUp({ content: "❌ Ошибка при выдаче роли. **Не хватает прав или роль находится выше роли бота.**" }))
                        )

            } else if (interaction.customId === "setAuction") {
                let id = interaction.fields.getTextInputValue("id")
                let price = interaction.fields.getTextInputValue("price")
                let desc = interaction.fields.getTextInputValue("desc") || null

                let u = await getUser(interaction.user.id)
                let pp = await getGuild(interaction.guild.id)
                let rCheck = interaction.guild.roles.cache.get(id) || await interaction.guild.roles.fetch(id).catch(err => null)
                if (!rCheck) return interaction.reply({ content: "❌ Эта роль отсутствует на сервере.", ephemeral: true }).catch(err => interaction.followUp({ content: "❌ Эта роль отсутствует на сервере.", ephemeral: true }))

                pp.auction.list.push({ role: id, price: price, description: desc })
                pp.save()
                interaction.reply({ content: "✅ Товар успешно добавлен.", ephemeral: true }).catch(err => interaction.followUp({ content: "✅ Товар успешно добавлен.", ephemeral: true }))
            } else if (interaction.customId === "deleteAuction") {
                let p = interaction.fields.getTextInputValue("roleNum")
                let pp = await getGuild(interaction.guild.id)
                let rr = pp.auction.list[p - 1]
                if (!rr) return interaction.reply({ content: "❌ Такого номера роли не существует.", ephemeral: true })
                interaction.reply({ content: "✅ Вы успешно удалили товар.", ephemeral: true })
                pp.auction.list.splice(p - 1, 1)
                pp.save()
                console.log('deleted', rr)
            }
        }
    });
}