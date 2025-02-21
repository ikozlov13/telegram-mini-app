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