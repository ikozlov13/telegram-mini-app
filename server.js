const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Разрешаем доступ из Telegram Mini App
app.use(express.static('public')); // Открываем папку public

// Главная страница (отдаёт index.html)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Запускаем сервер на порту 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

const TelegramBot = require('node-telegram-bot-api');
const token = '8040346486:AAFHLxeHFlzmFFs0nNPr2JVbmgsk9XgotJo';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "Нажмите кнопку ниже, чтобы открыть Mini App", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Открыть Mini App", web_app: { url: "https://telegram-mini-app.onrender.com" } }]
            ]
        }
    });
});