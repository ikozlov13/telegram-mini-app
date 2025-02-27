require('dotenv').config();

module.exports = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    WEBHOOK_URL: process.env.WEBHOOK_URL,
    ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID,
    CATEGORIES: {
        MENS: 'Мужская одежда',
        WOMENS: 'Женская одежда',
        HOME: 'Домашний текстиль'
    }
};