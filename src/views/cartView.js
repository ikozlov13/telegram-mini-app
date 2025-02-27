const { Scenes, Markup } = require('telegraf');
const CartController = require('../controllers/cartController');

const cartScene = new Scenes.BaseScene('cart');

cartScene.enter(async (ctx) => {
    const cart = CartController.getCart(ctx.from.id);

    if (cart.length === 0) {
        await ctx.reply('🛒 Ваша корзина пуста.');
        return ctx.scene.leave();
    }

    for (const item of cart) {
        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('➖', `decrease_${item.product.id}`),
                Markup.button.callback('➕', `increase_${item.product.id}`),
                Markup.button.callback('❌ Удалить', `remove_${item.product.id}`)
            ]
        ]);

        await ctx.replyWithPhoto(
            { source: item.product.images[Object.keys(item.product.images)[0]][0] },
            {
                caption: `${item.product.name}\nКоличество: ${item.quantity}\nЦена: ${item.product.price * item.quantity} руб.`,
                ...keyboard
            }
        );
    }

    await ctx.reply('Выберите действие или нажмите "Оформить заказ".', Markup.keyboard([
        ['Оформить заказ', 'Назад']
    ]).resize());
});

cartScene.hears('Назад', (ctx) => {
    ctx.scene.enter('main-menu');
});

cartScene.hears('Оформить заказ', (ctx) => {
    ctx.scene.enter('order');
});

cartScene.action(/decrease_(.+)/, async (ctx) => {
    const productId = ctx.match[1];
    CartController.decreaseQuantity(ctx.from.id, productId);
    await ctx.reply('Количество товара уменьшено.');
    ctx.scene.reenter();
});

cartScene.action(/increase_(.+)/, async (ctx) => {
    const productId = ctx.match[1];
    CartController.increaseQuantity(ctx.from.id, productId);
    await ctx.reply('Количество товара увеличено.');
    ctx.scene.reenter();
});

cartScene.action(/remove_(.+)/, async (ctx) => {
    const productId = ctx.match[1];
    CartController.removeFromCart(ctx.from.id, productId);
    await ctx.reply('Товар удален из корзины.');
    ctx.scene.reenter();
});

module.exports = { cartScene };