import os
import aiohttp
from lib.utils.logger import logger
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

async def send_telegram_message(chat_id: str, message: str):
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN не найден в .env")
        return False

    data = {"chat_id": chat_id, "text": message}

    async with aiohttp.ClientSession() as session:
        async with session.post(TELEGRAM_API_URL, json=data) as response:
            if response.status == 200:
                logger.info(f"Сообщение отправлено пользователю {chat_id}")
                return True
            else:
                logger.error(f"Ошибка отправки сообщения: {await response.text()}")
                return False
