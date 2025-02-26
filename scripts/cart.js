document.addEventListener('DOMContentLoaded', function() {
    const cartContainer = document.getElementById('cart-container');
    const checkoutButton = document.getElementById('checkout-button');
    const cartButton = document.getElementById('cart-button');
    const backButton = document.getElementById('back-button');

    // Загружаем корзину из localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Отображаем товары в корзине
    if (cart.length > 0) {
        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <h3>${item.name}</h3>
                <p>Количество: ${item.quantity}</p>
                <p>Цена: ${item.price * item.quantity} руб.</p>
                <button class="remove-item" data-id="${item.id}">Удалить</button>
            </div>
        `).join('');
    } else {
        cartContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
    }

    // Обработчик для кнопки "Оформить заказ"
    if (checkoutButton) {
        checkoutButton.onclick = () => {
            if (cart.length === 0) {
                alert('Ваша корзина пуста!');
                return;
            }
            // Отправка данных на сервер
            sendOrderToServer(cart);
        };
    }

    // Обработчик для кнопки "На главную"
    if (cartButton) {
        cartButton.onclick = () => window.location.href = 'index.html';
    }

    // Обработчик для кнопки "Назад"
    if (backButton) {
        backButton.onclick = () => window.history.back();
    }

    // Обработчик для удаления товара
    document.querySelectorAll('.remove-item').forEach(button => {
        button.onclick = function() {
            const itemId = this.getAttribute('data-id');
            removeItemFromCart(itemId);
        };
    });
});

// Функция для удаления товара из корзины
function removeItemFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.reload(); // Перезагружаем страницу
}

// Функция для отправки заказа на сервер
function sendOrderToServer(cart) {
    const tg = window.Telegram.WebApp;

    // Формируем данные заказа
    const order = {
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        userId: tg.initDataUnsafe.user?.id,
    };

    // Отправляем данные на сервер
    fetch('/webapp-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
    })
    .then(response => response.json())
    .then(result => {
        alert('Заказ успешно оформлен!');
        localStorage.removeItem('cart'); // Очищаем корзину
        window.location.href = 'index.html'; // Перенаправляем на главную
    })
    .catch(error => {
        console.error('Network error:', error);
        alert('Ошибка сети! Проверьте соединение.');
    });
}