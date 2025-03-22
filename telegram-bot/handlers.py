from aiogram import Router, types
from aiogram.filters import Command
import aiohttp
from config import BACKEND_URL
import logging

router = Router()

@router.message(Command("start"))
async def start_command(message: types.Message):
    logging.info(f"Пользователь {message.from_user.id} запустил бота")
    await message.answer("Привет! Я твой Telegram-бот")

@router.message(Command("info"))
async def info_command(message: types.Message):
    logging.info(f"Пользователь {message.from_user.id} запросил данные")

    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BACKEND_URL}/some-data") as response:
            if response.status == 200:
                data = await response.json()
                logging.debug(f"Получены данные: {data}")
                await message.answer(f"Вот твои данные: {data}")
            else:
                logging.error(f"Ошибка запроса данных: {await response.text()}")
                await message.answer("Ошибка получения данных от сервера")
