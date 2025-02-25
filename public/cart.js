// Инициализация Telegram WebApp
Telegram.WebApp.ready();

// Функция для отображения корзины
function displayCart() {
    const cartContainer = document.getElementById('cart-container');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
        return;
    }

    renderCart(cart);
}

// Функция для отрисовки корзины
function renderCart(cart) {
    const cartContainer = document.getElementById('cart-container');
    let total = 0;
    let cartHTML = '';

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        cartHTML += `
            <div class="cart-item" data-index="${index}" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Цена: ${item.price} руб.</p>
                    <div class="quantity-controls">
                        <button class="quantity-minus">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-plus">+</button>
                    </div>
                    <button class="remove-button">Удалить</button>
                </div>
            </div>
        `;
    });

    cartHTML += `<h3>Общая сумма: ${total} руб.</h3>`;
    cartContainer.innerHTML = cartHTML;

    // Добавляем обработчики событий после рендеринга
    addCartEventListeners();
}

// Добавляем новую функцию для установки обработчиков событий
function addCartEventListeners() {
    const cartItems = document.querySelectorAll('.cart-item');
    
    cartItems.forEach(item => {
        const index = parseInt(item.dataset.index);
        const productId = item.dataset.productId;
        
        // Обработчик для кнопки удаления
        const removeBtn = item.querySelector('.remove-button');
        removeBtn.addEventListener('click', () => removeFromCart(productId));
        
        // Обработчики для кнопок +/-
        const minusBtn = item.querySelector('.quantity-minus');
        const plusBtn = item.querySelector('.quantity-plus');
        
        minusBtn.addEventListener('click', () => changeQuantity(index, -1));
        plusBtn.addEventListener('click', () => changeQuantity(index, 1));
    });
}

// Функция для изменения количества товара
function changeQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart[index]) {
        const newQuantity = cart[index].quantity + delta;
        
        if (newQuantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = newQuantity;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }
}

// Функция для удаления товара из корзины
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// Функция для оформления заказа
function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        alert('Ваша корзина пуста!');
        return;
    }

    // Формируем текст заказа
    const orderDetails = cart.map(item => 
        `${item.name} x${item.quantity} - ${item.price * item.quantity} руб.`
    ).join('\n');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const finalOrder = {
        items: cart,
        total: total,
        timestamp: new Date().toISOString(),
        user: Telegram.WebApp.initDataUnsafe.user
    };

    // Отправляем данные в Telegram
    Telegram.WebApp.sendData(JSON.stringify(finalOrder));

    // Очищаем корзину
    localStorage.removeItem('cart');
    displayCart();
    
    // Закрываем WebApp
    Telegram.WebApp.close();
}

// Привязка событий после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    // Привязка события для кнопки "На главную"
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Привязка события для кнопки "Назад"
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Привязка события для кнопки "Оформить заказ"
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', checkout);
    }

    // Загружаем корзину при открытии страницы
    displayCart();
});