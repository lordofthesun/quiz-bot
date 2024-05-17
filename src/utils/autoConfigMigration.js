// Automatically migrates values in .env to config.json

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const {Logger} = require('./logger');
const migrationLogger = new Logger('Migration');
migrationLogger.separator();

// Create config.json from config.example.json if it doesn't exist
async function configExists() {
    const configPath = path.join(__dirname, '../../config.json');
    const configExamplePath = path.join(__dirname, '../../config.example.json');

    if (!fs.existsSync(configPath)) {
        migrationLogger.warn('config.json не существует, создаю из config.example.json');
        fs.copyFileSync(configExamplePath, configPath);
    } else {
        migrationLogger.success('config.json существует')
    }
}


// Migrate values from .env to config.json
async function main() {

    // Keys to migrate
    // CLIENT_ID -> bot.botId, DEV_CLIENT_ID -> bot.devBotId
    // BOT_NAME      ➜ bot.name
    // BOT_INVITE    ➜ links.invite
    // BOT_SUPPORT   ➜ links.support

    await configExists();
    migrationLogger.info('Перенос значений из .env в config.json');

    const configPath = path.join(__dirname, '../../config.json');
    const config = require(configPath);

    const envVars = Object.keys(process.env);

    // Migrate values
    for (const envVar of envVars) {
        if (envVar === 'CLIENT_ID') {
            config.bot.botId = process.env.CLIENT_ID;
            migrationLogger.success(`Перенес CLIENT_ID в config.json`);
        } else if (envVar === 'DEV_CLIENT_ID') {
            config.bot.devBotId = process.env.DEV_CLIENT_ID;
            migrationLogger.success(`Перенес DEV_CLIENT_ID в config.json`);
        } else if (envVar === 'BOT_NAME') {
            config.bot.name = process.env.BOT_NAME;
            migrationLogger.success(`Перенесено ИМЯ БОТА в config.json`);
        } else if (envVar === 'BOT_INVITE') {
            config.links.invite = process.env.BOT_INVITE;
            migrationLogger.success(`Перенес BOT_INVITE в config.json`);
        } else if (envVar === 'BOT_SUPPORT') {
            config.links.support = process.env.BOT_SUPPORT;
            migrationLogger.success(`Перенес BOT_SUPPORT в config.json`);
        }
    }

    // Show the user the new config.json
    migrationLogger.separator();
    migrationLogger.info('Новый config.json:');

    // Create a file, 'newConfig.json', with the new config.json
    const newConfigPath = path.join(__dirname, '../../newConfig.json');
    fs.writeFileSync(newConfigPath, JSON.stringify(config, null, 2));
    const newConfig = require(newConfigPath);

    // Log the new config.json contents to console line by line
    const lines = JSON.stringify(newConfig, null, 2).split('\n');
    for (const line of lines) migrationLogger.info(line);

    // Ask the user if they want to overwrite their current config.json with the new one
    migrationLogger.separator();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Хотели бы вы перезаписать свой текущий файл config.json новым? (y/N) ', (answer) => {
        // Default to no
        if (answer.toLowerCase() === 'y') {
            migrationLogger.success('Перезапись config.json и удаление нового Config.json');
            fs.copyFileSync(newConfigPath, configPath);
            fs.unlinkSync(newConfigPath);
            migrationLogger.success('Успешно');
        } else {
            migrationLogger.warn('Ваш файл config.json не был перезаписан');
            migrationLogger.warn('Проверьте новый файл Config.json на наличие предлагаемых изменений');
        }


        rl.close();
        migrationLogger.separator();
        migrationLogger.info('Миграция завершена!');

    });


}

main();