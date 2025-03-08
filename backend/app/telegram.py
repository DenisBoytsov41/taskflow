import os
import requests
from loguru import logger

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

def send_telegram_message(chat_id: str, message: str):
    """Отправляет сообщение в Telegram пользователю"""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN не найден в .env")
        return

    data = {"chat_id": chat_id, "text": message}
    response = requests.post(TELEGRAM_API_URL, json=data)

    if response.status_code != 200:
        logger.error(f"Ошибка отправки сообщения: {response.text}")
    