/**
 * @fileoverview This file handles events
 * @module handlers/events
 */

// ==================== //

require('dotenv').config();
const { Logger } = require('../utils/logger');
const {join} = require("path");
const fs = require('fs');

const eventsLogger = new Logger('events', true);

// ==================== //

async function registerEvents(client) {

    eventsLogger.info(`Регистрация событий...`);

    const eventFiles = fs.readdirSync(join(__dirname, '..', 'events')).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(join(__dirname, '..', 'events', file));
        if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
        else client.on(event.name, (...args) => event.execute(...args, client));
        eventsLogger.info(`Зарегистрированное событие ${event.name}`);
    }

    eventsLogger.success(`Успешно зарегистрированные события`);

}

module.exports = async (client) => {
    await registerEvents(client);
}