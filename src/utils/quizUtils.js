const { trivia_categories } = require('../misc.js');
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder } = require("discord.js");
const userSchema = require('../models/userModel.js');
const guildModel = require('../models/guildModel.js');
const { logger } = require('./logger');
const translate = require("@iamtraction/google-translate")
const wait = require('node:timers/promises').setTimeout;

async function getGuild(guildId) {

    let guild;
    try {
        guild = await guildModel.findOne({ guild_id: guildId });
        if (!guild) guild = await guildModel.create({ guild_id: guildId });
    } catch (err) {
        logger.error(`❌ Не удалось попасть в гильдию`);
        logger.error(err.stack)
        return null;
    }

    return guild;

}

async function getUser(userId) {
    let user;
    try {
        user = await userSchema.findOne({ user_id: userId });
        if (!user) user = await userSchema.create({ user_id: userId });
    } catch (err) {
        logger.error(`❌ Не удалось получить пользователя`);
        logger.error(err.stack)
        return null;
    }

    return user;

}


async function fetchRandomQuestion(category, difficulty) {
    let url = `https://opentdb.com/api.php?amount=1&encode=url3986`;

    if (category) {
        const selectedCategory = trivia_categories.find(cat => cat.id.toString() === category);
        if (!selectedCategory) throw new Error('❌ Недопустимая категория');
        url += `&category=${category}`;
    }

    if (difficulty) url += `&difficulty=${difficulty}`;

    url = encodeURI(url);

    const response = await fetch(url);
    let data = await response.json();

    // Decode the question and answers


    if(!data.results || data.results.length < 1) return null
    data.results[0].question = decodeURIComponent(data.results[0].question);
    data.results[0].correct_answer = decodeURIComponent(data.results[0].correct_answer)
    data.results[0].incorrect_answers = data.results[0].incorrect_answers.map((answer) => decodeURIComponent(answer));;
    data.results[0].category = decodeURIComponent(data.results[0].category);

    return data.results[0];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;

}

function createAnswerButtons(allAnswers, correctAnswer, reveal = false) {
    const answerButtons = new ActionRowBuilder();

    allAnswers.forEach(async (answer) => {

        answerButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(answer)
                .setLabel(answer)
                .setStyle(reveal ? (answer === correctAnswer ? ButtonStyle.Success : ButtonStyle.Danger) : ButtonStyle.Primary)
                .setDisabled(reveal)
        );
    });
    return answerButtons;
}

function collectAnswers(interaction, correctAnswer, incorrectAnswers, message) {
    const userAnswers = [];

    const filter = (i) => {
        return i.customId === correctAnswer || incorrectAnswers.includes(i.customId);
    };

    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 20000,
    });

    collector.on('collect', async (i) => {
        if (userAnswers.some((answer) => answer.userId === i.user.id)) return i.reply({ content: '❌ Вы уже ответили на этот вопрос, ожидайте результатов!', ephemeral: true });
        userAnswers.push({ userId: i.user.id, answer: i.customId });
        await i.reply({ content: `✅ Вы ответили **${i.customId}**! Ожидайте итогов.`, ephemeral: true });
    });

    return new Promise((resolve) => {
        collector.on('end', async () => {
            resolve(userAnswers);

            // Edit the interaction button row
            const answerButtons = createAnswerButtons([...incorrectAnswers, correctAnswer], correctAnswer, true);
            await wait(3000)
            if (message) await message.edit({ components: [answerButtons] });
            else await interaction.editReply({ components: [answerButtons] });
        });
    });
}

async function awardPoints(difficulty, userId, multiplier = 1) {
    let points; difficulty = difficulty.toLowerCase();

    if (difficulty === 'easy') points = 1;
    else if (difficulty === 'medium') points = 3;
    else if (difficulty === 'hard') points = 5;
    else points = 0;

    points *= multiplier;

    const user = await getUser(userId);
    user.points += points;
    await user.save();

    return points;

}

module.exports = { fetchRandomQuestion, shuffleArray, createAnswerButtons, collectAnswers, awardPoints, getUser, getGuild };