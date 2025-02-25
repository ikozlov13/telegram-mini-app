from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo, Message, KeyboardButton, ReplyKeyboardMarkup
from aiogram.filters import Command
import json
from datetime import datetime
import os
from dotenv import load_dotenv
import asyncio
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Загружаем токен из .env файла
load_dotenv()
TOKEN = os.getenv('BOT_TOKEN')
ADMIN_CHAT_ID = os.getenv('ADMIN_CHAT_ID')  # ID чата админа/группы для получения заказов

# Инициализация бота и диспетчера
bot = Bot(token=TOKEN)
dp = Dispatcher()  # Убираем параметр bot

# Регистрируем хендлеры
@dp.message(Command('start'))
async def start(message: types.Message):
    # Создаем веб-приложение
    web_app = WebAppInfo(url="https://telegram-mini-app-zog6.onrender.com")
    
    # Создаем кнопку с веб-приложением
    keyboard = [[KeyboardButton(text="Открыть магазин", web_app=web_app)]]
    
    # Создаем клавиатуру
    markup = ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True
    )
    
    await message.answer("Добро пожаловать в магазин одежды!", reply_markup=markup)

@dp.message(lambda msg: msg.web_app_data is not None)
async def handle_webapp_data(message: Message):
    try:
        # Получаем данные заказа
        data = json.loads(message.web_app_data.data)
        
        # Форматируем сообщение о заказе
        order_text = "🛍 Новый заказ!\n\n"
        order_text += f"👤 Покупатель: {message.from_user.full_name} (@{message.from_user.username})\n"
        order_text += f"📅 Дата: {datetime.fromisoformat(data['timestamp']).strftime('%d.%m.%Y %H:%M')}\n\n"
        
        # Добавляем информацию о товарах
        order_text += "📦 Товары:\n"
        for item in data['items']:
            order_text += f"- {item['name']} x{item['quantity']} = {item['price'] * item['quantity']} руб.\n"
        
        order_text += f"\n💰 Итого: {data['total']} руб."
        
        # Отправляем уведомление админу
        await bot.send_message(ADMIN_CHAT_ID, order_text)
        
        # Отправляем подтверждение покупателю
        customer_text = "✅ Ваш заказ успешно оформлен!\n\n"
        customer_text += "Мы свяжемся с вами в ближайшее время для подтверждения заказа."
        await message.answer(customer_text)
        
    except Exception as e:
        print(f"Ошибка при обработке заказа: {e}")
        await message.answer("❌ Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже.")

async def check_webhook():
    webhook_info = await bot.get_webhook_info()
    if webhook_info.url:
        logging.warning(f"Webhook обнаружен: {webhook_info.url}")
        logging.warning("Удаляем webhook...")
        await bot.delete_webhook()
    else:
        logging.info("Webhook не обнаружен")

async def main():
    logging.info("Starting bot cleanup...")
    
    # Принудительно закрываем все сессии
    try:
        await bot.session.close()
    except:
        pass
    
    # Пересоздаем сессию
    bot._session = None
    
    logging.info("Checking webhook...")
    await check_webhook()
    
    logging.info("Deleting webhook...")
    await bot.delete_webhook(drop_pending_updates=True)
    
    logging.info("Clearing updates...")
    try:
        await bot.get_updates(offset=-1, timeout=1)
    except:
        pass
    
    logging.info("Starting polling...")
    try:
        await dp.start_polling(
            bot,
            allowed_updates=dp.resolve_used_update_types(),
            skip_updates=True,
            timeout=30
        )
    finally:
        logging.info("Closing bot session...")
        await bot.session.close()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logging.info("Bot stopped!") 