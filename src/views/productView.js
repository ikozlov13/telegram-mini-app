const { Scenes, Markup } = require('telegraf');
const Product = require('../models/product');

const productScene = new Scenes.BaseScene('products');

productScene.enter(async (ctx) => {
    const category = ctx.session.currentCategory;
    const products = Product.getProductsByCategory(category);

    for (const product of products) {
        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('📷 Фото', `photos_${product.id}`),
                Markup.button.callback('🛍 Купить', `buy_${product.id}`)
            ]
        ]);

        await ctx.replyWithPhoto(
            { source: product.images[Object.keys(product.images)[0]][0] },
            {
                caption: `${product.name}\n${product.description}\nЦена: ${product.price} руб.`,
                ...keyboard
            }
        );
    }
});

// Обработка кнопок и другая логика

module.exports = { productScene };