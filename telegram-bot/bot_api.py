from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from utils import send_telegram_message

app = FastAPI()

class MessageRequest(BaseModel):
    chat_id: str
    message: str

@app.post("/send-message")
async def send_message(request: MessageRequest):
    """Принимает HTTP-запрос от backend и отправляет сообщение в Telegram"""
    try:
        response = await send_telegram_message(request.chat_id, request.message)
        return {"status": "success", "message": "Сообщение отправлено"} if response else {"status": "error", "message": "Ошибка отправки"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
