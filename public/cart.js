// Инициализация Telegram WebApp
Telegram.WebApp.ready();

// Функция для добавления товара в корзину
function addToCart(name, price, image) {
    Telegram.WebApp.CloudStorage.getItem('cart', (err, data) => {
        let cart = [];
        if (data) {
            cart = JSON.parse(data);
        }

        // Проверяем, есть ли товар уже в корзине
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1; // Увеличиваем количество, если товар уже есть
        } else {
            // Добавляем новый товар в корзину
            cart.push({ name, price, image, quantity: 1 });
        }

        // Сохраняем обновленную корзину в CloudStorage
        Telegram.WebApp.CloudStorage.setItem('cart', JSON.stringify(cart), (err) => {
            if (err) {
                console.error('Ошибка при сохранении корзины:', err);
            } else {
                Telegram.WebApp.showAlert(`${name} добавлен в корзину!`);
            }
        });
    });
}

// Функция для отображения корзины
function displayCart() {
    Telegram.WebApp.CloudStorage.getItem('cart', (err, data) => {
        const cartContainer = document.getElementById('cart-container');
        if (!data) {
            cartContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
            return;
        }

        const cart = JSON.parse(data);
        let total = 0;
        let cartHTML = '';

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            cartHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Цена: ${item.price} руб.</p>
                        <p>Количество: ${item.quantity}</p>
                        <button onclick="removeFromCart(${index})">Удалить</button>
                    </div>
                </div>
            `;
        });

        cartHTML += `<h3>Общая сумма: ${total} руб.</h3>`;
        cartContainer.innerHTML = cartHTML;
    });
}

// Функция для удаления товара из корзины
function removeFromCart(index) {
    Telegram.WebApp.CloudStorage.getItem('cart', (err, data) => {
        if (!data) return;

        let cart = JSON.parse(data);
        cart.splice(index, 1); // Удаляем товар по индексу

        // Сохраняем обновленную корзину
        Telegram.WebApp.CloudStorage.setItem('cart', JSON.stringify(cart), (err) => {
            if (err) {
                console.error('Ошибка при удалении товара:', err);
            } else {
                displayCart(); // Обновляем отображение корзины
            }
        });
    });
}

// Загружаем корзину при открытии страницы
window.onload = displayCart;