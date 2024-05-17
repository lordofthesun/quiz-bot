/**
 * @name latencyLogger
 * @description Periodically logs the bot's latency and API latency
 */

const { Logger } = require('./logger');
const { REST, Routes } = require('discord.js');

let latencyData = { history: [] }

async function latencyLogger(client) {

    const latencyLogger = new Logger('latency', true);
    const token = process.env.DEV_MODE ? process.env.TOKEN : process.env.DEV_TOKEN;
    const rest = new REST({ version: '9' }).setToken(token);

    setInterval(async () => {
        try {
            const timeNow = Date.now();
            await rest.get(Routes.applicationCommands(client.user.id))
            const latency = Date.now() - timeNow;
            const apiLatency = Math.round(client.ws.ping) > 0 ? Math.round(client.ws.ping) : 0;

            latencyData.history.push({ time: timeNow, latency, apiLatency });

        } catch (error) {
            latencyLogger.error(`❌ Не удалось получить задержку API`);
            latencyLogger.error(error);
        }
    }, 5000);

}

module.exports = { latencyLogger }
