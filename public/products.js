// Функция для получения параметра из URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Функция для загрузки товаров
function loadProducts() {
    const category = getQueryParam('category');
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

    // Привязка событий для кнопок "Купить"
    document.querySelectorAll('.product button').forEach(button => {
        button.addEventListener('click', () => {
            const product = button.closest('.product');
            const name = product.querySelector('h2').textContent;
            const price = parseFloat(product.querySelector('.price').textContent);
            const image = product.querySelector('img').src;
            addToCart(name, price, image, button);
        });
    });

    // Привязка события для кнопки корзины
    document.getElementById('cart-button').addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    // Привязка события для кнопки "Назад"
    document.getElementById('back-button').addEventListener('click', () => {
        window.history.back();
    });
}

// Загружаем товары при загрузке страницы
document.addEventListener('DOMContentLoaded', loadProducts);