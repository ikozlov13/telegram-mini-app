const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // ��������� ������ �� Telegram Mini App
app.use(express.static('public')); // ��������� ����� public

// ������� �������� (����� index.html)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ��������� ������ �� ����� 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`������ ������� �� ����� ${PORT}`);
});

const TelegramBot = require('node-telegram-bot-api');
const token = '8040346486:AAFHLxeHFlzmFFs0nNPr2JVbmgsk9XgotJo';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "������� ������ ����, ����� ������� Mini App", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "������� Mini App", web_app: { url: "https://telegram-mini-app.onrender.com" } }]
            ]
        }
    });
});