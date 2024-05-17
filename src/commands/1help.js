const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getHelp } = require('../main');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Все мои команды или получите информацию о конкретной команде.')
        .addStringOption(option =>
            option.setName('команда')
                .setDescription('Команда для получения информации о')
                .setRequired(false)
                .setAutocomplete(true)),

    async autocomplete(interaction, client) {

        const focusedValue = interaction.options.getFocused();
        const { commands } = client;

        const commandNames = Array.from(commands.keys()).filter(name => name)
        const filteredCommands = commandNames.filter(name => name.includes(focusedValue));
        await interaction.respond(filteredCommands.map(commandName => ({ name: commandName, value: commandName })));

    },

    async execute(interaction, client) {
        await getHelp(client, interaction, interaction.options.getString('команда'));
    }
}
