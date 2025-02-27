const { Telegraf, Scenes, session } = require('telegraf');
require('dotenv').config(); // Добавляем поддержку .env файла

// Проверяем наличие токена
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error('BOT_TOKEN не найден в переменных окружения!');
    process.exit(1);
}

const { mainMenuScene } = require('./src/views/mainMenu');
const { productScene } = require('./src/views/productView');
const { cartScene } = require('./src/views/cartView');

// Инициализируем бота напрямую с переменной окружения
const bot = new Telegraf(BOT_TOKEN);

// Middleware
bot.use(session());

// Register scenes
const stage = new Scenes.Stage([
    mainMenuScene,
    productScene,
    cartScene
]);
bot.use(stage.middleware());

// Start command
bot.command('start', (ctx) => {
    ctx.scene.enter('main-menu');
});

// Error handling
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

// Добавляем обработку ошибок при запуске
bot.launch().catch(err => {
    console.error('Ошибка при запуске бота:', err);
    process.exit(1);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Добавляем информационное сообщение при успешном запуске
console.log('Бот успешно запущен!');