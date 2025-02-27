const { Scenes, Markup } = require('telegraf');
const config = require('../config');

const mainMenuScene = new Scenes.BaseScene('main-menu');

mainMenuScene.enter(async (ctx) => {
    const keyboard = Markup.keyboard([
        [config.CATEGORIES.MENS],
        [config.CATEGORIES.WOMENS],
        [config.CATEGORIES.HOME],
        ['🛒 Корзина']
    ]).resize();

    await ctx.reply('Выберите категорию:', keyboard);
});

mainMenuScene.hears('🛒 Корзина', (ctx) => {
    ctx.scene.enter('cart');
});

Object.values(config.CATEGORIES).forEach(category => {
    mainMenuScene.hears(category, async (ctx) => {
        ctx.session.currentCategory = category;
        await ctx.scene.enter('products');
    });
});

module.exports = { mainMenuScene };