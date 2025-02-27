class Product {
    constructor() {
        this.products = {
            womens: [
                {
                    id: 'w1',
                    name: 'Футболка женская',
                    description: 'Оверсайз, премиальный хлопок',
                    price: 3499,
                    colors: ['Черная', 'Белая', 'Фуксия', 'Зеленая'],
                    sizes: ['S', 'M', 'L', 'XL'],
                    images: {
                        'Черная': ['black_1.jpg', 'black_2.jpg'],
                        'Белая': ['white_1.jpg', 'white_2.jpg'],
                        'Фуксия': ['fuchsia_1.jpg', 'fuchsia_2.jpg'],
                        'Зеленая': ['green_1.jpg', 'green_2.jpg']
                    }
                },
                // Другие товары
            ],
            mens: [
                // Мужские товары
            ],
            home: [
                // Товары для дома
            ]
        };
    }

    getProductsByCategory(category) {
        return this.products[category] || [];
    }

    getProductById(id) {
        return Object.values(this.products)
            .flat()
            .find(product => product.id === id);
    }
}

module.exports = new Product();