// Функция для получения параметра из URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Функция для добавления товара в корзину
function addToCart(name, price, image, button) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productId = button.getAttribute('data-product-id');

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            id: productId,
            name: name, 
            price: price, 
            image: image, 
            quantity: 1 
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Меняем текст кнопки и обработчик только один раз
    if (button && button.textContent !== 'Перейти в корзину') {
        button.textContent = 'Перейти в корзину';
        // Удаляем старые обработчики
        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelector(`[data-product-id="${productId}"]`);
        newButton.addEventListener('click', handleGoToCart);
        newButton.style.backgroundColor = '#28a745';
    }
}

function handleGoToCart(event) {
    if (event) {
        event.preventDefault(); // Предотвращаем стандартное поведение
        event.stopPropagation(); // Останавливаем всплытие события
    }
    window.location.href = 'cart.html';
}

// Функция для загрузки товаров
function loadProducts() {
    const category = getQueryParam('category'); // Используем функцию getQueryParam
    const titleElement = document.getElementById('category-title');
    const productsContainer = document.getElementById('products-container');

    if (category === 'men') {
        titleElement.textContent = 'Мужская одежда';
        productsContainer.innerHTML = `
            <div class="product">
                <img src="images/men-product1.jpg" alt="Футболка">
                <h2>Футболка</h2>
                <p>Стильная футболка для повседневной носки.</p>
                <p class="price">1500 руб.</p>
                <button data-product-id="men-product1">Купить</button>
            </div>
            <div class="product">
                <img src="images/men-product2.jpg" alt="Джинсы">
                <h2>Джинсы</h2>
                <p>Классические джинсы для любого случая.</p>
                <p class="price">3000 руб.</p>
                <button data-product-id="men-product2">Купить</button>
            </div>
        `;
    } else if (category === 'women') {
        titleElement.textContent = 'Женская одежда';
        productsContainer.innerHTML = `
            <div class="product">
                <img src="images/women-product1.jpg" alt="Платье">
                <h2>Платье</h2>
                <p>Элегантное платье для вечеринки.</p>
                <p class="price">2500 руб.</p>
                <button data-product-id="women-product1">Купить</button>
            </div>
            <div class="product">
                <img src="images/women-product2.jpg" alt="Юбка">
                <h2>Юбка</h2>
                <p>Стильная юбка для офиса.</p>
                <p class="price">2000 руб.</p>
                <button data-product-id="women-product2">Купить</button>
            </div>
        `;
    } else if (category === 'home') {
        titleElement.textContent = 'Домашний текстиль';
        productsContainer.innerHTML = `
            <div class="product">
                <img src="images/home-product1.jpg" alt="Плед">
                <h2>Плед</h2>
                <p>Мягкий плед для уютного вечера.</p>
                <p class="price">1000 руб.</p>
                <button data-product-id="home-product1">Купить</button>
            </div>
            <div class="product">
                <img src="images/home-product2.jpg" alt="Подушка">
                <h2>Подушка</h2>
                <p>Комфортная подушка для сна.</p>
                <p class="price">800 руб.</p>
                <button data-product-id="home-product2">Купить</button>
            </div>
        `;
    } else {
        titleElement.textContent = 'Категория не найдена';
        productsContainer.innerHTML = '<p>Товары для этой категории отсутствуют.</p>';
    }

    // Изменяем привязку событий для кнопок "Купить"
    document.querySelectorAll('.product button').forEach(button => {
        // Удаляем старые обработчики
        button.replaceWith(button.cloneNode(true));
    });
    
    // Добавляем новые обработчики
    document.querySelectorAll('.product button').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const product = button.closest('.product');
            const name = product.querySelector('h2').textContent;
            const price = parseFloat(product.querySelector('.price').textContent);
            const image = product.querySelector('img').src;
            
            if (button.textContent === 'Перейти в корзину') {
                handleGoToCart(event);
            } else {
                addToCart(name, price, image, button);
            }
        });
    });
}

// Загружаем товары при загрузке страницы
document.addEventListener('DOMContentLoaded', loadProducts);

// Функция для оформления заказа
async function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Ваша корзина пуста!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const orderData = {
        items: cart,
        total: total,
        timestamp: new Date().toISOString()
    };

    try {
        // Отправляем данные в Telegram
        await Telegram.WebApp.sendData(JSON.stringify(orderData));
        
        // Показываем сообщение об успешном оформлении
        Telegram.WebApp.showPopup({
            title: 'Спасибо за заказ!',
            message: 'Мы свяжемся с вами в ближайшее время',
            buttons: [{
                type: 'close',
                text: 'Закрыть'
            }]
        });

        // Очищаем корзину
        localStorage.removeItem('cart');
        
        // Не закрываем WebApp автоматически
        // Telegram.WebApp.close();
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