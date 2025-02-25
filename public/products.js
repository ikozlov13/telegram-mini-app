// Функция для получения параметра из URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Функция для добавления товара в корзину
function addToCart(product, selectedSize, selectedColor) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        color: selectedColor,
        quantity: 1
    };

    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = cart.find(item => 
        item.id === cartItem.id && 
        item.size === cartItem.size && 
        item.color === cartItem.color
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Показываем уведомление
    Telegram.WebApp.showPopup({
        title: 'Товар добавлен в корзину',
        message: `${product.name} (${selectedSize}, ${selectedColor})`,
        buttons: [{
            type: 'ok',
            text: 'Перейти в корзину'
        }]
    });
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
                addToCart(product, '', '');
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

function createProductCard(product) {
    const defaultColor = product.colors[0].name;
    const defaultImage = product.image[defaultColor];
    const defaultGallery = product.gallery?.[defaultColor] || [];

    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-container">
                <div class="product-gallery">
                    <img src="${defaultImage}" alt="${product.name}" class="product-image main-image">
                    <div class="gallery-thumbs">
                        <button class="gallery-nav prev">❮</button>
                        <div class="thumbs-container">
                            <img src="${defaultImage}" class="thumb active" data-image="${defaultImage}">
                            ${defaultGallery.map(img => `
                                <img src="${img}" class="thumb" data-image="${img}">
                            `).join('')}
                        </div>
                        <button class="gallery-nav next">❯</button>
                    </div>
                </div>
                <div class="product-badges">
                    ${product.isNew ? '<span class="badge new">New</span>' : ''}
                    ${product.discount ? `<span class="badge discount">-${product.discount}%</span>` : ''}
                </div>
            </div>
            <div class="product-info">
                <h2 class="product-title">${product.name}</h2>
                <p class="product-description">${product.description}</p>
                <p class="product-composition">Состав: ${product.composition}</p>
                
                <div class="product-options">
                    <div class="size-selector">
                        <label>Размер:</label>
                        <div class="size-options">
                            ${product.sizes.map(size => `
                                <button class="size-option" data-size="${size}">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="color-selector">
                        <label>Цвет:</label>
                        <div class="color-options">
                            ${product.colors.map(color => `
                                <div class="color-option ${color.name === defaultColor ? 'selected' : ''}" 
                                     data-color="${color.name}"
                                     data-image="${product.image[color.name]}"
                                     style="background-color: ${color.code}"
                                     title="${color.name}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="product-footer">
                    <p class="product-price">${product.price.toLocaleString()} ₽</p>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    `;
}

const products = {
    women: [
        {
            id: 'w-tshirt',
            name: 'Футболка женская',
            description: 'Стильная футболка оверсайз из премиального хлопка. Идеально для повседневной носки.',
            price: 3499,
            image: {
                'Черный': 'images/women/tshirt-black.jpg',
                'Белый': 'images/women/tshirt-white.jpg',
                'Фуксия': 'images/women/tshirt-fuchsia.jpg',
                'Зеленый': 'images/women/tshirt-green.jpg'
            },
            gallery: {
                'Черный': [
                    'images/women/tshirt-black-1.jpg',
                    'images/women/tshirt-black-2.jpg',
                    'images/women/tshirt-black-3.jpg'
                ],
                'Белый': [
                    'images/women/tshirt-white-1.jpg',
                    'images/women/tshirt-white-2.jpg',
                    'images/women/tshirt-white-3.jpg'
                ],
                'Фуксия': [
                    'images/women/tshirt-fuchsia-1.jpg',
                    'images/women/tshirt-fuchsia-2.jpg',
                    'images/women/tshirt-fuchsia-3.jpg'
                ],
                'Зеленый': [
                    'images/women/tshirt-green-1.jpg',
                    'images/women/tshirt-green-2.jpg',
                    'images/women/tshirt-green-3.jpg'
                ]
            },
            sizes: ['Оверсайз'],
            colors: [
                { name: 'Черный', code: '#000000' },
                { name: 'Белый', code: '#FFFFFF' },
                { name: 'Фуксия', code: '#FF1493' },
                { name: 'Зеленый', code: '#228B22' }
            ],
            composition: '92% хлопок, 8% эластан'
        },
        {
            id: 'w-suit',
            name: 'Костюм повседневный',
            description: 'Комфортный костюм из футера: брюки и кардиган. Идеален для отдыха и casual стиля.',
            price: 7499,
            image: {
                'Графитовый': 'images/women/suit-graphite.jpg',
                'Пудровый': 'images/women/suit-powder.jpg'
            },
            sizes: ['S', 'M', 'L', 'XL'],
            colors: [
                { name: 'Графитовый', code: '#474A51' },
                { name: 'Пудровый', code: '#F2D8D8' }
            ],
            composition: 'Футер 3х нитка'
        },
        {
            id: 'w-robe-check',
            name: 'Халат вафельный клетка 7/7',
            description: 'Комфортный вафельный халат в классическую клетку.',
            price: 3499,
            image: {
                'Бежевый': 'images/women/robe-check-beige.jpg',
                'Горчичный': 'images/women/robe-check-mustard.jpg',
                'Темно-синий': 'images/women/robe-check-navy.jpg'
            },
            sizes: ['M-L', 'XL', 'XXL'],
            colors: [
                { name: 'Бежевый', code: '#F5F5DC' },
                { name: 'Горчичный', code: '#FFD700' },
                { name: 'Темно-синий', code: '#000080' }
            ],
            composition: '100% хлопок'
        },
        {
            id: 'w-shirt',
            name: 'Рубашка женская',
            description: 'Элегантная рубашка из натурального льна. Идеальна для летнего сезона.',
            price: 4990,
            image: {
                'Черный': 'images/women/shirt-black.jpg',
                'Темно-синий': 'images/women/shirt-navy.jpg',
                'Темно-зеленый': 'images/women/shirt-green.jpg'
            },
            sizes: ['Оверсайз'],
            colors: [
                { name: 'Черный', code: '#000000' },
                { name: 'Темно-синий', code: '#000080' },
                { name: 'Темно-зеленый', code: '#006400' }
            ],
            composition: '100% лен'
        },
        // ... добавьте остальные товары из списка
    ],
    men: [
        {
            id: 'm-tshirt',
            name: 'Футболка мужская',
            description: 'Классическая футболка из премиального хлопка.',
            price: 3499,
            image: 'images/men/tshirt.jpg',
            sizes: ['L', 'XL'],
            colors: [
                { name: 'Черный', code: '#000000' },
                { name: 'Белый', code: '#FFFFFF' },
                { name: 'Зеленый', code: '#228B22' }
            ],
            composition: '92% хлопок, 8% эластан'
        }
    ],
    home: [
        {
            id: 'h-towels',
            name: 'Вафельные полотенца 2 шт',
            description: 'Комплект из двух вафельных полотенец.',
            price: 650,
            image: 'images/home/towels.jpg',
            sizes: ['45х75'],
            colors: [
                { name: 'Белый', code: '#FFFFFF' }
            ],
            composition: '100% хлопок'
        }
    ]
};

// Обработчик событий для карточки товара
function initializeProductCard(productCard) {
    const colorOptions = productCard.querySelectorAll('.color-option');
    const sizeOptions = productCard.querySelectorAll('.size-option');
    const productImage = productCard.querySelector('.product-image');
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    
    let selectedSize = null;
    let selectedColor = productCard.querySelector('.color-option.selected')?.dataset.color;

    // Обработка выбора цвета
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedColor = option.dataset.color;
            
            // Меняем изображение
            productImage.src = option.dataset.image;
            productImage.classList.add('fade');
            setTimeout(() => productImage.classList.remove('fade'), 300);
        });
    });

    // Обработка выбора размера
    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedSize = option.dataset.size;
        });
    });

    // Обработка добавления в корзину
    addToCartBtn.addEventListener('click', () => {
        if (!selectedSize) {
            Telegram.WebApp.showPopup({
                title: 'Выберите размер',
                message: 'Пожалуйста, выберите размер товара'
            });
            return;
        }
        if (!selectedColor) {
            Telegram.WebApp.showPopup({
                title: 'Выберите цвет',
                message: 'Пожалуйста, выберите цвет товара'
            });
            return;
        }

        const productId = productCard.dataset.productId;
        const product = findProductById(productId);
        addToCart(product, selectedSize, selectedColor);
    });
}

function initializeGallery(productCard) {
    const mainImage = productCard.querySelector('.main-image');
    const thumbs = productCard.querySelectorAll('.thumb');
    const prevBtn = productCard.querySelector('.gallery-nav.prev');
    const nextBtn = productCard.querySelector('.gallery-nav.next');
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
        <button class="gallery-nav prev">❮</button>
        <img class="modal-image" alt="Увеличенное фото">
        <button class="gallery-nav next">❯</button>
    `;
    document.body.appendChild(modal);

    const modalImage = modal.querySelector('.modal-image');
    const modalPrevBtn = modal.querySelector('.gallery-nav.prev');
    const modalNextBtn = modal.querySelector('.gallery-nav.next');

    let isZoomed = false;
    let currentIndex = 0;

    // Функция смены фото с анимацией
    function changeImage(index, direction = 'next') {
        const thumb = thumbs[index];
        const newSrc = thumb.dataset.image;
        
        // Добавляем класс для анимации
        mainImage.classList.add(direction === 'next' ? 'fade-exit' : 'fade-enter');
        modalImage.classList.add(direction === 'next' ? 'fade-exit' : 'fade-enter');
        
        setTimeout(() => {
            mainImage.src = newSrc;
            modalImage.src = newSrc;
            mainImage.classList.remove(direction === 'next' ? 'fade-exit' : 'fade-enter');
            modalImage.classList.remove(direction === 'next' ? 'fade-exit' : 'fade-enter');
        }, 300);

        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        currentIndex = index;
    }

    // Обработка зума
    modalImage.addEventListener('click', () => {
        isZoomed = !isZoomed;
        modalImage.classList.toggle('zoomed');
    });

    // Навигация по клавишам
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                updateGallery(-1);
            } else if (e.key === 'ArrowRight') {
                updateGallery(1);
            } else if (e.key === 'Escape') {
                modal.classList.remove('active');
            }
        }
    });

    // Обработка свайпов на мобильных
    let touchStartX = 0;
    let touchEndX = 0;

    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    modal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
            updateGallery(1); // свайп влево
        } else if (touchEndX - touchStartX > 50) {
            updateGallery(-1); // свайп вправо
        }
    });

    function updateGallery(direction) {
        const newIndex = (currentIndex + direction + thumbs.length) % thumbs.length;
        changeImage(newIndex, direction > 0 ? 'next' : 'prev');
    }

    // Обработчики событий
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => changeImage(index));
    });

    mainImage.addEventListener('click', () => {
        modalImage.src = mainImage.src;
        modal.classList.add('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            isZoomed = false;
            modalImage.classList.remove('zoomed');
        }
    });

    [prevBtn, modalPrevBtn].forEach(btn => {
        btn.addEventListener('click', () => updateGallery(-1));
    });

    [nextBtn, modalNextBtn].forEach(btn => {
        btn.addEventListener('click', () => updateGallery(1));
    });
}