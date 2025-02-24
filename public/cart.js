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
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Цена: ${item.price} руб.</p>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-button" onclick="removeFromCart(${item.id})">Удалить</button>
                </div>
            </div>
        `;
    });

    cartHTML += `<h3>Общая сумма: ${total} руб.</h3>`;
    cartContainer.innerHTML = cartHTML;
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

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    alert(`Заказ оформлен! Общая сумма: ${total} руб.`);
    localStorage.removeItem('cart');
    displayCart(); // Обновляем отображение корзины
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