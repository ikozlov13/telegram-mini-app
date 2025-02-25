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

    renderCart();
}

// Функция для отрисовки корзины
function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-container');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Ваша корзина пуста</p>';
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartContainer.innerHTML = `
        <div class="cart-items">
            ${cart.map((item, index) => `
                <div class="cart-item" data-index="${index}" data-product-id="${item.id}">
                    <img src="${item.image[item.color]}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Размер: ${item.size}</p>
                        <p>Цвет: ${item.color}</p>
                        <p>Цена: ${item.price} ₽</p>
                        <div class="quantity-controls">
                            <button class="quantity-minus">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-plus">+</button>
                        </div>
                        <button class="remove-button">Удалить</button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="delivery-section">
            <h3>Способ получения</h3>
            <div class="delivery-options">
                <label class="delivery-option">
                    <input type="radio" name="delivery" value="pickup" checked>
                    <span class="radio-custom"></span>
                    <div class="delivery-info">
                        <h4>Самовывоз</h4>
                        <p>г. Москва, ул. Примерная, д. 1</p>
                        <p>Бесплатно</p>
                    </div>
                </label>

                <label class="delivery-option">
                    <input type="radio" name="delivery" value="delivery">
                    <span class="radio-custom"></span>
                    <div class="delivery-info">
                        <h4>Доставка курьером</h4>
                        <p>Доставка в пределах МКАД</p>
                        <p>350 ₽</p>
                    </div>
                </label>
            </div>

            <div class="delivery-address" style="display: none;">
                <h4>Адрес доставки</h4>
                <div class="form-group">
                    <input type="text" id="phone" placeholder="Телефон" required>
                </div>
                <div class="form-group">
                    <input type="text" id="address" placeholder="Адрес" required>
                </div>
                <div class="form-group">
                    <input type="text" id="apartment" placeholder="Квартира/Офис">
                </div>
                <div class="form-group">
                    <textarea id="comment" placeholder="Комментарий к заказу"></textarea>
                </div>
            </div>
        </div>

        <div class="cart-summary">
            <div class="summary-row">
                <span>Товары (${cart.length})</span>
                <span>${total.toLocaleString()} ₽</span>
            </div>
            <div class="summary-row delivery-cost" style="display: none;">
                <span>Доставка</span>
                <span>350 ₽</span>
            </div>
            <div class="summary-row total">
                <span>Итого</span>
                <span class="total-amount">${total.toLocaleString()} ₽</span>
            </div>
            <button onclick="checkout()" class="checkout-btn">Оформить заказ</button>
        </div>
    `;

    addCartEventListeners();
    initializeDeliveryForm();

    // Обработчики для способа доставки
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    const deliveryAddress = document.querySelector('.delivery-address');
    const deliveryCost = document.querySelector('.delivery-cost');
    const totalAmount = document.querySelector('.total-amount');

    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'delivery') {
                deliveryAddress.style.display = 'block';
                deliveryCost.style.display = 'flex';
                totalAmount.textContent = `${(total + 350).toLocaleString()} ₽`;
            } else {
                deliveryAddress.style.display = 'none';
                deliveryCost.style.display = 'none';
                totalAmount.textContent = `${total.toLocaleString()} ₽`;
            }
        });
    });
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
async function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const deliveryType = document.querySelector('input[name="delivery"]:checked').value;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    let orderData = {
        items: cart,
        total: total,
        deliveryType: deliveryType,
        timestamp: new Date().toISOString()
    };

    if (deliveryType === 'delivery') {
        const deliveryForm = initializeDeliveryForm();
        
        if (!deliveryForm.validate()) {
            return;
        }

        const formValues = deliveryForm.getValues();
        orderData = {
            ...orderData,
            delivery: {
                cost: 350,
                ...formValues
            },
            total: total + 350
        };
    }

    try {
        await Telegram.WebApp.sendData(JSON.stringify(orderData));
        
        Telegram.WebApp.showPopup({
            title: 'Спасибо за заказ!',
            message: 'Мы свяжемся с вами в ближайшее время',
            buttons: [{
                type: 'close',
                text: 'Закрыть'
            }]
        });

        localStorage.removeItem('cart');
    } catch (error) {
        Telegram.WebApp.showPopup({
            title: 'Ошибка',
            message: 'Произошла ошибка при оформлении заказа',
            buttons: [{
                type: 'close',
                text: 'Закрыть'
            }]
        });
    }
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

function initializeDeliveryForm() {
    // Маска для телефона
    const phoneInput = document.getElementById('phone');
    const phoneMask = IMask(phoneInput, {
        mask: '+{7} (000) 000-00-00',
        lazy: false, // показывать маску сразу
        placeholderChar: '_' // символ для незаполненных мест
    });

    // Маска для адреса (только буквы, цифры и базовые символы)
    const addressInput = document.getElementById('address');
    const addressMask = IMask(addressInput, {
        mask: /^[а-яА-Я0-9\s\.,\-\/]+$/,
        prepare: (str) => str.trim(), // убираем пробелы в начале и конце
        commit: (value) => {
            // Автоматически делаем первую букву заглавной
            if (value) {
                addressInput.value = value.charAt(0).toUpperCase() + value.slice(1);
            }
        }
    });

    // Маска для квартиры/офиса
    const apartmentInput = document.getElementById('apartment');
    const apartmentMask = IMask(apartmentInput, {
        mask: /^[а-яА-Я0-9\s\-\/]+$/,
        prepare: (str) => str.trim()
    });

    // Улучшенная валидация
    function validatePhone(phone) {
        const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        return phoneRegex.test(phone);
    }

    function validateAddress(address) {
        // Минимум 10 символов, должен содержать улицу и номер дома
        const addressRegex = /^.+(?:улица|ул\.|проспект|пр-т|переулок|пер\.).+\d+/i;
        return address.length >= 10 && addressRegex.test(address);
    }

    function validateApartment(apartment) {
        // Необязательное поле, но если заполнено, должно быть корректным
        if (!apartment) return true;
        const apartmentRegex = /^[0-9а-яА-Я\-\/]+$/;
        return apartmentRegex.test(apartment);
    }

    // Улучшенная функция показа ошибок
    function showError(input, message) {
        clearError(input);
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);

        // Добавляем фокус на поле с ошибкой
        input.focus();
    }

    function clearError(input) {
        input.classList.remove('error');
        const errorMessage = input.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Обработчики ввода с мгновенной валидацией
    phoneInput.addEventListener('input', () => {
        clearError(phoneInput);
        if (phoneMask.unmaskedValue.length === 11) {
            if (!validatePhone(phoneMask.value)) {
                showError(phoneInput, 'Неверный формат номера');
            }
        }
    });

    addressInput.addEventListener('input', () => {
        clearError(addressInput);
        if (addressInput.value.length >= 10) {
            if (!validateAddress(addressInput.value)) {
                showError(addressInput, 'Укажите улицу и номер дома');
            }
        }
    });

    apartmentInput.addEventListener('input', () => {
        clearError(apartmentInput);
        if (apartmentInput.value && !validateApartment(apartmentInput.value)) {
            showError(apartmentInput, 'Неверный формат номера квартиры/офиса');
        }
    });

    // Подсказки при фокусе
    phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value) {
            phoneInput.placeholder = '+7 (___) ___-__-__';
        }
    });

    addressInput.addEventListener('focus', () => {
        if (!addressInput.value) {
            addressInput.placeholder = 'Например: улица Ленина 10';
        }
    });

    apartmentInput.addEventListener('focus', () => {
        if (!apartmentInput.value) {
            apartmentInput.placeholder = 'Например: 123 или 123А';
        }
    });

    // Возвращаем объект с методами
    return {
        validate: () => {
            let isValid = true;
            clearError(phoneInput);
            clearError(addressInput);
            clearError(apartmentInput);

            if (!validatePhone(phoneMask.value)) {
                showError(phoneInput, 'Введите корректный номер телефона');
                isValid = false;
            }

            if (!validateAddress(addressInput.value)) {
                showError(addressInput, 'Введите корректный адрес (улица и номер дома)');
                isValid = false;
            }

            if (apartmentInput.value && !validateApartment(apartmentInput.value)) {
                showError(apartmentInput, 'Неверный формат номера квартиры/офиса');
                isValid = false;
            }

            return isValid;
        },
        getValues: () => ({
            phone: phoneMask.value,
            address: addressInput.value,
            apartment: apartmentInput.value,
            comment: document.getElementById('comment').value.trim()
        }),
        reset: () => {
            phoneMask.value = '';
            addressInput.value = '';
            apartmentInput.value = '';
            document.getElementById('comment').value = '';
            [phoneInput, addressInput, apartmentInput].forEach(clearError);
        }
    };
}