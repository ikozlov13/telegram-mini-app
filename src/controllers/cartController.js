class CartController {
    static carts = new Map(); // Временное хранение корзин в памяти

    // Получить корзину пользователя
    static getCart(userId) {
        if (!this.carts.has(userId)) {
            this.carts.set(userId, []);
        }
        return this.carts.get(userId);
    }

    // Добавить товар в корзину
    static addToCart(userId, product, quantity = 1) {
        const cart = this.getCart(userId);
        const existingItem = cart.find(item => item.product.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ product, quantity });
        }
        this.carts.set(userId, cart);
    }

    // Увеличить количество товара
    static increaseQuantity(userId, productId) {
        const cart = this.getCart(userId);
        const item = cart.find(item => item.product.id === productId);
        if (item) {
            item.quantity += 1;
        }
        this.carts.set(userId, cart);
    }

    // Уменьшить количество товара
    static decreaseQuantity(userId, productId) {
        const cart = this.getCart(userId);
        const item = cart.find(item => item.product.id === productId);
        if (item && item.quantity > 1) {
            item.quantity -= 1;
        } else if (item && item.quantity === 1) {
            this.removeFromCart(userId, productId);
            return;
        }
        this.carts.set(userId, cart);
    }

    // Удалить товар из корзины
    static removeFromCart(userId, productId) {
        const cart = this.getCart(userId);
        const updatedCart = cart.filter(item => item.product.id !== productId);
        this.carts.set(userId, updatedCart);
    }

    // Очистить корзину
    static clearCart(userId) {
        this.carts.set(userId, []);
    }

    // Получить общую стоимость корзины
    static getTotalPrice(userId) {
        const cart = this.getCart(userId);
        return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    // Получить количество товаров в корзине
    static getItemsCount(userId) {
        const cart = this.getCart(userId);
        return cart.reduce((total, item) => total + item.quantity, 0);
    }
}

module.exports = CartController;