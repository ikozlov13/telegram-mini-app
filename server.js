require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // ��������� ��������� JSON-��������

// ������� ��������
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ��������� ������
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`������ ������� �� ����� ${PORT}`);
});

// ���������� Telegram Bot API
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error("������: TELEGRAM_BOT_TOKEN �� ������. ������� ��� � ����� .env");
    process.exit(1);
}
const bot = new TelegramBot(token, { polling: true });

// ������� /start ��� ����
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

// ��������� ������ �� Mini App
app.post('/webapp-data', (req, res) => {
    const { chat_id, data } = req.body;

    if (chat_id && data === "start_pressed") {
        bot.sendMessage(chat_id, "�� ������ ������ ����� � Mini App!");
    }

    res.sendStatus(200);
});

bot.on("message", (msg) => {
    if (msg?.web_app_data?.data) {
        const chatId = msg.chat.id;
        const data = msg.web_app_data.data;

        if (data === "start_pressed") {
            bot.sendMessage(chatId, "�� ������ ������ ����� � Mini App!");
        }
    }
});