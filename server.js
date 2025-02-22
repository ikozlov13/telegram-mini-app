require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Поддержка JSON-запросов

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запускаем сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(Buffer.from("Server is running on port" + PORT, "utf-8").toString());
});

// Подключаем Telegram Bot API
const token = process.env.TELEGRAM_BOT_TOKEN;
console.log("TELEGRAM_BOT_TOKEN:", token); // Выводим токен в консоль

if (!token) {
    console.error("Ошибка: TELEGRAM_BOT_TOKEN не найден. Укажите его в файле .env");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Команда /start для бота
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

// Обработка данных от Mini App
app.post('/webapp-data', (req, res) => {
    const { chat_id, data } = req.body;

    if (chat_id && data === "start_pressed") {
        bot.sendMessage(chat_id, "Вы нажали кнопку Старт в Mini App!");
    }

    res.sendStatus(200);
});

// Дополнительная обработка сообщений
bot.on("message", (msg) => {
    if (msg?.web_app_data?.data) {
        const chatId = msg.chat.id;
        const data = msg.web_app_data.data;

        if (data === "start_pressed") {
            bot.sendMessage(chatId, "Вы нажали кнопку Старт в Mini App!");
        }
    }
});