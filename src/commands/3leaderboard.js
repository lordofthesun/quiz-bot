const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const userSchema = require('../models/userModel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Просмотр таблицы лидеров')
        .addIntegerOption(option => option
            .setName('страница')
            .setDescription('Страница таблицы лидеров для просмотра')
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName('сортировка')
            .setDescription('Способ сортировки таблицы лидеров')
            .setRequired(false)
            .addChoices(
                {"name": "Очков", "value": "points"},
                {"name": "Соотношение выигрышей", "value": "ratio"}
            )),


    async execute(interaction) {

        const page = interaction.options.getInteger('страница') || 1;
        const sort = interaction.options.getString('сортировка') || 'points';
        let leaderboard;

        if (sort === 'points') {
            leaderboard = await userSchema.find({}).sort({points: -1});
        }

        // For the ratio, we need to loop through all users and calculate the ratio
        if (sort === 'ratio') {
            leaderboard = await userSchema.find({});
            leaderboard = leaderboard.map(user => {
                const ratio = user.correct_answers.length / user.incorrect_answers.length;
                return {user_id: user.user_id, points: ratio};
            });
            leaderboard.sort((a, b) => b.points - a.points);
        }


        let embed = new EmbedBuilder()
            .setTitle(`Таблица лидеров`)
            .setColor('#f3ae6d')
            .setFooter({text: `Страница ${page} из ${Math.round(leaderboard.length / 10)+1}`})
            .setThumbnail(interaction.client.user.displayAvatarURL({dynamic: true}))


        // Check if leaderboard is empty & exists
        if (leaderboard.length === 0) return interaction.reply({content: '⚠️ Таблица лидеров пуста!', ephemeral: true});
        if(Math.round((leaderboard.length / 10) + 1) < page) return interaction.reply({content: "❌ Такой страницы не существует", ephemeral: true}) //sssss

        if (sort === 'points') {
            embed.setDescription(
                leaderboard.slice((page - 1) * 10, page * 10).map((user, index) => {
                    return `**${index + 1 + (page - 1) * 10}.** <@${user.user_id}> - ${user.points} очков`.replace(NaN, "0").replace(Infinity, "0").replace('NaN', "0").replace('Infinity', "0")
                }).join('\n')
            )
        } else if (sort === 'ratio') {
            embed.setDescription(
                leaderboard.slice((page - 1) * 10, page * 10).map((user, index) => {
                    return `**${index + 1 + (page - 1) * 10}.** <@${user.user_id}> - ${user.points.toFixed(2)} соотношение`.replace(NaN, "0").replace(Infinity, "0").replace('NaN', "0").replace('Infinity', "0")
                }).join('\n')
            )
        }


        await interaction.reply({embeds: [embed],  ephemeral: true});

    
       

    }

}