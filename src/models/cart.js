class Cart {
    constructor() {
        this.carts = {};
    }

    addToCart(userId, product, quantity = 1) {
        if (!this.carts[userId]) {
            this.carts[userId] = [];
        }
        const existingProduct = this.carts[userId].find(item => item.product.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            this.carts[userId].push({ product, quantity });
        }
    }

    getCart(userId) {
        return this.carts[userId] || [];
    }

    removeFromCart(userId, productId) {
        if (this.carts[userId]) {
            this.carts[userId] = this.carts[userId].filter(item => item.product.id !== productId);
        }
    }

    clearCart(userId) {
        this.carts[userId] = [];
    }
}

module.exports = new Cart();