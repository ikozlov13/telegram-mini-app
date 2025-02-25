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
    
    // Заменяем showPopup на HapticFeedback и MainButton
    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    
    // Показываем кнопку "Перейти в корзину"
    const mainButton = Telegram.WebApp.MainButton;
    mainButton.text = "Перейти в корзину";
    mainButton.show();
    mainButton.onClick(() => handleGoToCart());
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
    const category = getQueryParam('category');
    const titleElement = document.getElementById('category-title');
    const productsContainer = document.getElementById('products-container');

    // Устанавливаем заголовок категории
    const titles = {
        'men': 'Мужская одежда',
        'women': 'Женская одежда',
        'home': 'Домашний текстиль'
    };
    titleElement.textContent = titles[category] || 'Категория не найдена';

    // Получаем товары для выбранной категории
    const categoryProducts = products[category] || [];

    if (categoryProducts.length > 0) {
        // Отображаем товары используя новый шаблон
        productsContainer.innerHTML = categoryProducts
            .map(product => createProductCard(product))
            .join('');

        // Инициализируем обработчики для каждой карточки
        document.querySelectorAll('.product-card').forEach(card => {
            initializeProductCard(card);
            initializeGallery(card);
        });
    } else {
        productsContainer.innerHTML = '<p>Товары для этой категории отсутствуют.</p>';
    }
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
                'Черный': 'images/women/tshirt/tshirt-black-1.jpg',  // Используем первое фото как основное
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
            id: 'w-suit',
            name: 'Костюм повседневный',
            description: 'Комфортный костюм из премиального футера: брюки и кардиган. Идеальное сочетание стиля и комфорта для повседневной носки. Свободный крой обеспечивает максимальное удобство.',
            price: 7499,
            image: {
                'Графитовый': 'images/women/suit/suit-graphite.jpg',
                'Пудровый': 'images/women/suit/suit-powder.jpg'
            },
            gallery: {
                'Графитовый': [
                    'images/women/suit/suit-graphite-1.jpg',
                    'images/women/suit/suit-graphite-2.jpg',
                    'images/women/suit/suit-graphite-3.jpg'
                ],
                'Пудровый': [
                    'images/women/suit/suit-powder-1.jpg',
                    'images/women/suit/suit-powder-2.jpg',
                    'images/women/suit/suit-powder-3.jpg'
                ]
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
            description: 'Комфортный вафельный халат в классическую клетку. Мягкая и приятная к телу ткань, отличная впитываемость. Практичный и стильный дизайн подойдет для дома и спа.',
            price: 3499,
            image: {
                'Бежевый': 'images/women/robe-check/robe-check-beige.jpg',
                'Горчичный': 'images/women/robe-check/robe-check-mustard.jpg',
                'Темно-синий': 'images/women/robe-check/robe-check-navy.jpg'
            },
            gallery: {
                'Бежевый': [
                    'images/women/robe-check/robe-check-beige-1.jpg',
                    'images/women/robe-check/robe-check-beige-2.jpg',
                    'images/women/robe-check/robe-check-beige-3.jpg'
                ],
                'Горчичный': [
                    'images/women/robe-check/robe-check-mustard-1.jpg',
                    'images/women/robe-check/robe-check-mustard-2.jpg',
                    'images/women/robe-check/robe-check-mustard-3.jpg'
                ],
                'Темно-синий': [
                    'images/women/robe-check/robe-check-navy-1.jpg',
                    'images/women/robe-check/robe-check-navy-2.jpg',
                    'images/women/robe-check/robe-check-navy-3.jpg'
                ]
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
            description: 'Элегантная рубашка из натурального льна. Свободный крой и натуральная ткань обеспечивают комфорт в жаркую погоду. Идеально сочетается как с деловым, так и с повседневным стилем.',
            price: 4990,
            image: {
                'Черный': 'images/women/shirt/shirt-black.jpg',
                'Темно-синий': 'images/women/shirt/shirt-navy.jpg',
                'Темно-зеленый': 'images/women/shirt/shirt-green.jpg'
            },
            gallery: {
                'Черный': [
                    'images/women/shirt/shirt-black-1.jpg',
                    'images/women/shirt/shirt-black-2.jpg',
                    'images/women/shirt/shirt-black-3.jpg'
                ],
                'Темно-синий': [
                    'images/women/shirt/shirt-navy-1.jpg',
                    'images/women/shirt/shirt-navy-2.jpg',
                    'images/women/shirt/shirt-navy-3.jpg'
                ],
                'Темно-зеленый': [
                    'images/women/shirt/shirt-green-1.jpg',
                    'images/women/shirt/shirt-green-2.jpg',
                    'images/women/shirt/shirt-green-3.jpg'
                ]
            },
            sizes: ['Оверсайз'],
            colors: [
                { name: 'Черный', code: '#000000' },
                { name: 'Темно-синий', code: '#000080' },
                { name: 'Темно-зеленый', code: '#006400' }
            ],
            composition: '100% лен'
        },
        {
            id: 'w-robe-boho',
            name: 'Халат вафельный Бохо',
            description: 'Стильный вафельный халат в этническом стиле Бохо. Уникальный дизайн с традиционными элементами, мягкая и приятная к телу ткань. Идеально подходит для дома и спа-процедур.',
            price: 5499,
            image: {
                'Белый': 'images/women/robe-boho/robe-white.jpg',
                'Синий': 'images/women/robe-boho/robe-blue.jpg',
                'Шоколад': 'images/women/robe-boho/robe-chocolate.jpg'
            },
            gallery: {
                'Белый': [
                    'images/women/robe-boho/robe-white-1.jpg',
                    'images/women/robe-boho/robe-white-2.jpg',
                    'images/women/robe-boho/robe-white-3.jpg'
                ],
                'Синий': [
                    'images/women/robe-boho/robe-blue-1.jpg',
                    'images/women/robe-boho/robe-blue-2.jpg',
                    'images/women/robe-boho/robe-blue-3.jpg'
                ],
                'Шоколад': [
                    'images/women/robe-boho/robe-chocolate-1.jpg',
                    'images/women/robe-boho/robe-chocolate-2.jpg',
                    'images/women/robe-boho/robe-chocolate-3.jpg'
                ]
            },
            sizes: ['M-L', 'XL', 'XXL'],
            colors: [
                { name: 'Белый', code: '#FFFFFF' },
                { name: 'Синий', code: '#000080' },
                { name: 'Шоколад', code: '#D2691E' }
            ],
            composition: '100% хлопок'
        },
        {
            id: 'w-robe-linen',
            name: 'Халат Полулен в полоску',
            description: 'Элегантный халат из смесовой ткани полулен с классическим полосатым узором. Сочетание льна и хлопка обеспечивает комфорт и долговечность. Отлично подходит для повседневной носки.',
            price: 4999,
            image: {
                'Бежевый': 'images/women/robe-linen/robe-linen-beige.jpg'
            },
            gallery: {
                'Бежевый': [
                    'images/women/robe-linen/robe-linen-beige-1.jpg',
                    'images/women/robe-linen/robe-linen-beige-2.jpg',
                    'images/women/robe-linen/robe-linen-beige-3.jpg'
                ]
            },
            sizes: ['L', 'XL'],
            colors: [
                { name: 'Бежевый', code: '#F5F5DC' }
            ],
            composition: '50% Лен, 50% Хлопок'
        },
        {
            id: 'w-raincoat',
            name: 'Плащ-дождевик',
            description: 'Практичный и стильный дождевик из премиальной ткани Oxford. Надежная защита от дождя, продуманный крой с капюшоном и карманами. Легко складывается в компактную сумочку.',
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
            sizes: ['Оверсайз'],
            colors: [
                { name: 'Бежевый', code: '#F5F5DC' }
            ],
            composition: '100% Oxford'
        }
    ],
    men: [
        {
            id: 'm-tshirt',
            name: 'Футболка мужская',
            description: 'Классическая футболка из премиального хлопка. Идеальная посадка и комфорт в носке. Подходит как для повседневной носки, так и для занятий спортом.',
            price: 3499,
            image: {
                'Черный': 'images/men/tshirt/tshirt-black.jpg',
                'Белый': 'images/men/tshirt/tshirt-white.jpg',
                'Зеленый': 'images/men/tshirt/tshirt-green.jpg'
            },
            gallery: {
                'Черный': [
                    'images/men/tshirt/tshirt-black-1.jpg',
                    'images/men/tshirt/tshirt-black-2.jpg',
                    'images/men/tshirt/tshirt-black-3.jpg'
                ],
                'Белый': [
                    'images/men/tshirt/tshirt-white-1.jpg',
                    'images/men/tshirt/tshirt-white-2.jpg',
                    'images/men/tshirt/tshirt-white-3.jpg'
                ],
                'Зеленый': [
                    'images/men/tshirt/tshirt-green-1.jpg',
                    'images/men/tshirt/tshirt-green-2.jpg',
                    'images/men/tshirt/tshirt-green-3.jpg'
                ]
            },
            sizes: ['L', 'XL'],
            colors: [
                { name: 'Черный', code: '#000000' },
                { name: 'Белый', code: '#FFFFFF' },
                { name: 'Зеленый', code: '#228B22' }
            ],
            composition: '92% хлопок, 8% эластан'
        },
        {
            id: 'm-robe-boho',
            name: 'Халат вафельный Бохо',
            description: 'Стильный мужской халат в этническом стиле Бохо. Уникальный дизайн, отличная впитываемость и комфорт. Идеально подходит для дома, бани и спа.',
            price: 5499,
            image: {
                'Белый': 'images/men/robe-boho/robe-white.jpg',
                'Синий': 'images/men/robe-boho/robe-blue.jpg',
                'Шоколад': 'images/men/robe-boho/robe-chocolate.jpg'
            },
            gallery: {
                'Белый': [
                    'images/men/robe-boho/robe-white-1.jpg',
                    'images/men/robe-boho/robe-white-2.jpg',
                    'images/men/robe-boho/robe-white-3.jpg'
                ],
                'Синий': [
                    'images/men/robe-boho/robe-blue-1.jpg',
                    'images/men/robe-boho/robe-blue-2.jpg',
                    'images/men/robe-boho/robe-blue-3.jpg'
                ],
                'Шоколад': [
                    'images/men/robe-boho/robe-chocolate-1.jpg',
                    'images/men/robe-boho/robe-chocolate-2.jpg',
                    'images/men/robe-boho/robe-chocolate-3.jpg'
                ]
            },
            sizes: ['M-L', 'XL', 'XXL'],
            colors: [
                { name: 'Белый', code: '#FFFFFF' },
                { name: 'Синий', code: '#000080' },
                { name: 'Шоколад', code: '#D2691E' }
            ],
            composition: '100% хлопок'
        }
    ],
    home: [
        {
            id: 'h-towels',
            name: 'Вафельные полотенца 2 шт',
            description: 'Комплект из двух высококачественных вафельных полотенец. Отличная впитываемость и быстрое высыхание. Идеально подходят для кухни и ванной комнаты. Не теряют форму после стирки.',
            price: 650,
            image: {
                'Белый': 'images/home/towels/towels-white.jpg'
            },
            sizes: ['45х75'],
            colors: [
                { name: 'Белый', code: '#FFFFFF' }
            ],
            composition: '100% хлопок'
        },
        {
            id: 'h-tablecloth',
            name: 'Скатерть Полулен',
            description: 'Элегантная скатерть из смесовой ткани полулен. Классический дизайн подходит для любого интерьера. Практичная в уходе, устойчива к загрязнениям. Прекрасно держит форму после стирки.',
            price: 4199,
            image: {
                'Бежевый': 'images/home/tablecloth/tablecloth-beige.jpg'
            },
            sizes: ['150х250'],
            colors: [
                { name: 'Бежевый', code: '#F5F5DC' }
            ],
            composition: '50% Лен, 50% хлопок'
        },
        {
            id: 'h-napkins',
            name: 'Салфетки сервировочные 6 шт',
            description: 'Комплект из 6 льняных салфеток премиального качества в подарочной упаковке. Идеальны для сервировки стола. Элегантный дизайн и натуральные материалы. Легко стираются и не требуют глажки.',
            price: 3599,
            image: {
                'Белый': 'images/home/napkins/napkins-white.jpg'
            },
            sizes: ['45х45'],
            colors: [
                { name: 'Белый', code: '#FFFFFF' }
            ],
            composition: '100% Лен'
        }
    ]
};

// Функция для предварительной загрузки изображений
function preloadImages(product) {
    const images = [];
    
    // Загружаем основные изображения
    Object.values(product.image).forEach(src => {
        const img = new Image();
        img.src = src;
        images.push(img);
    });

    // Загружаем изображения галереи
    if (product.gallery) {
        Object.values(product.gallery).forEach(gallery => {
            gallery.forEach(src => {
                const img = new Image();
                img.src = src;
                images.push(img);
            });
        });
    }

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