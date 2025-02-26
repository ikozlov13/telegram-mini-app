document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    const cartButton = document.getElementById('cart-button');
    const categories = document.querySelectorAll('.category');

    if (cartButton) {
        cartButton.onclick = () => window.location.href = 'cart.html';
    }

    categories.forEach(category => {
        category.onclick = function() {
            const categoryId = this.id.split('-')[0];
            loadProducts(categoryId);
        };
    });

    if (typeof updateCartButton === 'function') {
        updateCartButton();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'women';
    loadProducts(initialCategory);

    const cartContainer = document.getElementById('cart-container');
    if (!cartContainer) return;
});

function removeItemFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
}

if (!cartContainer) return; 