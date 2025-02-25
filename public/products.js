// Объявляем products в начале файла
const products = {
    women: [
        {
            id: 'w-tshirt',
            name: 'Футболка женская',
            description: 'Стильная футболка оверсайз из премиального хлопка. Идеально для повседневной носки.',
            price: 3499,
            image: {
                'Черный': 'images/women/tshirt/tshirt-black-1.jpg',
                'Белый': 'images/women/tshirt/tshirt-white-1.jpg',
                'Фуксия': 'images/women/tshirt/tshirt-fuchsia-1.jpg',
                'Зеленый': 'images/women/tshirt/tshirt-green-1.jpg'
            },
            gallery: {
                'Черный': [
                    'images/women/tshirt/tshirt-black-1.jpg',
                    'images/women/tshirt/tshirt-black-2.jpg',
                    'images/women/tshirt/tshirt-black-3.jpg',
                    'images/women/tshirt/tshirt-black-4.jpg',
                    'images/women/tshirt/tshirt-black-5.jpg'
                ],
                'Белый': [
                    'images/women/tshirt/tshirt-white-1.jpg',
                    'images/women/tshirt/tshirt-white-2.jpg',
                    'images/women/tshirt/tshirt-white-3.jpg',
                    'images/women/tshirt/tshirt-white-4.jpg',
                    'images/women/tshirt/tshirt-white-5.jpg',
                    'images/women/tshirt/tshirt-white-6.jpg'
                ],
                'Фуксия': [
                    'images/women/tshirt/tshirt-fuchsia-1.jpg',
                    'images/women/tshirt/tshirt-fuchsia-2.jpg',
                    'images/women/tshirt/tshirt-fuchsia-3.jpg',
                    'images/women/tshirt/tshirt-fuchsia-4.jpg',
                    'images/women/tshirt/tshirt-fuchsia-5.jpg',
                    'images/women/tshirt/tshirt-fuchsia-6.jpg'
                ],
                'Зеленый': [
                    'images/women/tshirt/tshirt-green-1.jpg',
                    'images/women/tshirt/tshirt-green-2.jpg',
                    'images/women/tshirt/tshirt-green-3.jpg',
                    'images/women/tshirt/tshirt-green-4.jpg',
                    'images/women/tshirt/tshirt-green-5.jpg',
                    'images/women/tshirt/tshirt-green-6.jpg'
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
            id: 'w-raincoat',
            name: 'Плащ-дождевик',
            description: 'Стильный и практичный дождевик из премиальной ткани Oxford.',
            price: 4999,
            image: {
                'Бежевый': 'images/women/raincoat/raincoat-beige-1.JPG'
            },
            gallery: {
                'Бежевый': [
                    'images/women/raincoat/raincoat-beige-1.JPG',
                    'images/women/raincoat/raincoat-beige-2.JPG',
                    'images/women/raincoat/raincoat-beige-3.JPG',
                    'images/women/raincoat/raincoat-beige-4.JPG',
                    'images/women/raincoat/raincoat-beige-5.JPG',
                    'images/women/raincoat/raincoat-beige-6.JPG'
                ]
            },
            sizes: ['S', 'M', 'L'],
            colors: [
                { name: 'Бежевый', code: '#F5F5DC' }
            ],
            composition: '100% Oxford'
        }
    ]
};

// Функция для получения параметра из URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Функция для добавления товара в корзину
function addToCart(product, size, color) {
    try {
        // Анимация кнопки
        const button = document.querySelector(`[data-product-id="${product.id}"] .add-to-cart-btn`);
        button.classList.add('adding');
        setTimeout(() => button.classList.remove('adding'), 300);

        // Создаем летящий элемент
        const productImage = document.querySelector(`[data-product-id="${product.id}"] .product-image`);
        const cartButton = document.querySelector('.cart-button');
        
        if (productImage && cartButton) {
            const flyingItem = document.createElement('img');
            flyingItem.src = product.gallery[color][0];
            flyingItem.classList.add('flying-item');
            
            // Начальная позиция (у товара)
            const startRect = productImage.getBoundingClientRect();
            flyingItem.style.top = startRect.top + 'px';
            flyingItem.style.left = startRect.left + 'px';
            
            document.body.appendChild(flyingItem);

            // Конечная позиция (у корзины)
            const endRect = cartButton.getBoundingClientRect();
            
            // Запускаем анимацию в следующем кадре
            requestAnimationFrame(() => {
                flyingItem.style.transform = 'scale(0.3)';
                flyingItem.style.top = endRect.top + 'px';
                flyingItem.style.left = endRect.left + 'px';
                
                // Удаляем элемент после анимации
                setTimeout(() => {
                    flyingItem.remove();
                    
                    // Анимируем кнопку корзины
                    cartButton.classList.add('updating');
                    setTimeout(() => cartButton.classList.remove('updating'), 500);
                    
                    // Добавляем товар в корзину
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const existingItem = cart.find(item => 
                        item.id === product.id && 
                        item.size === size && 
                        item.color === color
                    );

                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        cart.push({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            size: size,
                            color: color,
                            image: product.gallery[color][0],
                            quantity: 1
                        });
                    }

                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartButton();

                    // Показываем уведомление
                    Telegram.WebApp.showPopup({
                        title: 'Товар добавлен в корзину',
                        message: `${product.name} (${color}, ${size})`,
                        buttons: [
                            {type: 'default', text: 'Продолжить покупки'},
                            {type: 'ok', text: 'Перейти в корзину', id: 'go_to_cart'}
                        ]
                    }, (buttonId) => {
                        if (buttonId === 'go_to_cart') {
                            window.location.href = 'cart.html';
                        }
                    });
                }, 600);
            });
        }

    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
        Telegram.WebApp.showPopup({
            title: 'Ошибка',
            message: 'Не удалось добавить товар в корзину',
            buttons: [{type: 'ok', text: 'OK'}]
        });
    }
}

// Функция обновления кнопки корзины
function updateCartButton() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartButton = document.querySelector('.cart-button');
        
        if (cartButton) {
            cartButton.textContent = `🛒 Корзина (${totalItems})`;
        }

        // Обновляем MainButton если корзина не пуста
        if (totalItems > 0) {
            Telegram.WebApp.MainButton.setText('Перейти в корзину');
            Telegram.WebApp.MainButton.show();
        } else {
            Telegram.WebApp.MainButton.hide();
        }
    } catch (error) {
        console.error('Ошибка при обновлении корзины:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Инициализируем Telegram WebApp
        Telegram.WebApp.ready();
        
        // Настраиваем MainButton
        Telegram.WebApp.MainButton.setParams({
            text: 'Перейти в корзину',
            color: '#2196F3',
            text_color: '#ffffff'
        });

        // Обновляем состояние корзины
        updateCartButton();

    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }
});

// Функция для загрузки товаров
function loadProducts(category) {
    const productsContainer = document.getElementById('products-container');
    const categoryProducts = products[category];

    if (!categoryProducts) {
        productsContainer.innerHTML = '<p>Товары не найдены</p>';
        return;
    }

    productsContainer.innerHTML = '';
    categoryProducts.forEach(product => {
        const card = createProductCard(product);
        productsContainer.appendChild(card);
    });
}

// Добавим функцию для поиска товара по ID
function findProductById(productId) {
    for (const category in products) {
        const product = products[category].find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

// Загружаем товары при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const category = getQueryParam('category');
    if (category) {
        loadProducts(category);
    } else {
        loadProducts('women');
    }
});

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
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    // Используем первое фото из галереи для основного изображения
    const firstColor = product.colors[0].name;
    const mainImage = product.gallery[firstColor][0];

    // Начинаем предзагрузку остальных изображений
    preloadImages(product);

    card.innerHTML = `
        <div class="product-image-container">
            <img src="${mainImage}" alt="${product.name}" class="product-image">
            <div class="gallery-thumbs">
                ${product.gallery[firstColor].map((img, index) => `
                    <img src="${img}" 
                         class="thumb ${index === 0 ? 'active' : ''}" 
                         data-image="${img}"
                         alt="${product.name} - фото ${index + 1}">
                `).join('')}
            </div>
        </div>
        <div class="product-info">
            <h2 class="product-title">${product.name}</h2>
            <p class="product-description">${product.description}</p>
            <p class="product-composition">Состав: ${product.composition}</p>
            <div class="product-price">${product.price.toLocaleString()} ₽</div>
            
            <div class="product-options">
                ${product.colors.length > 1 ? `
                    <div class="color-selector">
                        <span>Цвет:</span>
                        <div class="color-options">
                            ${product.colors.map(color => `
                                <div class="color-option" 
                                     style="background-color: ${color.code}"
                                     data-color="${color.name}"
                                     title="${color.name}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${product.sizes.length > 1 ? `
                    <div class="size-selector">
                        <span>Размер:</span>
                        ${product.sizes.map(size => `
                            <div class="size-option" data-size="${size}">${size}</div>
                        `).join('')}
                    </div>
                ` : `<input type="hidden" class="selected-size" value="${product.sizes[0]}">`}
            </div>

            <button class="add-to-cart-btn">
                ${product.sizes.length > 1 ? 'Выбрать размер' : 'Добавить в корзину'}
            </button>
        </div>
    `;

    // Добавляем обработчики событий
    addProductEventListeners(card, product);

    return card;
}

function addProductEventListeners(card, product) {
    const image = card.querySelector('.product-image');
    const thumbs = card.querySelectorAll('.thumb');
    const colorOptions = card.querySelectorAll('.color-option');
    const sizeOptions = card.querySelectorAll('.size-option');
    const addToCartBtn = card.querySelector('.add-to-cart-btn');

    // Обработчик для миниатюр
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            image.src = thumb.dataset.image;
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // Обработчик для выбора цвета
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const color = option.dataset.color;
            const newGallery = product.gallery[color];
            
            // Обновляем основное изображение
            image.src = newGallery[0];
            
            // Обновляем миниатюры
            const thumbsContainer = card.querySelector('.gallery-thumbs');
            thumbsContainer.innerHTML = newGallery.map((img, index) => `
                <img src="${img}" 
                     class="thumb ${index === 0 ? 'active' : ''}" 
                     data-image="${img}"
                     alt="${product.name} - фото ${index + 1}">
            `).join('');

            // Обновляем обработчики для новых миниатюр
            const newThumbs = thumbsContainer.querySelectorAll('.thumb');
            newThumbs.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    image.src = thumb.dataset.image;
                    newThumbs.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            });

            // Обновляем активный цвет
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    // Обработчик для выбора размера
    if (sizeOptions.length > 0) {
        sizeOptions.forEach(option => {
            option.addEventListener('click', () => {
                sizeOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                addToCartBtn.textContent = 'Добавить в корзину';
            });
        });
    }

    // Обработчик для кнопки добавления в корзину
    addToCartBtn.addEventListener('click', () => {
        const selectedSize = card.querySelector('.size-option.selected')?.dataset.size || 
                           card.querySelector('.selected-size')?.value;
        const selectedColor = card.querySelector('.color-option.selected')?.dataset.color || 
                            product.colors[0].name;

        if (product.sizes.length > 1 && !selectedSize) {
            addToCartBtn.textContent = 'Выберите размер';
            return;
        }

        addToCart(product, selectedSize, selectedColor);
    });
}

// Функция для предварительной загрузки изображений
function preloadImages(product) {
    const images = [];
    Object.values(product.gallery).forEach(gallery => {
        gallery.forEach(src => {
            const img = new Image();
            img.src = src;
            images.push(img);
        });
    });
    return images;
}

// Обновляем функцию initializeProductCard
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
            Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            // Можно добавить визуальное выделение поля размера
            sizeOptions.forEach(opt => opt.classList.add('error-highlight'));
            return;
        }
        if (!selectedColor) {
            Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            // Можно добавить визуальное выделение поля цвета
            colorOptions.forEach(opt => opt.classList.add('error-highlight'));
            return;
        }

        const productId = productCard.dataset.productId;
        const product = findProductById(productId);
        
        // Предварительно загружаем все изображения товара
        const preloadedImages = preloadImages(product);

        // Добавляем индикатор загрузки
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        productCard.querySelector('.product-image-container').appendChild(loadingIndicator);

        // Скрываем индикатор после загрузки всех изображений
        Promise.all(preloadedImages.map(img => {
            return new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                }
            });
        })).then(() => {
            loadingIndicator.style.display = 'none';
            addToCart(product, selectedSize, selectedColor);
        });
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
        
        // Удаляем предыдущие классы анимации
        mainImage.classList.remove('fade-enter', 'fade-exit', 'slide-left', 'slide-right');
        
        // Добавляем новый класс анимации в зависимости от направления
        if (direction === 'next') {
            mainImage.classList.add('slide-left');
        } else {
            mainImage.classList.add('slide-right');
        }
        
        // Меняем изображение после начала анимации
        setTimeout(() => {
            mainImage.src = newSrc;
            modalImage.src = newSrc;
            
            // Обновляем активную миниатюру
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            
            currentIndex = index;
        }, 150);
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