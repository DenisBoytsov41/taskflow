import os
import logging
import asyncio
import aiohttp
from aiogram import Bot, Dispatcher, types, F
from aiogram.enums import ParseMode
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.client.default import DefaultBotProperties
from fastapi import FastAPI
import uvicorn
from bot_api import app as bot_api_app
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000")

bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()

@dp.message(Command("start"))
async def start_command(message: Message):
    chat_id = message.chat.id
    args = message.text.split(" ", 1)
    username = args[1].strip() if len(args) > 1 else None  

    if not username:
        await message.answer("❌ Ошибка: Не удалось получить имя пользователя. Попробуйте снова.")
        return

    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{BACKEND_URL}/users/subscribe",
            json={"username": username, "telegram_id": str(chat_id)}
        ) as response:
            try:
                content_type = response.headers.get("Content-Type", "")
                if "application/json" in content_type:
                    result = await response.json()
                else:
                    result = await response.text() 

                print(f"DEBUG API Response: {result} (type: {type(result)})")  

                if response.status == 200:
                    await message.answer(f"✅ {username}, ваш Telegram успешно привязан!")
                else:
                    error_message = result if isinstance(result, str) else result.get("detail", "Неизвестная ошибка")
                    await message.answer(f"❌ Ошибка привязки Telegram: {error_message}")
            except Exception as e:
                print(f"DEBUG ERROR: {e}")
                await message.answer(f"⚠️ Ошибка обработки ответа сервера: {str(e)}")

async def run_fastapi():
    """Запуск FastAPI внутри asyncio"""
    config = uvicorn.Config(bot_api_app, host="0.0.0.0", port=8001)
    server = uvicorn.Server(config)
    await server.serve()

async def main():
    """Основной асинхронный процесс"""
    asyncio.create_task(run_fastapi())
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())