const { Telegraf, Scenes, session } = require('telegraf');
const config = require('./src/config');
const { mainMenuScene } = require('./src/views/mainMenu');
const { productScene } = require('./src/views/productView');
const { cartScene } = require('./src/views/cartView');

const bot = new Telegraf(config.BOT_TOKEN);

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

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));