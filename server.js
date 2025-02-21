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