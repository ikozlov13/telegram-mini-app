// Инициализация Telegram WebApp
Telegram.WebApp.ready();

// Функция для добавления товара в корзину
function addToCart(name, price, image, button) {
    console.log('Функция addToCart вызвана:', name, price, image);

    if (Telegram.WebApp && Telegram.WebApp.CloudStorage) {
        console.log('CloudStorage доступен');

        Telegram.WebApp.CloudStorage.getItem('cart', (err, data) => {
            if (err) {
                console.error('Ошибка при получении корзины:', err);
                return;
            }

            let cart = [];
            if (data) {
                cart = JSON.parse(data);
                console.log('Текущая корзина:', cart);
            }

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, image, quantity: 1 });
            }

            Telegram.WebApp.CloudStorage.setItem('cart', JSON.stringify(cart), (err) => {
                if (err) {
                    console.error('Ошибка при сохранении корзины:', err);
                } else {
                    console.log('Корзина успешно обновлена:', cart);
                    Telegram.WebApp.showAlert(`${name} добавлен в корзину!`);

                    // Меняем текст кнопки
                    if (button) {
                        button.textContent = 'Перейти в корзину';
                        button.onclick = () => {
                            window.location.href = 'cart.html';
                        };
                        button.style.backgroundColor = '#28a745'; // Зелёный цвет для кнопки
                    }
                }
            });
        });
    } else {
        console.error('CloudStorage недоступен');
        // Альтернативная логика (например, сохранение в localStorage)
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Корзина сохранена в localStorage:', cart);
        alert(`${name} добавлен в корзину!`);

        // Меняем текст кнопки
        if (button) {
            button.textContent = 'Перейти в корзину';
            button.onclick = () => {
                window.location.href = 'cart.html';
            };
            button.style.backgroundColor = '#28a745'; // Зелёный цвет для кнопки
        }
    }
}

// Функция для отображения корзины
function displayCart() {
    if (Telegram.WebApp && Telegram.WebApp.CloudStorage) {
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
    } else {
        const cartContainer = document.getElementById('cart-container');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
            return;
        }

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
}

// Функция для удаления товара из корзины
function removeFromCart(index) {
    if (Telegram.WebApp && Telegram.WebApp.CloudStorage) {
        Telegram.WebApp.CloudStorage.getItem('cart', (err, data) => {
            if (!data) return;

            let cart = JSON.parse(data);
            cart.splice(index, 1);

            Telegram.WebApp.CloudStorage.setItem('cart', JSON.stringify(cart), (err) => {
                if (err) {
                    console.error('Ошибка при удалении товара:', err);
                } else {
                    displayCart();
                }
            });
        });
    } else {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }
}

// Функция для оформления заказа
function checkout() {
    if (Telegram.WebApp && Telegram.WebApp.CloudStorage) {
        Telegram.WebApp.CloudStorage.getItem('cart', (err, data) => {
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
                    displayCart();
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
        displayCart();
    }
}

// Загружаем корзину при открытии страницы
window.onload = displayCart;

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
                    <p>Количество: ${