import os
import requests
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import User
from app.auth import get_db
from app.responses import success_response, bad_request_response, not_found_response
from ..schemas import SendMessageRequest, UnlinkRequest 

router = APIRouter()
TELEGRAM_BOT_URL = os.getenv("TELEGRAM_BOT_URL", "http://telegram-bot:8001/send-message")

@router.post("/subscribe")
def subscribe_telegram(data: dict, db: Session = Depends(get_db)):
    username = data.get("username")
    telegram_id = data.get("telegram_id")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return not_found_response("Пользователь не найден")

    user.telegram_id = telegram_id
    db.commit()

    return success_response({}, "Telegram успешно привязан")

@router.get("/subscribed-users")
def get_subscribed_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.telegram_id.isnot(None)).all()
    return success_response(
        data=[{"id": user.id, "username": user.username, "telegram_id": user.telegram_id} for user in users],
        message="Список подписанных пользователей"
    )

@router.post("/send-message")
def send_message_to_user(request: SendMessageRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        return not_found_response("Пользователь не найден")

    if not user.telegram_id:
        return bad_request_response("У пользователя не привязан Telegram")

    payload = {"chat_id": user.telegram_id, "message": request.message}
    response = requests.post(TELEGRAM_BOT_URL, json=payload)

    if response.status_code == 200:
        return success_response({}, "Сообщение успешно отправлено")
    else:
        return bad_request_response(f"Ошибка при отправке сообщения: {response.text}")

@router.post("/unlink")
def unlink_telegram(data: UnlinkRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        return not_found_response("Пользователь не найден")

    user.telegram_id = None
    db.commit()

    return success_response({}, "Telegram успешно отвязан")
