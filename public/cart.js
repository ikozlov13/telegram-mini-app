// Инициализация Telegram WebApp
Telegram.WebApp.ready();

// Функция для отображения корзины
function displayCart() {
    const cartContainer = document.getElementById('cart-container');

    if (Telegram.WebApp && Telegram.WebApp.CloudStorage) {
        Telegram.WebApp.CloudStorage.getItem('cart', (err, data) => {
            if (err) {
                console.error('Ошибка при получении корзины:', err);
                return;
            }

            if (!data) {
                cartContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
                return;
            }

            const cart = JSON.parse(data);
            renderCart(cart);
        });
    } else {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
            return;
        }

        renderCart(cart);
    }
}

// Функция для отрисовки корзины
function renderCart(cart) {
    const cartContainer = document.getElementById('cart-container');
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
}

// Функция для удаления товара из корзины
function removeFromCart(index) {
    if (Telegram.WebApp && Telegram.WebApp.CloudStorage) {
        Telegram.WebApp.CloudStorage.getItem('cart', (err, data) => {
            if (err) {
                console.error('Ошибка при получении корзины:', err);
                return;
            }

            let cart = [];
            if (data) {
                cart = JSON.parse(data);
            }

            cart.splice(index, 1); // Удаляем товар по индексу

            Telegram.WebApp.CloudStorage.setItem('cart', JSON.stringify(cart), (err) => {
                if (err) {
                    console.error('Ошибка при сохранении корзины:', err);
                } else {
                    displayCart(); // Обновляем отображение корзины
                }
            });
        });
    } else {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1); // Удаляем товар по индексу
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart(); // Обновляем отображение корзины
    }
}

// Функция для оформления заказа
function checkout() {
    if (Telegram.WebApp && Telegram.WebApp.CloudStorage) {
        Telegram.WebApp.CloudStorage.getItem('cart', (err, data) => {
            if (err) {
                console.error('Ошибка при получении корзины:', err);
                return;
            }

            if (!data) {
                Telegram.WebApp.showAlert('Ваша корзина пуста!');
                return;
            }

            const cart = JSON.parse(data);
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            Telegram.WebApp.sendData(JSON.stringify({ cart, total }));

            Telegram.WebApp.CloudStorage.removeItem('cart', (err) => {
                if (err) {
                    console.error('Ошибка при очистке корзины:', err);
                } else {
                    Telegram.WebApp.showAlert('Заказ оформлен!');
                    displayCart(); // Обновляем отображение корзины
                }
            });
        });
    } else {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Ваша корзина пуста!');
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        alert(`Заказ оформлен! Общая сумма: ${total} руб.`);
        localStorage.removeItem('cart');
        displayCart(); // Обновляем отображение корзины
    }
}

// Привязка событий после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    // Привязка события для кнопки "На главную"
    document.getElementById('cart-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Привязка события для кнопки "Назад"
    document.getElementById('back-button').addEventListener('click', () => {
        window.history.back();
    });

    // Привязка события для кнопки "Оформить заказ"
    document.getElementById('checkout-button').addEventListener('click', checkout);

    // Загружаем корзину при открытии страницы
    displayCart();
});