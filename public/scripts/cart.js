document.addEventListener('DOMContentLoaded', function() {
    const cartContainer = document.getElementById('cart-container');
    const checkoutButton = document.getElementById('checkout-button');
    const cartButton = document.getElementById('cart-button');
    const backButton = document.getElementById('back-button');

    // Загружаем корзину из localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Отображаем товары в корзине
    if (cart.length > 0) {
        cartContainer.innerHTML = ''; // Очищаем контейнер
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            
            const h3 = document.createElement('h3');
            h3.textContent = item.name;
            
            const quantityP = document.createElement('p');
            quantityP.textContent = `Количество: ${item.quantity}`;
            
            const priceP = document.createElement('p');
            priceP.textContent = `Цена: ${item.price * item.quantity} руб.`;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-item';
            removeBtn.dataset.id = item.id;
            removeBtn.textContent = 'Удалить';
            
            itemDiv.append(h3, quantityP, priceP, removeBtn);
            cartContainer.appendChild(itemDiv);
        });
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
        button.addEventListener('click', function() {
            const itemId = this.dataset.id;
            removeItemFromCart(itemId);
            this.closest('.cart-item').remove(); // Удаляем элемент без перезагрузки
        });
    });
});

// Функция для удаления товара из корзины
function removeItemFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter(); // Добавляем обновление счетчика
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