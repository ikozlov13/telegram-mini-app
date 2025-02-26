async function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    // Добавляем плейсхолдер
    card.innerHTML = `
        <div class="product-image-container">
            <div class="image-placeholder"></div>
        </div>
    `;

    // Получаем оптимальные пути для изображений
    const firstColor = product.colors[0].name;
    const mainImagePath = await getOptimalImagePath(product.gallery[firstColor][0]);

    // Загружаем изображение
    try {
        const img = new Image();
        img.onload = () => {
            const container = card.querySelector('.product-image-container');
            container.innerHTML = '';
            img.className = 'product-image fade-in';
            container.appendChild(img);
        };
        img.src = mainImagePath;
    } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
    }

    // Добавляем остальную информацию о товаре
    const infoContainer = document.createElement('div');
    infoContainer.className = 'product-info';
    infoContainer.innerHTML = `
        <h2 class="product-title">${product.name}</h2>
        <p class="product-description">${product.description}</p>
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

        <button class="add-to-cart-btn" style="background-color: #2196F3">
            ${product.sizes.length > 1 ? 'Выбрать размер' : 'Добавить в корзину'}
        </button>
    `;

    card.appendChild(infoContainer);

    return card; // Убедитесь, что возвращается корректный DOM-узел
} 