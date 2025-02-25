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
   console.log(`Server is running on port ${PORT}`);
});

// Подключаем Telegram Bot API
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID; // ID администратора для получения заказов
console.log("TELEGRAM_BOT_TOKEN:", token); // Выводим токен в консоль

if (!token) {
    console.error("Ошибка: TELEGRAM_BOT_TOKEN не найден");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Команда /start для бота
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Добро пожаловать в магазин одежды!", {
        reply_markup: {
            keyboard: [[{
                text: "Открыть магазин",
                web_app: { url: "https://telegram-mini-app-zog6.onrender.com" } // URL на Render
            }]],
            resize_keyboard: true
        }
    });
});

// Обработка данных от Mini App
app.post('/webapp-data', (req, res) => {
    const { chat_id, data } = req.body;
    if (chat_id && data) {
        bot.sendMessage(chat_id, "Заказ получен! Мы свяжемся с вами для подтверждения.");
    }
    res.sendStatus(200);
});

// Обработка заказов
bot.on("message", async (msg) => {
    if (msg?.web_app_data?.data) {
        try {
            const chatId = msg.chat.id;
            const data = JSON.parse(msg.web_app_data.data);
            
            // Формируем сообщение о заказе
            const orderText = `🛍 Новый заказ!\n\n` +
                `👤 Покупатель: ${msg.from.first_name} ${msg.from.last_name || ''} (@${msg.from.username || 'нет username'})\n` +
                `📅 Дата: ${new Date().toLocaleString()}\n\n` +
                `📦 Товары:\n${data.items.map(item => 
                    `- ${item.name} x${item.quantity} = ${item.price * item.quantity} руб.`
                ).join('\n')}\n\n` +
                `💰 Итого: ${data.total} руб.`;

            // Отправляем уведомление админу
            if (adminChatId) {
                await bot.sendMessage(adminChatId, orderText);
            }

            // Отправляем подтверждение покупателю
            await bot.sendMessage(chatId, 
                "✅ Ваш заказ успешно оформлен!\n\n" +
                "Мы свяжемся с вами в ближайшее время для подтверждения заказа."
            );

        } catch (error) {
            console.error('Ошибка при обработке заказа:', error);
            bot.sendMessage(chatId, 
                "❌ Произошла ошибка при оформлении заказа.\n" +
                "Пожалуйста, попробуйте позже."
            );
        }
    }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
});