// Функция для открытия категории
function openCategory(category) {
    console.log(`Выбрана категория: ${category}`);
    window.location.href = `products.html?category=${category}`;
}

// Привязка событий после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    // Привязка события для категории "Мужская одежда"
    document.getElementById('men-category').addEventListener('click', () => {
        openCategory('men');
    });

    // Привязка события для категории "Женская одежда"
    document.getElementById('women-category').addEventListener('click', () => {
        openCategory('women');
    });

    // Привязка события для категории "Домашний текстиль"
    document.getElementById('home-category').addEventListener('click', () => {
        openCategory('home');
    });
});