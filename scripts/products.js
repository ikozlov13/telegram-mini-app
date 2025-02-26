const products = [
    // Женский раздел
    {
        id: 1,
        name: "Футболка женская",
        category: "women",
        size: "Оверсайз",
        composition: "92% хлопок, 8% эластан",
        colors: ["Черная", "Белая", "Фуксия", "Зеленая"],
        price: 3499,
    },
    {
        id: 2,
        name: "Костюм повседневный брюки+кардиган",
        category: "women",
        size: ["S", "M", "L", "XL"],
        composition: "Футер 3х нитка",
        colors: ["Графитовый", "Пудровый"],
        price: 7499,
    },
    {
        id: 3,
        name: "Халат вафельный клетка 7/7",
        category: "women",
        size: ["M-L", "XL", "XXL"],
        composition: "100% хлопок",
        colors: ["Бежевый", "Горчичный", "Темно-синий"],
        price: 3499,
    },
    {
        id: 4,
        name: "Рубашка женская",
        category: "women",
        size: "Оверсайз",
        composition: "100% лен",
        colors: ["Черная", "Темно-синяя", "Темно-зеленая"],
        price: 4990,
    },
    {
        id: 5,
        name: "Халат вафельный Бохо",
        category: "women",
        size: ["M-L", "XL", "XXL"],
        composition: "100% хлопок",
        colors: ["Белый", "Синий", "Шоколад"],
        price: 5499,
    },
    {
        id: 6,
        name: "Халат Полулен в полоску",
        category: "women",
        size: ["L", "XL"],
        composition: "50% лен, 50% хлопок",
        colors: ["Бежевый"],
        price: 5499,
    },
    {
        id: 7,
        name: "Плащ-дождевик",
        category: "women",
        size: "Оверсайз",
        composition: "100% Oxford",
        colors: ["Черный", "Бежевый", "Синий"],
        price: 4999,
    },

    // Мужской раздел
    {
        id: 8,
        name: "Футболка мужская",
        category: "men",
        size: ["L", "XL"],
        composition: "92% хлопок, 8% эластан",
        colors: ["Черная", "Белая", "Зеленая"],
        price: 3499,
    },
    {
        id: 9,
        name: "Халат вафельный Бохо",
        category: "men",
        size: ["M-L", "XL", "XXL"],
        composition: "100% хлопок",
        colors: ["Белый", "Синий", "Шоколад"],
        price: 5499,
    },

    // Домашний текстиль
    {
        id: 10,
        name: "Вафельные полотенца 2 шт",
        category: "home",
        size: "45х75",
        composition: "100% хлопок",
        colors: ["Белый", "Серый", "Бежевый"],
        price: 650,
    },
    {
        id: 11,
        name: "Скатерть Полулен",
        category: "home",
        size: "150х250",
        composition: "50% лен, 50% хлопок",
        colors: ["Бежевый"],
        price: 4199,
    },
    {
        id: 12,
        name: "Салфетки сервировочные 6 шт в подарочной упаковке",
        category: "home",
        size: "45х45",
        composition: "100% лен",
        colors: ["Белые"],
        price: 3599,
    },
];

// Функция для загрузки товаров по категории
function loadProducts(category) {
    const filteredProducts = products.filter(product => product.category === category);
    const productsContainer = document.getElementById('products-container');
    
    if (!productsContainer) return;
    
    productsContainer.innerHTML = ''; // Очищаем контейнер
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });

    // Добавляем обработчики для кнопок
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.onclick = function() {
            const productId = this.dataset.id;
            addToCart(productId);
        };
    });
}

// Функция для добавления товара в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} добавлен в корзину!`);
        updateCartButton();
    }
}

// Функция для обновления счетчика корзины
function updateCartButton() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Исправляем функцию createProductCard
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `
        <h3>${product.name}</h3>
        <p>Размер: ${Array.isArray(product.size) ? product.size.join(', ') : product.size}</p>
        <p>Состав: ${product.composition}</p>
        <p>Цвета: ${product.colors.join(', ')}</p>
        <p>Цена: ${product.price} руб.</p>
        <button class="add-to-cart" data-id="${product.id}">Добавить в корзину</button>
    `;
    return card;
}

// Удаляем проблемную функцию supportsWebP и связанный код
async function getOptimalImagePath(basePath) {
    return `${basePath}.webp`; // Просто возвращаем .webp без проверки
}