function formatPrice(price) {
    return `${price.toLocaleString('ru-RU')} руб.`;
}

module.exports = { formatPrice };