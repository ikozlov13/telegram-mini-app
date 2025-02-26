// require('dotenv').config(); // Удалено, так как переменные окружения уже установлены на Render
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Включаем сжатие GZIP
app.use(compression());

// Настройка CORS
app.use(cors());

// Улучшенное кэширование статических файлов
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // Особые правила для изображений
        if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.webp')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 год
        }
    }
}));

app.use(express.json()); // Поддержка JSON-запросов

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запускаем сервер
const port = process.env.PORT || 3000;
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', port);

if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN не найден!');
    process.exit(1);
}

console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN);

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

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
    res.setHeader('Access-Control-Allow-Origin', '*');
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
            if (process.env.ADMIN_CHAT_ID) {
                await bot.sendMessage(process.env.ADMIN_CHAT_ID, orderText);
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